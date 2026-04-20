/* ============================================================
 * Static port of the Buchinger Wilhelmi covariate dashboard.
 * Original behaviour lives in assets/clientside.js of the Dash
 * app; this file keeps the same logic, and adds:
 *   - CSV + reference-range loading (Papa Parse, fetch)
 *   - pre-computation of baseline ranges per parameter
 *   - a minimal renderer for Dash-component trees used by the
 *     analysis callback (Div / H4 / DataTable only)
 *   - biomarker reference-range overlay on boxplots
 *   - plain DOM event wiring in place of Dash callbacks
 * ============================================================ */

(function () {
    'use strict';

    /* ---------------- Configuration ---------------- */

    var BIOMARKER_CATEGORIES = {
        'Hepatic health': ['ALP [U/L]', 'GGT [U/L]', 'GOT AST [U/L]', 'GPT ALT [U/L]', 'FLI'],
        'Cardiometabolic profile': ['TC [mg/dL]', 'LDL [mg/dL]', 'HDL [mg/dL]', 'TG [mg/dL]',
                                    'SBP [mmHg]', 'DBP [mmHg]', 'glucose [mg/dL]',
                                    'HBA1C [mmol/mol]', 'TSH [µU/mL]'],
        'Body composition': ['BMI [kg/m²]', 'weight [kg]', 'WC [cm]'],
        'Renal function & Electrolytes': ['creatinine [mg/dL]', 'GFR [mL/min/1.73m²]',
                                          'urea [mg/dL]', 'uric acid [mg/dL]',
                                          'K [mmol/L]', 'Na [mmol/L]', 'Mg [mg/dL]', 'Ca [mg/dL]'],
        'Blood & Immunity': ['quick [%]', 'erythrocytes [T/L]', 'hemoglobin [g/dL]',
                             'hematocrit [%]', 'thrombocytes [G/L]',
                             'MCV [fL]', 'MCH [pg]', 'MCHC [g/dL]'],
        'Inflammation': ['CRP hs [mg/L]', 'ESR 1H [mm/h]', 'ESR 2H [mm/h]', 'leukocytes [G/L]']
    };

    var DISPLAY_NAMES = {
        'TC [mg/dL]': 'Total Cholesterol (mg/dL)',
        'LDL [mg/dL]': 'Low-Density Lipoprotein (mg/dL)',
        'HDL [mg/dL]': 'High-Density Lipoprotein (mg/dL)',
        'TG [mg/dL]': 'Triglycerides (mg/dL)',
        'SBP [mmHg]': 'Systolic Blood Pressure (mmHg)',
        'DBP [mmHg]': 'Diastolic Blood Pressure (mmHg)',
        'GOT AST [U/L]': 'Aspartate Aminotransferase (U/L)',
        'GPT ALT [U/L]': 'Alanine Aminotransferase (U/L)',
        'ALP [U/L]': 'Alkaline Phosphatase (U/L)',
        'GGT [U/L]': 'GGT (U/L)',
        'glucose [mg/dL]': 'Glucose (mg/dL)',
        'HBA1C [mmol/mol]': 'Hemoglobin A1c (mmol/mol)',
        'TSH [µU/mL]': 'TSH (µU/mL)',
        'BMI [kg/m²]': 'Body Mass Index (kg/m²)',
        'weight [kg]': 'Weight (kg)',
        'WC [cm]': 'Waist Circumference (cm)',
        'creatinine [mg/dL]': 'Creatinine (mg/dL)',
        'GFR [mL/min/1.73m²]': 'Glomerular Filtr. Rate (mL/min/1.73m²)',
        'urea [mg/dL]': 'Urea (mg/dL)',
        'uric acid [mg/dL]': 'Uric Acid (mg/dL)',
        'K [mmol/L]': 'Potassium (mmol/L)',
        'Na [mmol/L]': 'Sodium (mmol/L)',
        'Mg [mg/dL]': 'Magnesium (mg/dL)',
        'Ca [mg/dL]': 'Calcium (mg/dL)',
        'quick [%]': 'Quick Test (%)',
        'erythrocytes [T/L]': 'Erythrocytes (T/L)',
        'hemoglobin [g/dL]': 'Hemoglobin (g/dL)',
        'hematocrit [%]': 'Hematocrit (%)',
        'thrombocytes [G/L]': 'Thrombocytes (G/L)',
        'MCV [fL]': 'Mean Corp. Volume (fL)',
        'MCH [pg]': 'Mean Corp. Hemoglobin (pg)',
        'MCHC [g/dL]': 'Mean Corp. Hemoglobin Conc (g/dL)',
        'CRP hs [mg/L]': 'C-Reactive Protein High-Sens. (mg/L)',
        'ESR 1H [mm/h]': 'Erythrocyte Sedim. Rate 1H (mm/h)',
        'ESR 2H [mm/h]': 'Erythrocyte Sedim. Rate 2H (mm/h)',
        'leukocytes [G/L]': 'Leukocytes (G/L)',
        'FLI': 'Fatty Liver Index'
    };

    function formatParameterName(p) {
        return DISPLAY_NAMES[p] || (p || '').replace('[', '(').replace(']', ')');
    }

    /* ---------------- Shared state ---------------- */

    var STATE = {
        data: [],              // array of rows from the CSV
        referenceRanges: {},   // Biomarker -> {low, high, normal_range}
        baselineRanges: {},    // parameter -> {min, max, observed_min, observed_max}
        filters: {
            age_cat: null,
            bmi_cat: null,
            sex: null,
            parameter: 'glucose [mg/dL]',
            baselineRange: [0, 100]
        },
        groupingTab: 'duration',
        sankeyA: 'gender',
        sankeyB: 'fasting'
    };

    /* ---------------- Tiny Dash component renderer ----------------
     * The clientside logic (copied almost verbatim below) builds
     * trees like { type: 'Div', namespace: 'dash_html_components',
     * props: { children: [...], ... } } plus { type: 'DataTable',
     * namespace: 'dash_table', props: {...} }. This renderer turns
     * those trees into real DOM nodes so we don't need Dash.
     * -------------------------------------------------------------- */

    function camelToKebab(key) {
        return key.replace(/([A-Z])/g, function (m) { return '-' + m.toLowerCase(); });
    }

    function applyStyle(el, styleObj) {
        if (!styleObj) return;
        Object.keys(styleObj).forEach(function (k) {
            el.style[k] = styleObj[k];
        });
    }

    function appendChild(parent, child) {
        if (child === null || child === undefined || child === false || child === '') return;
        if (Array.isArray(child)) {
            child.forEach(function (c) { appendChild(parent, c); });
            return;
        }
        if (typeof child === 'string' || typeof child === 'number') {
            parent.appendChild(document.createTextNode(String(child)));
            return;
        }
        if (child.nodeType) {
            parent.appendChild(child);
            return;
        }
        // Dash-shaped tree
        parent.appendChild(renderNode(child));
    }

    function renderNode(node) {
        if (!node || typeof node !== 'object') {
            return document.createTextNode(String(node == null ? '' : node));
        }
        var type = (node.type || '').toString();
        var props = node.props || {};

        // DataTable from dash_table — render as a plain HTML table
        if (type === 'DataTable') {
            return renderDataTable(props);
        }

        var tag;
        switch (type.toUpperCase()) {
            case 'DIV':   tag = 'div'; break;
            case 'SPAN':  tag = 'span'; break;
            case 'P':     tag = 'p'; break;
            case 'H1':    tag = 'h1'; break;
            case 'H2':    tag = 'h2'; break;
            case 'H3':    tag = 'h3'; break;
            case 'H4':    tag = 'h4'; break;
            case 'H5':    tag = 'h5'; break;
            case 'H6':    tag = 'h6'; break;
            case 'LABEL': tag = 'label'; break;
            case 'BUTTON':tag = 'button'; break;
            default:      tag = 'div';
        }

        var el = document.createElement(tag);
        if (props.id) el.id = props.id;
        if (props.className) el.className = props.className;
        if (props.style) applyStyle(el, props.style);
        appendChild(el, props.children);
        return el;
    }

    function renderDataTable(props) {
        var wrap = document.createElement('div');
        wrap.style.overflowX = 'auto';
        if (props.style_table) applyStyle(wrap, props.style_table);

        var table = document.createElement('table');
        table.className = 'data-table';

        // Header
        var thead = document.createElement('thead');
        var trh = document.createElement('tr');
        (props.columns || []).forEach(function (col) {
            var th = document.createElement('th');
            th.textContent = col.name || col.id;
            if (props.style_header) applyStyle(th, props.style_header);
            if (props.style_cell)   applyStyle(th, props.style_cell);
            trh.appendChild(th);
        });
        thead.appendChild(trh);
        table.appendChild(thead);

        // Body
        var tbody = document.createElement('tbody');
        (props.data || []).forEach(function (row) {
            var tr = document.createElement('tr');
            (props.columns || []).forEach(function (col) {
                var td = document.createElement('td');
                var val = row[col.id];
                td.textContent = (val === undefined || val === null) ? '' : val;
                if (props.style_cell) applyStyle(td, props.style_cell);
                if (props.style_data) applyStyle(td, props.style_data);
                (props.style_data_conditional || []).forEach(function (cond) {
                    if (cond['if'] && cond['if'].column_id === col.id) {
                        var cc = Object.assign({}, cond);
                        delete cc['if'];
                        applyStyle(td, cc);
                    }
                });
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
        return wrap;
    }

    function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

    /* =========================================================
     * Ported logic from assets/clientside.js (UI namespace)
     * - trimmed where it called Dash-specific APIs
     * - plot-rendering calls Highcharts directly (as before)
     * - boxplot now adds reference-range plot-bands when known
     * ========================================================= */

    var UI = {};

    UI.updateAnalysis = function (data, groupingTab, age_cat, bmi_cat, sex, parameter, baselineRange) {
        if (!data || !parameter) {
            return [{
                type: 'Div', namespace: 'dash_html_components',
                props: { children: [{
                    type: 'H4', namespace: 'dash_html_components',
                    props: { children: 'Select a parameter to start the analysis',
                             style: { color: '#6c757d', marginBottom: '20px', textAlign: 'center' } }
                }] }
            }, ''];
        }

        var grouping = groupingTab || 'duration';
        var xField, CATEGORY_ORDER, CATEGORY_SHORT, CATEGORY_LABELS;
        if (grouping === 'gender') {
            xField = 'sex'; CATEGORY_ORDER = ['M','F']; CATEGORY_SHORT = ['Male','Female'];
            CATEGORY_LABELS = ['<b>Male</b>','<b>Female</b>'];
        } else if (grouping === 'bmi') {
            xField = 'BMI_cat';
            CATEGORY_ORDER   = ['Normal (18–24.9 kg/m²)','Overweight (25.0–29.9 kg/m²)','Obesity (≥30 kg/m²)'];
            CATEGORY_SHORT   = ['Normal','Overweight','Obesity'];
            CATEGORY_LABELS  = ['<b>Normal</b><br/>(18–24.9)','<b>Overweight</b><br/>(25.0–29.9)','<b>Obesity</b><br/>(≥30)'];
        } else if (grouping === 'age') {
            xField = 'age_cat';
            CATEGORY_ORDER   = ['Young adults (18-34 years)','Middle age (35-64 years)','Older adults (≥65 years)'];
            CATEGORY_SHORT   = ['18-34','35-64','65+'];
            CATEGORY_LABELS  = ['<b>Young Adults</b><br/>(18-34)','<b>Middle Adults</b><br/>(35-64)','<b>Older Adults</b><br/>(65+)'];
        } else {
            xField = 'length_of_fasting_cat';
            CATEGORY_ORDER   = ['3-7 days','8-12 days','13-17 days','18+ days'];
            CATEGORY_SHORT   = ['3-7','8-12','13-17','18+'];
            CATEGORY_LABELS  = ['<b>3-7</b><br/>days','<b>8-12</b><br/>days','<b>13-17</b><br/>days','<b>18+</b><br/>days'];
        }

        if (!parameter || String(parameter).startsWith('_cat_')) return ['', ''];
        var p = parameter;

        var rows = data.filter(function (r) {
            var ok = true;
            if (age_cat) ok = ok && r.age_cat === age_cat;
            if (bmi_cat) ok = ok && r.BMI_cat === bmi_cat;
            if (sex)     ok = ok && r.sex === sex;
            return ok;
        });

        var byId = {};
        rows.forEach(function (r) {
            var id = r.meta_id;
            if (!byId[id]) {
                byId[id] = {
                    pre: {}, post: {},
                    meta: {
                        length_of_fasting_cat: r.length_of_fasting_cat,
                        sex: r.sex, BMI_cat: r.BMI_cat, age_cat: r.age_cat
                    }
                };
            }
            var tp = r.timepoint;
            var v = r[p];
            if (v !== null && v !== undefined && v !== '') {
                if (tp === 'Pre')  byId[id].pre[p]  = Number(v);
                if (tp === 'Post') byId[id].post[p] = Number(v);
            }
        });

        var baselineMin = (baselineRange && baselineRange.length >= 2) ? Number(baselineRange[0]) : null;
        var baselineMax = (baselineRange && baselineRange.length >= 2) ? Number(baselineRange[1]) : null;

        var xs = [], ys = [], patientIds = [];
        var perCat = {}, baselinePerCat = {};
        CATEGORY_ORDER.forEach(function (c) { perCat[c] = []; baselinePerCat[c] = []; });
        Object.keys(byId).forEach(function (id) {
            var rec = byId[id];
            var catKey = rec.meta[xField];
            if (rec.pre[p] !== undefined && rec.post[p] !== undefined && catKey) {
                var bv = rec.pre[p];
                var inRange = true;
                if (baselineMin !== null && baselineMax !== null && isFinite(baselineMin) && isFinite(baselineMax)) {
                    inRange = (bv >= baselineMin && bv <= baselineMax);
                }
                if (inRange) {
                    var delta = rec.post[p] - rec.pre[p];
                    if (CATEGORY_ORDER.indexOf(catKey) !== -1 && isFinite(delta)) {
                        xs.push(catKey); ys.push(delta); patientIds.push(id);
                        perCat[catKey].push(delta);
                        baselinePerCat[catKey].push(bv);
                    }
                }
            }
        });

        // z-score outlier trim for noisy liver enzymes
        var OUTLIER_PARAMS = { 'GOT AST [U/L]': true, 'GPT ALT [U/L]': true, 'GGT [U/L]': true };
        if (OUTLIER_PARAMS[p]) {
            var xs2=[], ys2=[], ids2=[];
            CATEGORY_ORDER.forEach(function (cat) {
                var arr = perCat[cat];
                if (arr.length > 1) {
                    var m = arr.reduce(function(a,b){return a+b;},0) / arr.length;
                    var variance = arr.reduce(function(a,b){return a + Math.pow(b-m,2);},0) / (arr.length - 1);
                    var sd = Math.sqrt(Math.max(variance, 0));
                    perCat[cat] = (sd > 0) ? arr.filter(function(v){ return Math.abs((v-m)/sd) <= 3.5; }) : arr;
                }
                var catIdx = [];
                for (var j = 0; j < xs.length; j++) if (xs[j] === cat) catIdx.push(j);
                (perCat[cat] || []).forEach(function (v, idx) {
                    xs2.push(cat); ys2.push(v);
                    if (catIdx[idx] !== undefined) ids2.push(patientIds[catIdx[idx]]);
                });
            });
            xs = xs2; ys = ys2; patientIds = ids2;
        }

        function quantile(arr, q) {
            var a = arr.slice().sort(function(a,b){return a-b;});
            var pos = (a.length - 1) * q, base = Math.floor(pos), rest = pos - base;
            if (a[base+1] !== undefined) return a[base] + rest*(a[base+1]-a[base]);
            return a[base];
        }
        function fiveNum(arr) {
            if (!arr || !arr.length) return [null,null,null,null,null];
            return [Math.min.apply(null,arr), quantile(arr,0.25), quantile(arr,0.5), quantile(arr,0.75), Math.max.apply(null,arr)];
        }

        var seriesData = CATEGORY_ORDER.map(function (cat) { return fiveNum(perCat[cat]); });
        var counts     = CATEGORY_ORDER.map(function (cat) { return (perCat[cat]||[]).length; });

        var scatterData = [];
        xs.forEach(function (cat, i) {
            var idx = CATEGORY_ORDER.indexOf(cat);
            if (idx >= 0 && isFinite(ys[i])) scatterData.push({ x: idx, y: ys[i] });
        });
        var totalPatients = scatterData.length;

        // --- Compute a baseline reference band (delta-from-reference) to show on the change chart ---
        // Displays as plot bands on the y-axis: if post-value stays inside the reference
        // range, delta is bounded by (low - currentBaseline) and (high - currentBaseline).
        // We draw bands relative to the mean baseline per group to give a sense of
        // "neutral zone". This is a light visual hint, not a statistical claim.
        var refRange = STATE.referenceRanges && STATE.referenceRanges[p];
        var yPlotBands = [];
        if (refRange && (refRange.low !== undefined || refRange.high !== undefined)) {
            var allBaselines = [];
            CATEGORY_ORDER.forEach(function(cat){ allBaselines = allBaselines.concat(baselinePerCat[cat] || []); });
            if (allBaselines.length) {
                var meanBaseline = allBaselines.reduce(function(a,b){return a+b;},0) / allBaselines.length;
                var bandFrom = (refRange.low  !== null && refRange.low  !== undefined) ? (refRange.low  - meanBaseline) : null;
                var bandTo   = (refRange.high !== null && refRange.high !== undefined) ? (refRange.high - meanBaseline) : null;
                if (bandFrom !== null && bandTo !== null) {
                    yPlotBands.push({
                        from: Math.min(bandFrom, bandTo),
                        to:   Math.max(bandFrom, bandTo),
                        color: 'rgba(80, 227, 194, 0.12)',
                        borderColor: 'rgba(80, 200, 120, 0.9)',
                        borderWidth: 1.5,
                        dashStyle: 'Dash',
                        zIndex: 1,
                        label: {
                            text: 'Reference range (normal): '
                                  + (refRange.normal_range || (refRange.low + '–' + refRange.high)),
                            style: { color: '#3a7d5a', fontSize: '11px' },
                            align: 'right', x: -8, y: 12
                        }
                    });
                }
            }
        }

        var mountId = 'hc_' + p.replace(/[^a-zA-Z0-9_]/g,'_');
        var vw = (typeof window !== 'undefined') ? window.innerWidth : 1024;
        var isMobile = vw <= 768;
        var chartCard = {
            type: 'Div', namespace: 'dash_html_components',
            props: {
                className: 'chart-card',
                style: { width:'100%', margin:'0px 0px', display:'flex',
                         justifyContent:'center', alignItems:'center' },
                children: [
                    { type:'Div', namespace:'dash_html_components',
                      props:{ id: mountId,
                              style:{ height: isMobile ? '400px' : '450px',
                                      width:'100%', maxWidth:'800px' } } }
                ]
            }
        };

        // Imperatively mount Highcharts after render
        setTimeout(function () {
            if (!window.Highcharts) return;
            var existing = window.Highcharts.charts && window.Highcharts.charts.find(function (ch) {
                return ch && ch.renderTo && ch.renderTo.id === mountId;
            });
            if (existing) {
                if (existing._resizeHandler) window.removeEventListener('resize', existing._resizeHandler);
                existing.destroy();
            }

            var vw2 = window.innerWidth, isMobile2 = vw2 <= 768;
            var chart = window.Highcharts.chart(mountId, {
                chart: {
                    type: 'boxplot', backgroundColor:'white',
                    spacingLeft: 0, spacingRight: 10,
                    panning: false, pinchType: '', zooming:{enabled:false},
                    animation:{duration:400}, inverted: !isMobile2
                },
                title: {
                    text: 'Changes in ' + formatParameterName(p)
                        + '     <span style="font-size: 0.85em; font-weight: bold; color: #666;"><br>  n='
                        + totalPatients + '</span>',
                    useHTML:true,
                    style:{ fontSize:(isMobile2?'13px':'15px'),
                            fontFamily:'"Playfair Display", Georgia, serif' }
                },
                plotOptions: {
                    series: { enableMouseTracking:true, stickyTracking:false,
                              states:{hover:{enabled:true}}, animation:{duration:400}, cursor:'pointer' },
                    boxplot: { enableMouseTracking:true, animation:{duration:400} },
                    scatter: { enableMouseTracking:true, animation:{duration:300} }
                },
                xAxis: { categories: CATEGORY_LABELS, title:{text:null}, labels:{useHTML:true} },
                yAxis: {
                    title:{ text:'Changes (Post - Pre)' },
                    plotLines: [{ value:0, color:'#888', dashStyle:'dashed', width:2.5, zIndex:0 }],
                    plotBands: yPlotBands
                },
                accessibility:{enabled:true}, legend:{enabled:false}, credits:{enabled:false},
                tooltip: {
                    enabled:true, followTouchMove:false,
                    formatter: function () {
                        function fmt(v){ var av=Math.abs(v); var d = av>=100?0:(av>=10?1:(av>=1?2:3));
                                         return Highcharts.numberFormat(v,d); }
                        var idx = (typeof this.point.x === 'number') ? this.point.x : this.point.index;
                        if (idx == null) idx = 0;
                        var bp = this.series && this.series.chart && this.series.chart.series[0];
                        var bpPt = bp && bp.points && bp.points[idx];
                        var med = (bpPt && typeof bpPt.median === 'number') ? bpPt.median
                                  : (typeof this.point.median === 'number' ? this.point.median : null);
                        var n = (counts && counts[idx]) ? counts[idx] : 0;
                        return '<b>Median:</b> ' + (med==null?'—':fmt(med)) + '<br/><b>n:</b> ' + n;
                    }
                },
                series: [
                    { name:'Delta', type:'boxplot', data: seriesData, whiskerWidth:0,
                      lineWidth:1.5, color:'rgba(50,50,50,1)' },
                    { name:'Individuals', type:'scatter', data: scatterData,
                      jitter:{x:0.24,y:0}, marker:{radius:3.5, lineWidth:0.5},
                      opacity: 0.45, tooltip:{enabled:false},
                      states:{hover:{enabled:false}, inactive:{opacity:1}},
                      showInLegend:false }
                ]
            });

            // Responsive inverted switch (same as original)
            var timer = null;
            chart._lastIsMobile = isMobile2;
            var resize = function () {
                if (timer) clearTimeout(timer);
                timer = setTimeout(function () {
                    if (!chart || chart.destroyed) return;
                    var isM = window.innerWidth <= 768;
                    if (isM === chart._lastIsMobile) return;
                    chart._lastIsMobile = isM;
                    chart.update({ chart: { inverted: !isM } }, true);
                }, 300);
            };
            window.addEventListener('resize', resize, { passive:true });
            chart._resizeHandler = resize;

            // Add a small legend below the chart if a reference band was drawn
            if (yPlotBands.length) {
                var legendId = mountId + '_ref_legend';
                var prevLegend = document.getElementById(legendId);
                if (prevLegend) prevLegend.parentNode.removeChild(prevLegend);
                var legend = document.createElement('div');
                legend.id = legendId;
                legend.className = 'reference-range-legend';
                legend.innerHTML = '<span class="swatch"></span>'
                    + 'Highlighted band shows where the <b>Post</b> value would fall inside the normal reference range '
                    + '<i>(' + (refRange.normal_range || (refRange.low + '–' + refRange.high)) + ')</i> '
                    + 'for a patient whose baseline equals the cohort mean.';
                var mountEl = document.getElementById(mountId);
                if (mountEl && mountEl.parentNode) mountEl.parentNode.appendChild(legend);
            }
        }, 0);

        // Build summary table rows
        var tableRows = {};
        CATEGORY_ORDER.forEach(function (cat) {
            var arr = perCat[cat];
            var base = baselinePerCat[cat];
            tableRows[cat] = {};

            if (base && base.length) {
                var bMean = base.reduce(function(a,b){return a+b;},0) / base.length;
                var bVar  = base.reduce(function(a,b){return a + Math.pow(b-bMean,2);},0) / (base.length - 1 || 1);
                tableRows[cat][p + '_baseline'] = bMean.toFixed(2) + ' ± ' + Math.sqrt(bVar).toFixed(2);
            } else {
                tableRows[cat][p + '_baseline'] = 'N/A';
            }

            if (arr && arr.length) {
                var m  = arr.reduce(function(a,b){return a+b;},0) / arr.length;
                var vv = arr.reduce(function(a,b){return a + Math.pow(b-m,2);},0) / (arr.length - 1 || 1);
                var se = Math.sqrt(vv) / Math.sqrt(arr.length);
                tableRows[cat][p] = m.toFixed(1) + ' [' + (m-1.96*se).toFixed(1) + '; ' + (m+1.96*se).toFixed(1) + ']';
            } else {
                tableRows[cat][p] = 'N/A';
            }
        });

        var firstColTitle = (grouping==='duration') ? 'days'
                          : grouping==='gender' ? 'Gender'
                          : grouping==='bmi'    ? 'BMI categories' : 'Age categories';
        var columns = [
            { name: firstColTitle, id: 'Category' },
            { name: 'Baseline',    id: 'Baseline', type: 'text' },
            { name: 'Change',      id: 'Parameter', type: 'text' }
        ];
        var headerCounts = counts;
        var dataRows = CATEGORY_ORDER.map(function (cat, idx) {
            var n = headerCounts ? headerCounts[idx] : 0;
            return {
                Category: CATEGORY_SHORT[idx] + '  (n=' + n + ')',
                Baseline: (tableRows[cat] && tableRows[cat][p + '_baseline']) || 'N/A',
                Parameter:(tableRows[cat] && tableRows[cat][p]) || 'N/A'
            };
        });

        var table = {
            type: 'DataTable', namespace: 'dash_table',
            props: {
                data: dataRows, columns: columns,
                style_cell: { textAlign:'center', fontFamily:'Lato, sans-serif',
                              fontSize: isMobile ? '11px' : '13px', whiteSpace:'normal',
                              wordBreak:'break-word', padding:'10px 12px', height:'auto',
                              lineHeight:'1.25', border:'none' },
                style_header: { backgroundColor:'#f3f6f8', fontWeight:'700',
                                borderBottom:'2px solid #cfd6dc', whiteSpace:'normal',
                                fontSize: isMobile ? '12px' : '14px' },
                style_data: { backgroundColor:'white' },
                style_data_conditional: [
                    { 'if':{ column_id:'Category' }, fontWeight:'500' }
                ],
                style_table: { margin:'12px 0', width:'100%', maxWidth:'100%' }
            }
        };

        var chartsWrap = {
            type:'Div', namespace:'dash_html_components',
            props:{ style:{ display:'flex', flexWrap:'wrap', justifyContent:'center' }, children:[chartCard] }
        };
        var tableWrap = {
            type:'Div', namespace:'dash_html_components',
            props:{ children:[
                { type:'H4', namespace:'dash_html_components',
                  props:{ children:'Mean Change [Confidence Interval 95%]',
                          style:{ marginTop:'30px' } } },
                table
            ] }
        };

        return [chartsWrap, tableWrap];
    };

    UI.updateCohortStats = function (data, age_cat, bmi_cat, sex, varA, varB, parameter, baselineRange) {
        if (!data || !Array.isArray(data) || !data.length) {
            return { type:'Div', namespace:'dash_html_components', props:{ children:'No data available' } };
        }
        var filtered = data.filter(function (r) {
            var ok = true;
            if (age_cat) ok = ok && r.age_cat === age_cat;
            if (bmi_cat) ok = ok && r.BMI_cat === bmi_cat;
            if (sex)     ok = ok && r.sex === sex;
            return ok;
        });
        if (!filtered.length) {
            return { type:'Div', namespace:'dash_html_components', props:{ children:'No data matching the selected filters' } };
        }

        var bMin = (baselineRange && baselineRange.length>=2) ? Number(baselineRange[0]) : null;
        var bMax = (baselineRange && baselineRange.length>=2) ? Number(baselineRange[1]) : null;
        var validIds = null;
        if (parameter && bMin != null && bMax != null && isFinite(bMin) && isFinite(bMax)) {
            validIds = new Set();
            filtered.forEach(function (r) {
                if (r.timepoint === 'Pre' && r[parameter] !== null && r[parameter] !== undefined && r[parameter] !== '') {
                    var v = Number(r[parameter]);
                    if (isFinite(v) && v >= bMin && v <= bMax) validIds.add(r.meta_id);
                }
            });
        }

        var uniquePatients = {};
        filtered.forEach(function (r) {
            var id = r.meta_id;
            if (validIds !== null && !validIds.has(id)) return;
            if (!uniquePatients[id]) {
                uniquePatients[id] = {
                    age_cat: r.age_cat, sex: r.sex,
                    BMI: r.BMI, BMI_cat: r.BMI_cat,
                    length_of_fasting_cat: r.length_of_fasting_cat
                };
            }
        });
        var patients = Object.values(uniquePatients);
        var totalPatients = patients.length;

        var vw = window.innerWidth, isMobile = vw <= 768;
        var sankeyMountId = 'hc_cohort_sankey';
        var chartsContainer = {
            type:'Div', namespace:'dash_html_components',
            props:{
                style:{ display:'flex', flexWrap:'wrap', justifyContent:'center', marginTop:'15px' },
                children:[{
                    type:'Div', namespace:'dash_html_components',
                    props:{ className:'chart-card',
                            style:{ width:'100%', margin:'0px 0px', display:'flex', justifyContent:'center', alignItems:'center' },
                            children:[{
                                type:'Div', namespace:'dash_html_components',
                                props:{ id: sankeyMountId,
                                        style:{ height: isMobile ? '500px' : '600px',
                                                width:'100%', maxWidth:'800px',
                                                maxHeight: isMobile ? '500px' : '300px' } }
                            }] }
                }]
            }
        };

        setTimeout(function () {
            if (!window.Highcharts || !window.Highcharts.seriesTypes || !window.Highcharts.seriesTypes.sankey) return;
            if (!totalPatients) return;

            var ageConfig = [
                { cat:'Young adults (18-34 years)', short:'18-34', name:'Young adults', color:'#4a90e2' },
                { cat:'Middle age (35-64 years)',    short:'35-64', name:'Middle Age',   color:'#50e3c2' },
                { cat:'Older adults (≥65 years)',    short:'≥65',   name:'Older Adults', color:'#f5a623' }
            ];
            var bmiConfig = [
                { cat:'Normal (18–24.9 kg/m²)',      short:'Normal',     name:'Normal',     color:'#50e3c2' },
                { cat:'Overweight (25.0–29.9 kg/m²)', short:'Overweight', name:'Overweight', color:'#f5a623' },
                { cat:'Obesity (≥30 kg/m²)',         short:'Obesity',    name:'Obesity',    color:'#d0021b' }
            ];
            var genderConfig  = [ { sex:'M', name:'Male', color:'#4a90e2' }, { sex:'F', name:'Female', color:'#f45b69' } ];
            var fastingConfig = [
                { cat:'3-7 days',   name:'3-7 days',   color:'#4a90e2' },
                { cat:'8-12 days',  name:'8-12 days',  color:'#50e3c2' },
                { cat:'13-17 days', name:'13-17 days', color:'#f5a623' },
                { cat:'18+ days',   name:'18+ days',   color:'#d0021b' }
            ];

            var selA = (typeof varA === 'string' && varA) ? varA : 'gender';
            var selB = (typeof varB === 'string' && varB) ? varB : 'fasting';
            if (selA === selB) {
                var el = document.getElementById(sankeyMountId);
                if (el) el.innerHTML = '<div style="text-align:center; padding:40px; color:#d0021b; font-family:\"Josefin Sans\", Georgia, sans-serif;">Please select two different variables to display the Sankey diagram.</div>';
                return;
            }

            var nodes = [], nodeIndex = {};
            function pushNodes(which, col) {
                if (which === 'age')        ageConfig.forEach(function(c){ var id='Age_'+c.short;     nodeIndex[id]=nodes.length; nodes.push({id:id,name:c.name,column:col,color:c.color}); });
                else if (which === 'bmi')   bmiConfig.forEach(function(c){ var id='BMI_'+c.short;     nodeIndex[id]=nodes.length; nodes.push({id:id,name:c.name,column:col,color:c.color}); });
                else if (which === 'gender')genderConfig.forEach(function(c){var id='Gender_'+c.name; nodeIndex[id]=nodes.length; nodes.push({id:id,name:c.name,column:col,color:c.color}); });
                else                        fastingConfig.forEach(function(c){var id='Fasting_'+c.cat;nodeIndex[id]=nodes.length; nodes.push({id:id,name:c.name,column:col,color:c.color}); });
            }
            pushNodes(selA, 0); pushNodes(selB, 1);

            function getAgeShort(c){ if (!c) return null; if (c.indexOf('Young')>=0) return '18-34'; if (c.indexOf('Middle')>=0) return '35-64'; if (c.indexOf('Older')>=0) return '≥65'; return null; }
            function getBmiShort(c){ if (!c) return null; if (c.indexOf('Normal')>=0) return 'Normal'; if (c.indexOf('Overweight')>=0) return 'Overweight'; if (c.indexOf('Obesity')>=0) return 'Obesity'; return null; }
            function keyFor(which, row) {
                if (which === 'age') { var a=getAgeShort(row.age_cat); return a?('Age_'+a):null; }
                if (which === 'bmi') { var b=getBmiShort(row.BMI_cat); return b?('BMI_'+b):null; }
                if (which === 'gender') return row.sex==='M' ? 'Gender_Male' : (row.sex==='F'?'Gender_Female':null);
                return row.length_of_fasting_cat ? ('Fasting_'+row.length_of_fasting_cat) : null;
            }

            var map = {};
            patients.forEach(function (p) {
                var from = keyFor(selA, p), to = keyFor(selB, p);
                if (!from || !to) return;
                var k = from+'|'+to;
                if (!map[k]) map[k] = { from: from, to: to, weight: 0 };
                map[k].weight++;
            });
            var links = Object.keys(map).map(function(k){ return map[k]; });

            var nodeCounts = {};
            patients.forEach(function (p) {
                [ ['age',    p.age_cat ? ('Age_' + (getAgeShort(p.age_cat)||'')) : null],
                  ['bmi',    p.BMI_cat ? ('BMI_' + (getBmiShort(p.BMI_cat)||'')) : null],
                  ['gender', p.sex==='M' ? 'Gender_Male' : (p.sex==='F' ? 'Gender_Female' : null)],
                  ['fasting',p.length_of_fasting_cat ? ('Fasting_' + p.length_of_fasting_cat) : null]
                ].forEach(function (pair) {
                    var id = pair[1]; if (!id) return;
                    nodeCounts[id] = (nodeCounts[id] || 0) + 1;
                });
            });
            var nodePercentages = {};
            Object.keys(nodeCounts).forEach(function (id) {
                nodePercentages[id] = totalPatients > 0 ? (nodeCounts[id] / totalPatients * 100) : 0;
            });
            var sourceTotals = {};
            links.forEach(function (l) { sourceTotals[l.from] = (sourceTotals[l.from] || 0) + l.weight; });

            var sankeyData = links.map(function (l) {
                var sn = nodes.find(function (n) { return n.id === l.from; });
                var sc = sn ? sn.color : '#cccccc';
                var totFrom = sourceTotals[l.from] || 0;
                return { from: l.from, to: l.to, weight: l.weight, color: sc,
                         linkPercent: totFrom > 0 ? (l.weight / totFrom * 100) : 0 };
            });

            var existing = window.Highcharts.charts && window.Highcharts.charts.find(function (c) {
                return c && c.renderTo && c.renderTo.id === sankeyMountId;
            });
            if (existing) {
                if (existing._resizeHandler) window.removeEventListener('resize', existing._resizeHandler);
                existing.destroy();
            }

            var isWide = vw > 768;
            var chart = window.Highcharts.chart(sankeyMountId, {
                chart: { type:'sankey', backgroundColor:'white', spacingLeft:10, spacingRight:10,
                         panning:false, pinchType:'', zooming:{enabled:false}, inverted: isWide,
                         style:{ fontFamily:'"Josefin Sans", "EB Garamond", Georgia, sans-serif' } },
                title:{ text:'' }, credits:{enabled:false},
                plotOptions: { sankey: {
                    cursor:'pointer', linkColorMode:'from',
                    states:{ hover:{ linkOpacity:0.7, brightness:0.1 }, inactive:{ linkOpacity:0.2 } },
                    dataLabels: { enabled:true, useHTML:true,
                        formatter: function () {
                            if (this.point && this.point.node) {
                                var id = this.point.node.id;
                                var pct = nodePercentages[id] || 0;
                                return '<div style="text-align:center; font-size:' + (isMobile?'13px':'16px')
                                     + '; font-weight:600; color:#111;">'
                                     + '<div>' + this.point.node.name + '</div>'
                                     + '<div style="font-size:0.85em;color:#666;margin-top:2px;">' + pct.toFixed(1) + '%</div></div>';
                            }
                            return '';
                        },
                        allowOverlap:true, style:{ textOutline:'none', color:'#111', pointerEvents:'none' }
                    },
                    nodeWidth:25, nodePadding:15, minLinkWidth:3, linkOpacity:0.5
                }},
                tooltip: {
                    enabled:true, useHTML:true,
                    backgroundColor:'rgba(255,255,255,0.95)', borderWidth:1, borderRadius:4, shadow:true,
                    style:{ zIndex:9999, pointerEvents:'none',
                            fontFamily:'"Josefin Sans", "EB Garamond", Georgia, sans-serif' },
                    formatter: function () {
                        var p = this.point || {};
                        if (p.fromNode && p.toNode) {
                            return '<div style="padding:5px;"><b style="color:' + p.fromNode.color + ';">' + p.fromNode.name + '</b> → '
                                 + '<b style="color:' + p.toNode.color + ';">' + p.toNode.name + '</b><br/>'
                                 + '<span style="font-size:15px;font-weight:bold;">Patients: ' + p.weight + '</span><br/>'
                                 + '<span style="font-size:14px;color:#666;">' + (p.linkPercent||0).toFixed(1) + '%</span></div>';
                        }
                        if (p.isNode) {
                            var nid = p.id || (nodes.find(function(n){ return n.name === p.name; }) || {}).id;
                            var pct = nid && nodePercentages[nid] ? nodePercentages[nid] : 0;
                            var total = (typeof p.sum === 'number') ? p.sum : (nid && nodeCounts[nid] || 0);
                            return '<div style="padding:5px;"><b style="color:' + (p.color||'#333') + ';">' + (p.name||'') + '</b><br/>'
                                 + '<span style="font-size:15px;">Total: ' + total + ' patients</span><br/>'
                                 + '<span style="font-size:14px;color:#666;">' + pct.toFixed(1) + '%</span></div>';
                        }
                        return '';
                    }
                },
                series: [{
                    type:'sankey', name:'Patient Flow',
                    keys:['from','to','weight','color'],
                    data: sankeyData,
                    nodes: nodes.map(function (n) { return { id:n.id, name:n.name, column:n.column, color:n.color }; }),
                    linkColorMode:'from', colorByPoint:false
                }]
            });

            // Responsive inverted
            var tmo=null;
            chart._lastIsWide = (vw > 760);
            var resize = function () {
                if (tmo) clearTimeout(tmo);
                tmo = setTimeout(function () {
                    if (!chart || chart.destroyed) return;
                    var inv = window.innerWidth > 760;
                    if (inv === chart._lastIsWide) return;
                    chart._lastIsWide = inv;
                    chart.update({ chart:{ inverted: inv } }, true);
                }, 50);
            };
            window.addEventListener('resize', resize, { passive:true });
            chart._resizeHandler = resize;
        }, 100);

        return chartsContainer;
    };

    UI.toggleReadMore = function (opened) {
        var el = document.getElementById('aboutShowMore');
        if (el) {
            if (opened) {
                el.style.transition = '';
                el.style.maxHeight = el.scrollHeight + 'px';
            } else {
                el.style.transition = 'none';
                el.style.maxHeight = '40px';
                setTimeout(function () { el.style.transition = ''; }, 0);
            }
        }
        var gm = document.getElementById('gradient-mask');
        if (gm) gm.style.opacity = opened ? 0 : 1;
        var btn = document.getElementById('aboutShowMoreTrigger');
        if (btn) {
            btn.className = opened ? 'readmore-btn opened' : 'readmore-btn';
            btn.textContent = opened ? 'Read less' : 'Read more';
        }
    };

    /* ---------------- Loaders ---------------- */

    function loadReferenceRanges() {
        return fetch('data/reference_ranges.json').then(function (r) { return r.json(); });
    }

    function loadDataset() {
        return new Promise(function (resolve, reject) {
            Papa.parse('data/dash_dataset_wide.csv', {
                download: true, header: true, dynamicTyping: true, skipEmptyLines: true,
                complete: function (res) { resolve(res.data); },
                error: function (err) { reject(err); }
            });
        });
    }

    function precomputeBaselineRanges(rows) {
        var out = {};
        var allParams = [];
        Object.keys(BIOMARKER_CATEGORIES).forEach(function (cat) {
            BIOMARKER_CATEGORIES[cat].forEach(function (p) { allParams.push(p); });
        });
        var pre = rows.filter(function (r) { return r.timepoint === 'Pre'; });
        allParams.forEach(function (p) {
            var vals = [];
            pre.forEach(function (r) {
                var v = r[p];
                if (v !== null && v !== undefined && v !== '' && isFinite(Number(v))) vals.push(Number(v));
            });
            if (!vals.length) return;
            var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
            var range = mx - mn;
            var step = (range > 0) ? Math.max(1, range / 100) : 1;
            out[p] = {
                min: Math.floor(mn / step) * step,
                max: Math.ceil(mx / step) * step,
                observed_min: mn, observed_max: mx
            };
        });
        return out;
    }

    /* ---------------- UI helpers ---------------- */

    function buildParameterDropdown() {
        var select = document.getElementById('parameter-dropdown');
        clear(select);
        Object.keys(BIOMARKER_CATEGORIES).forEach(function (cat) {
            var og = document.createElement('optgroup');
            og.label = cat;
            BIOMARKER_CATEGORIES[cat].forEach(function (p) {
                var opt = document.createElement('option');
                opt.value = p;
                opt.textContent = '  ' + formatParameterName(p);
                og.appendChild(opt);
            });
            select.appendChild(og);
        });
        select.value = STATE.filters.parameter;
    }

    var baselineSliderInstance = null;

    function mountBaselineSlider() {
        var sliderEl = document.getElementById('baseline-range-slider');
        if (sliderEl.noUiSlider) sliderEl.noUiSlider.destroy();
        var r = STATE.baselineRanges[STATE.filters.parameter];
        var min = r ? r.min : 0, max = r ? r.max : 100;
        if (!(max > min)) max = min + 1;
        noUiSlider.create(sliderEl, {
            start: [min, max],
            connect: true,
            range: { min: min, max: max },
            step: (max - min) / 100,
            tooltips: [ { to: function(v){ return formatSlider(v); } }, { to: function(v){ return formatSlider(v); } } ],
            format: { to: function (v) { return Number(v); }, from: function (v) { return Number(v); } }
        });
        document.getElementById('baseline-range-low').textContent  = formatSlider(min);
        document.getElementById('baseline-range-high').textContent = formatSlider(max);
        sliderEl.noUiSlider.on('update', function (values) {
            var lo = Number(values[0]), hi = Number(values[1]);
            STATE.filters.baselineRange = [lo, hi];
            document.getElementById('baseline-range-low').textContent  = formatSlider(lo);
            document.getElementById('baseline-range-high').textContent = formatSlider(hi);
        });
        sliderEl.noUiSlider.on('change', renderAll);
        STATE.filters.baselineRange = [min, max];
        baselineSliderInstance = sliderEl.noUiSlider;
    }

    function formatSlider(v) {
        var n = Number(v); if (!isFinite(n)) return '—';
        var a = Math.abs(n);
        if (a >= 100) return n.toFixed(0);
        if (a >= 10)  return n.toFixed(1);
        return n.toFixed(2);
    }

    /* ---------------- Rendering orchestration ---------------- */

    function renderAnalysis() {
        var out = UI.updateAnalysis(
            STATE.data, STATE.groupingTab,
            STATE.filters.age_cat, STATE.filters.bmi_cat, STATE.filters.sex,
            STATE.filters.parameter, STATE.filters.baselineRange
        );
        var chartsEl = document.getElementById('charts-container');
        var tableEl  = document.getElementById('data-table-container');
        clear(chartsEl); clear(tableEl);
        appendChild(chartsEl, out[0]);
        appendChild(tableEl,  out[1]);
    }

    function renderCohort() {
        var out = UI.updateCohortStats(
            STATE.data,
            STATE.filters.age_cat, STATE.filters.bmi_cat, STATE.filters.sex,
            STATE.sankeyA, STATE.sankeyB,
            STATE.filters.parameter, STATE.filters.baselineRange
        );
        var el = document.getElementById('cohort-stats-container');
        clear(el); appendChild(el, out);
    }

    function renderAll() { renderAnalysis(); renderCohort(); }

    /* ---------------- UI wiring ---------------- */

    function wire() {
        document.getElementById('age-input').addEventListener('change', function (e) {
            STATE.filters.age_cat = e.target.value || null; renderAll();
        });
        document.getElementById('bmi-input').addEventListener('change', function (e) {
            STATE.filters.bmi_cat = e.target.value || null; renderAll();
        });

        function toggleSex(newSex, btnM, btnF) {
            if (STATE.filters.sex === newSex) STATE.filters.sex = null;
            else STATE.filters.sex = newSex;
            btnM.classList.toggle('selected', STATE.filters.sex === 'M');
            btnF.classList.toggle('selected', STATE.filters.sex === 'F');
            renderAll();
        }
        var bm = document.getElementById('sex-button-M');
        var bf = document.getElementById('sex-button-F');
        bm.addEventListener('click', function () { toggleSex('M', bm, bf); });
        bf.addEventListener('click', function () { toggleSex('F', bm, bf); });

        document.getElementById('parameter-dropdown').addEventListener('change', function (e) {
            STATE.filters.parameter = e.target.value;
            mountBaselineSlider();
            renderAll();
        });

        // Grouping tabs
        var groupButtons = [
            ['grp-btn-duration','duration'],
            ['grp-btn-gender','gender'],
            ['grp-btn-bmi','bmi'],
            ['grp-btn-age','age']
        ];
        groupButtons.forEach(function (pair) {
            document.getElementById(pair[0]).addEventListener('click', function () {
                STATE.groupingTab = pair[1];
                groupButtons.forEach(function (pp) {
                    document.getElementById(pp[0]).classList.toggle('selected', pp[1] === STATE.groupingTab);
                });
                renderAnalysis();
            });
        });

        // Sankey "From" and "To" tab groups
        function wireSankeyGroup(prefix, stateKey, otherKey) {
            var keys = ['age','bmi','gender','fasting'];
            keys.forEach(function (k) {
                var btn = document.getElementById(prefix + '-' + k);
                btn.addEventListener('click', function () {
                    // Can't match the other axis
                    if (STATE[otherKey] === k) return;
                    STATE[stateKey] = k;
                    keys.forEach(function (kk) {
                        var b = document.getElementById(prefix + '-' + kk);
                        b.classList.toggle('selected', kk === STATE[stateKey]);
                        b.disabled = (kk === STATE[otherKey]);
                    });
                    renderCohort();
                });
            });
            // Initial disabled-state for the other axis
            keys.forEach(function (kk) {
                document.getElementById(prefix + '-' + kk).disabled = (kk === STATE[otherKey]);
            });
        }
        wireSankeyGroup('sankey-a', 'sankeyA', 'sankeyB');
        wireSankeyGroup('sankey-b', 'sankeyB', 'sankeyA');

        // Read-more toggle
        var rm = document.getElementById('aboutShowMoreTrigger');
        var opened = false;
        rm.addEventListener('click', function () { opened = !opened; UI.toggleReadMore(opened); });

        // Footer year
        var fy = document.getElementById('footer-year');
        if (fy) fy.textContent = '© ' + new Date().getFullYear();
    }

    /* ---------------- Boot ---------------- */

    function init() {
        document.getElementById('charts-container').innerHTML =
            '<div class="loading-indicator">Loading data… (the dataset is ~2 MB and may take a few seconds)</div>';

        Promise.all([ loadDataset(), loadReferenceRanges() ])
            .then(function (results) {
                STATE.data = results[0] || [];
                STATE.referenceRanges = results[1] || {};
                STATE.baselineRanges  = precomputeBaselineRanges(STATE.data);

                buildParameterDropdown();
                mountBaselineSlider();
                wire();
                renderAll();
            })
            .catch(function (err) {
                console.error(err);
                document.getElementById('charts-container').innerHTML =
                    '<div class="loading-indicator" style="color:#d0021b;">Failed to load data: ' + (err && err.message ? err.message : err) + '</div>';
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for debugging
    window.__BW_UI = UI;
    window.__BW_STATE = STATE;
})();

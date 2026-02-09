/*

- Buchinger Science — Interactive scripts
- Scroll-triggered reveals, animated counters, nav effects, hamburger menu
  */

document.addEventListener(‘DOMContentLoaded’, function () {

/* ── Scroll reveal (IntersectionObserver) ── */
const reveals = document.querySelectorAll(’.reveal’);
if (reveals.length && ‘IntersectionObserver’ in window) {
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add(‘visible’);
observer.unobserve(entry.target);
}
});
}, { threshold: 0.12, rootMargin: ‘0px 0px -40px 0px’ });
reveals.forEach(el => observer.observe(el));
} else {
// Fallback: just show everything
reveals.forEach(el => el.classList.add(‘visible’));
}

/* ── Nav scroll shadow ── */
const nav = document.querySelector(‘nav’);
if (nav) {
let ticking = false;
window.addEventListener(‘scroll’, () => {
if (!ticking) {
requestAnimationFrame(() => {
nav.classList.toggle(‘scrolled’, window.scrollY > 20);
ticking = false;
});
ticking = true;
}
});
}

/* ── Hamburger menu ── */
const toggle = document.getElementById(‘navToggle’);
const menu = document.getElementById(‘navMenu’);
if (toggle && menu) {
toggle.addEventListener(‘click’, () => {
toggle.classList.toggle(‘active’);
menu.classList.toggle(‘open’);
});
// Close on link click
menu.querySelectorAll(‘a’).forEach(a => {
a.addEventListener(‘click’, () => {
toggle.classList.remove(‘active’);
menu.classList.remove(‘open’);
});
});
// Close on outside click
document.addEventListener(‘click’, (e) => {
if (menu.classList.contains(‘open’) && !menu.contains(e.target) && !toggle.contains(e.target)) {
toggle.classList.remove(‘active’);
menu.classList.remove(‘open’);
}
});
}

/* ── Animated counters ── */
const counters = document.querySelectorAll(’[data-target]’);
if (counters.length && ‘IntersectionObserver’ in window) {
const counterObserver = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
const el = entry.target;
const target = parseInt(el.getAttribute(‘data-target’), 10);
animateCount(el, 0, target, 1200);
counterObserver.unobserve(el);
}
});
}, { threshold: 0.3 });
counters.forEach(el => counterObserver.observe(el));
}

function animateCount(el, start, end, duration) {
const range = end - start;
const startTime = performance.now();
function step(now) {
const elapsed = now - startTime;
const progress = Math.min(elapsed / duration, 1);
// Ease out cubic
const eased = 1 - Math.pow(1 - progress, 3);
el.textContent = Math.round(start + range * eased).toLocaleString();
if (progress < 1) requestAnimationFrame(step);
}
requestAnimationFrame(step);
}

/* ── Chart.js data explorer (metabolic page) ── */
const metabolicCanvas = document.getElementById(‘metabolicChart’);
if (metabolicCanvas) {
const datasets = {
weight: {
label: ‘Weight Loss (kg)’,
data: [2.5, 3.2, 4.5, 5.8, 7.1, 9.0],
borderColor: ‘#3da8d0’,
backgroundColor: ‘rgba(61, 168, 208, 0.12)’,
tension: 0.3
},
ketones: {
label: ‘Ketone Levels (mmol/L)’,
data: [1.2, 1.5, 2.0, 2.3, 2.5, 3.0],
borderColor: ‘#1a2332’,
backgroundColor: ‘rgba(26, 35, 50, 0.1)’,
tension: 0.3
},
bloodPressure: {
label: ‘Systolic Blood Pressure (mmHg)’,
data: [130, 126, 124, 122, 120, 118],
borderColor: ‘#48bb78’,
backgroundColor: ‘rgba(72, 187, 120, 0.1)’,
tension: 0.3
}
};
const durations = [5, 7, 10, 14, 20, 30];
let currentMetric = ‘weight’;
const metabolicChart = new Chart(metabolicCanvas, {
type: ‘line’,
data: { labels: durations, datasets: [datasets[currentMetric]] },
options: {
responsive: true,
maintainAspectRatio: false,
scales: {
x: { title: { display: true, text: ‘Fasting Duration (days)’ } },
y: { beginAtZero: false, title: { display: true, text: datasets[currentMetric].label } }
},
plugins: {
legend: { display: false },
tooltip: {
callbacks: {
label: (ctx) => ctx.parsed.y + ’ ’ + datasets[currentMetric].label.split(’(’)[1]
}
}
}
}
});
const metricSelect = document.getElementById(‘metric-select’);
if (metricSelect) {
metricSelect.addEventListener(‘change’, function () {
currentMetric = this.value;
metabolicChart.data.datasets = [datasets[currentMetric]];
metabolicChart.options.scales.y.title.text = datasets[currentMetric].label;
metabolicChart.update();
});
}
}

/* ── Fasting journey timeline (older pages) ── */
const journeyContainer = document.querySelector(’.journey-timeline’);
if (journeyContainer) {
const journeySteps = [
{ day: ‘Day 1’, title: ‘Adjustment’, description: ‘The body begins to adapt to reduced caloric intake. Some people may feel hungry or tired.’ },
{ day: ‘Day 3’, title: ‘Metabolic Shift’, description: ‘Glucose stores deplete and the body shifts to producing ketones. Energy levels often stabilise.’ },
{ day: ‘Day 5’, title: ‘Mental Clarity’, description: ‘Many fasters report improved focus and clarity. Ketone levels continue to rise.’ },
{ day: ‘Day 7’, title: ‘Deep Fasting’, description: ‘Autophagy and other cellular processes intensify. Weight loss becomes more noticeable.’ },
{ day: ‘Day 10+’, title: ‘Sustained Benefits’, description: ‘Extended fasting may lead to deeper metabolic changes. Always consult medical professionals during prolonged fasts.’ }
];
journeySteps.forEach(function (step) {
const stepDiv = document.createElement(‘div’);
stepDiv.classList.add(‘timeline-event’);
stepDiv.innerHTML =
‘<div class="date">’ + step.day + ‘</div>’ +
‘<div class="title">’ + step.title + ‘</div>’ +
‘<div class="details">’ + step.description + ‘</div>’;
journeyContainer.appendChild(stepDiv);
});
journeyContainer.addEventListener(‘click’, function (e) {
const target = e.target.closest(’.timeline-event’);
if (target) target.classList.toggle(‘active’);
});
}

/* ── Method steps (method page) ── */
const methodContainer = document.querySelector(’.method-steps’);
if (methodContainer) {
const methodSteps = [
{ phase: ‘Preparation’, title: ‘Pre-Fast Phase’, description: ‘Reduce food intake gradually, adopt a lighter diet and prepare mentally for fasting.’ },
{ phase: ‘Fasting’, title: ‘Active Fasting’, description: ‘Consume broth, teas and juice according to the Buchinger protocol. Participate in light activities and medical checkups.’ },
{ phase: ‘Refresher’, title: ‘Refeeding’, description: ‘Slowly reintroduce solid foods with an emphasis on plant-based meals to ease digestion and maintain benefits.’ }
];
methodSteps.forEach(function (step) {
const stepDiv = document.createElement(‘div’);
stepDiv.classList.add(‘timeline-event’);
stepDiv.innerHTML =
‘<div class="date">’ + step.phase + ‘</div>’ +
‘<div class="title">’ + step.title + ‘</div>’ +
‘<div class="details">’ + step.description + ‘</div>’;
methodContainer.appendChild(stepDiv);
});
methodContainer.addEventListener(‘click’, function (e) {
const target = e.target.closest(’.timeline-event’);
if (target) target.classList.toggle(‘active’);
});
}
});

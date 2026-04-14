/*
 * Buchinger Science interactive scripts
 *
 * This file adds dynamic behaviour to the Buchinger Science website. It
 * initialises the Chart.js chart for the data explorer, enables metric
 * switching via a dropdown, and provides interactive expand/collapse
 * functionality for timeline events. The data used here are placeholders; in
 * production you would fetch real data from your research articles.
 */

document.addEventListener('DOMContentLoaded', function () {
  /*
   * Data explorer for metabolic page
   * If a canvas with id "metabolicChart" exists, we initialize a line chart
   * similar to the original data explorer. Placeholder data sets can be
   * replaced with real values when integrating real research outputs.
   */
  const metabolicCanvas = document.getElementById('metabolicChart');
  if (metabolicCanvas) {
    const datasets = {
      weight: {
        label: 'Weight Loss (kg)',
        data: [2.5, 3.2, 4.5, 5.8, 7.1, 9.0],
        borderColor: '#3b9fa9',
        backgroundColor: 'rgba(59, 159, 169, 0.2)',
        tension: 0.2
      },
      ketones: {
        label: 'Ketone Levels (mmol/L)',
        data: [1.2, 1.5, 2.0, 2.3, 2.5, 3.0],
        borderColor: '#074e63',
        backgroundColor: 'rgba(7, 78, 99, 0.2)',
        tension: 0.2
      },
      bloodPressure: {
        label: 'Systolic Blood Pressure (mmHg)',
        data: [130, 126, 124, 122, 120, 118],
        borderColor: '#88c0d0',
        backgroundColor: 'rgba(136, 192, 208, 0.2)',
        tension: 0.2
      }
    };
    const durations = [5, 7, 10, 14, 20, 30];
    let currentMetric = 'weight';
    const metabolicChart = new Chart(metabolicCanvas, {
      type: 'line',
      data: {
        labels: durations,
        datasets: [datasets[currentMetric]]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Fasting Duration (days)'
            }
          },
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: datasets[currentMetric].label
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.parsed.y + ' ' + datasets[currentMetric].label.split('(')[1];
              }
            }
          }
        }
      }
    });
    const metricSelect = document.getElementById('metric-select');
    if (metricSelect) {
      metricSelect.addEventListener('change', function () {
        currentMetric = this.value;
        metabolicChart.data.datasets = [datasets[currentMetric]];
        metabolicChart.options.scales.y.title.text = datasets[currentMetric].label;
        metabolicChart.update();
      });
    }
  }

  /*
   * Fasting journey timeline on the landing page
   * This function builds a simple interactive timeline representing what
   * participants might experience at various points during a fast. It uses
   * placeholder descriptions that can be replaced with more detailed lay
   * summaries later. Clicking a step toggles the display of its details.
   */
  const journeyContainer = document.querySelector('.journey-timeline');
  if (journeyContainer) {
    const journeySteps = [
      {
        day: 'Day 1',
        title: 'Adjustment',
        description: 'The body begins to adapt to reduced caloric intake. Some people may feel hungry or tired.'
      },
      {
        day: 'Day 3',
        title: 'Metabolic Shift',
        description: 'Glucose stores deplete and the body shifts to producing ketones. Energy levels often stabilise.'
      },
      {
        day: 'Day 5',
        title: 'Mental Clarity',
        description: 'Many fasters report improved focus and clarity. Ketone levels continue to rise.'
      },
      {
        day: 'Day 7',
        title: 'Deep Fasting',
        description: 'Autophagy and other cellular processes intensify. Weight loss becomes more noticeable.'
      },
      {
        day: 'Day 10+',
        title: 'Sustained Benefits',
        description: 'Extended fasting may lead to deeper metabolic changes. Always consult medical professionals during prolonged fasts.'
      }
    ];
    // Create elements for each step
    journeySteps.forEach(function (step) {
      const stepDiv = document.createElement('div');
      stepDiv.classList.add('timeline-event');
      stepDiv.innerHTML =
        '<div class="date">' + step.day + '</div>' +
        '<div class="title">' + step.title + '</div>' +
        '<div class="details">' + step.description + '</div>';
      journeyContainer.appendChild(stepDiv);
    });
    // Add click handler for toggling details
    journeyContainer.addEventListener('click', function (e) {
      const target = e.target.closest('.timeline-event');
      if (target) {
        target.classList.toggle('active');
      }
    });
  }

  /*
   * Method steps timeline on the method page
   * Similar to the fasting journey, this timeline summarises the stages of
   * Buchinger Wilhelmi’s fasting method. Details are placeholders.
   */
  const methodContainer = document.querySelector('.method-steps');
  if (methodContainer) {
    const methodSteps = [
      {
        phase: 'Preparation',
        title: 'Pre-Fast Phase',
        description: 'Reduce food intake gradually, adopt a lighter diet and prepare mentally for fasting.'
      },
      {
        phase: 'Fasting',
        title: 'Active Fasting',
        description: 'Consume broth, teas and juice according to the Buchinger protocol. Participate in light activities and medical checkups.'
      },
      {
        phase: 'Refresher',
        title: 'Refeeding',
        description: 'Slowly reintroduce solid foods with an emphasis on plant‑based meals to ease digestion and maintain benefits.'
      }
    ];
    methodSteps.forEach(function (step) {
      const stepDiv = document.createElement('div');
      stepDiv.classList.add('timeline-event');
      stepDiv.innerHTML =
        '<div class="date">' + step.phase + '</div>' +
        '<div class="title">' + step.title + '</div>' +
        '<div class="details">' + step.description + '</div>';
      methodContainer.appendChild(stepDiv);
    });
    methodContainer.addEventListener('click', function (e) {
      const target = e.target.closest('.timeline-event');
      if (target) {
        target.classList.toggle('active');
      }
    });
  }
});

function loadScores() {
  let totalScores = [];
  let bestScores = [];
  let timeScores = [];
  const totalOresText = localStorage.getItem('totalScores');
  const bestScoresText = localStorage.getItem('bestScores');
  const bestTimesText = localStorage.getItem('bestTimes');

  if (totalOresText) {
    totalScores = JSON.parse(totalOresText);
  }
  if (bestScoresText) {
    bestScores = JSON.parse(bestScoresText);
  }
  if (bestTimesText) {
    timeScores = JSON.parse(bestTimesText);
  } 
  const tableTimeBodyEl = document.querySelector('#time-ores');
  const tableOreBodyEl = document.querySelector('#score-ores');
  const tableTotalBodyEl = document.querySelector('#ore-total');

  populateTable(totalScores, tableTimeBodyEl);
  populateTable(bestScores, tableOreBodyEl);
  populateTable( timeScores, tableTotalBodyEl);
}

function populateTable(scores, tableBodyEl) {
  if (scores.length) {
    for (const [i, score] of scores.entries()) {
      const positionTdEl = document.createElement('td');
      const nameTdEl = document.createElement('td');
      const scoreTdEl = document.createElement('td');
      const dateTdEl = document.createElement('td');

      positionTdEl.textContent = i + 1;
      nameTdEl.textContent = score.name;
      scoreTdEl.textContent = score.score;
      dateTdEl.textContent = score.date;

      const rowEl = document.createElement('tr');
      rowEl.appendChild(positionTdEl);
      rowEl.appendChild(nameTdEl);
      rowEl.appendChild(scoreTdEl);
      rowEl.appendChild(dateTdEl);

      tableBodyEl.appendChild(rowEl);
    }
  } else {
    tableBodyEl.innerHTML = '<tr><td colSpan=4>Be the first to score</td></tr>';
  }
}

loadScores();

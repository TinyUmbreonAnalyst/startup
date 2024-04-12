async function syncLocal() {
  let totals = localStorage.getItem("totalScores");
  let bestTimes = localStorage.getItem("bestTimes");
  let bestScores = localStorage.getItem("bestScores");
  try {
    const totalResponse = await fetch('/api/totalScores');
    totals = await totalResponse.json();
  } catch {}
  try {
    const timeResponse = await fetch('/api/timeScores');
    bestTimes = await timeResponse.json();
  }catch {}
  try {
    const scoreResponse = await fetch('/api/bestScores');
    bestScores = await scoreResponse.json();
  }catch {}
  localStorage.setItem("totalScores", JSON.stringify(totals));
  localStorage.setItem("bestTimes", JSON.stringify(bestTimes));
  localStorage.setItem("bestScores", JSON.stringify(bestScores));
  await loadScores();
}



async function loadScores() {
  loadScoresLocal();
}






function loadScoresLocal() {
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

  populateTable(timeScores, tableTimeBodyEl);
  populateTable(bestScores, tableOreBodyEl);
  populateTable( totalScores, tableTotalBodyEl);
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

syncLocal();

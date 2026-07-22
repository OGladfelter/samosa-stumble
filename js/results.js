const YEARS = [2022, 2023, 2024, 2025, 2026];

function addResultsRow(year, rank, name, samosas, rowColor) {
  var table = document.getElementById("leaderboard" + year);
  var row = table.insertRow(-1);
  row.classList.add('leaderboardRow');

  var rankCell = row.insertCell(0);
  var nameCell = row.insertCell(1);
  var samosasCell = row.insertCell(2);

  rankCell.innerHTML = '<span class="circle">' + rank + '</span>';
  nameCell.innerHTML = name;
  samosasCell.innerHTML = samosas;

  // Add trophy for winners
  if (rank == 1) {
    nameCell.innerHTML += " &#129351;";
  }

  row.style.backgroundColor = rowColor;

  nameCell.style.textAlign = 'left';
  nameCell.style.fontSize = '18px';
  samosasCell.style.textAlign = 'right';
}

function showYear(year) {
  document.querySelectorAll('.year-section').forEach(section => {
    section.classList.remove('active-year');
  });

  document.getElementById('year' + year).classList.add('active-year');

  document.querySelectorAll('.year-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.currentTarget.classList.add('active');
}

loadYearsData(YEARS).then(arrayOfDataFromAllYears => {
  arrayOfDataFromAllYears.forEach((yearData, index) => {
    const year = YEARS[index];

    // Sort by samosas
    yearData.sort((a, b) => b.samosas - a.samosas);

    // Color scale for this year
    const minSamosas = d3.min(yearData, d => d.samosas);
    const maxSamosas = d3.max(yearData, d => d.samosas);
    const colorScale = d3.scaleLinear()
      .domain([minSamosas, maxSamosas])
      .range(["#8181df", "#333399"]);

    // Rank and add rows
    let rank = 1;
    let prevSamosas = null;
    let tiedCount = 0;

    yearData.forEach(d => {
      if (prevSamosas !== null && d.samosas < prevSamosas) {
        rank += tiedCount;
        tiedCount = 1;
      } else if (prevSamosas === d.samosas) {
        tiedCount++;
      } else {
        tiedCount = 1;
      }

      prevSamosas = d.samosas;
      const rowColor = colorScale(d.samosas);

      addResultsRow(year, rank, d.name, d.samosas, rowColor);
    });
  });
});

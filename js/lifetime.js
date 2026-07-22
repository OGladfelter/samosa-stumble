function addLifetimeRow(rank, name, totalSamosas, yearsParticipated, rowColor) {
  var table = document.getElementById("lifetimeTable");
  var row = table.insertRow(-1);
  row.classList.add('leaderboardRow');

  var rankCell = row.insertCell(0);
  var nameCell = row.insertCell(1);

  if (screen.width >= 600) {
    var samosasCell = row.insertCell(2);
    var yearsCell = row.insertCell(3);
    samosasCell.style.textAlign = 'right';
    samosasCell.innerHTML = totalSamosas;
    yearsCell.style.textAlign = 'right';
    yearsCell.innerHTML = yearsParticipated;
  } else {
    var samosasCell = row.insertCell(2);
    samosasCell.style.textAlign = 'right';
    samosasCell.innerHTML = totalSamosas;
  }

  rankCell.innerHTML = '<span class="circle">' + rank + '</span>';
  nameCell.innerHTML = name;

  row.style.backgroundColor = rowColor;

  nameCell.style.textAlign = 'left';
  nameCell.style.fontSize = '18px';
}

function lifetimeLeaderboard(data) {
  // Calculate lifetime totals for each stumbler
  const lifetimeData = {};
  data.forEach(d => {
    if (!lifetimeData[d.name]) {
      lifetimeData[d.name] = {
        name: d.name,
        totalSamosas: 0,
        yearsParticipated: 0
      };
    }
    lifetimeData[d.name].totalSamosas += d.samosas;
    lifetimeData[d.name].yearsParticipated += 1;
  });

  // Convert to array and sort by total samosas
  const lifetimeArray = Object.values(lifetimeData).sort((a, b) => b.totalSamosas - a.totalSamosas);

  // Add ranks
  let lifetimeRank = 1;
  let prevTotal = null;
  let tiedCount = 0;

  lifetimeArray.forEach((person, i) => {
    if (prevTotal !== null && person.totalSamosas < prevTotal) {
      lifetimeRank += tiedCount;
      tiedCount = 1;
    } else if (prevTotal === person.totalSamosas) {
      tiedCount++;
    } else {
      tiedCount = 1;
    }
    person.rank = lifetimeRank;
    person.participantID = i;
    prevTotal = person.totalSamosas;
  });

  // Color scale based on total samosas
  const minTotal = d3.min(lifetimeArray, d => d.totalSamosas);
  const maxTotal = d3.max(lifetimeArray, d => d.totalSamosas);
  const colorScale = d3.scaleLinear()
    .domain([minTotal, maxTotal])
    .range(["#8181df", "#333399"]);

  lifetimeArray.forEach(person => {
    const rowColor = colorScale(person.totalSamosas);
    addLifetimeRow(person.rank, person.name, person.totalSamosas, person.yearsParticipated, rowColor);
  });
}

// this function from data-loader.js defaults to using an array of years, so just make sure it has all the years
loadYearsData().then(arrayOfDataFromAllYears => {
  const data = arrayOfDataFromAllYears.flat();
  lifetimeLeaderboard(data);
});

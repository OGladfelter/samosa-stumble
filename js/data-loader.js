// Loads and normalizes samosa data for the given years.
// Returns a Promise resolving to an array of arrays (one array of rows per year).
function loadYearsData(years = [2022, 2023, 2024, 2025, 2026]) {
  const promises = years.map(year =>
    d3.csv(`/data/${year}.csv`).then(yearData => {
      yearData.forEach(d => {
        d.year = year;
        d.samosas = +d.samosas;
      });
      return yearData;
    })
  );
  return Promise.all(promises);
}

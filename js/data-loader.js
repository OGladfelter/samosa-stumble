// Loads and normalizes samosa data for the given years.
// Returns a Promise resolving to an array of arrays (one array of rows per year).
function loadYearsData(years = [2022, 2023, 2024, 2025]) {
  const promises = years.map(year =>
    d3.csv(`/data/${year}.csv`).then(yearData => {
      yearData.forEach(d => {
        d.year = year;
        d.samosas = +d.samosas;
        d.miles = +d.miles;
      });
      return yearData;
    })
  );
  return Promise.all(promises);
}

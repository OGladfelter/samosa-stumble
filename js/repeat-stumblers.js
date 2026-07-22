function drawHeatmap(data) {
  const years = [2022, 2023, 2024, 2025];

  // Group data by person and year
  const groupedData = {};

  data.forEach(d => {
    if (!groupedData[d.name]) {
      groupedData[d.name] = {
        name: d.name,
        2022: 0,
        2023: 0,
        2024: 0,
        2025: 0,
        total: 0
      };
    }
    groupedData[d.name][d.year] = d.samosas;
    groupedData[d.name].total += d.samosas;
  });

  // Convert to array, filter out one-timers, and sort by total
  const heatmapArray = Object.values(groupedData)
    .filter(person => {
      const yearCount = years.filter(year => person[year] > 0).length;
      return yearCount > 1;
    })
    .sort((a, b) => b.total - a.total);

  const stumblers = heatmapArray.map(d => d.name);

  // Reformat into long format for D3
  const heatmapData = [];
  heatmapArray.forEach(d => {
    years.forEach(year => {
      heatmapData.push({
        name: d.name,
        year: year,
        value: d[year]
      });
    });
  });

  // Dimensions
  var margin = { top: 50, right: 0, bottom: 10, left: 180 },
    width = screen.width - 150 - margin.left - margin.right,
    height = screen.height - 150 - margin.top - margin.bottom;

  if (screen.width < 600) {
    margin = { top: 50, right: 30, bottom: 10, left: 70 },
      width = (screen.width * .95) - margin.left - margin.right,
      height = (screen.width * .95) - margin.top - margin.bottom;
  }

  const minCellWidth = 40;
  const minCellHeight = 30;

  width = Math.max(width, years.length * minCellWidth);
  height = Math.max(height, stumblers.length * minCellHeight);

  var padding = 0.05;

  var svg = d3.select("#heatmap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // X scale / axis
  var x = d3.scaleBand()
    .domain(years)
    .range([0, width])
    .padding(padding);
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0,0)")
    .call(d3.axisTop(x));

  // Y scale / axis
  var y = d3.scaleBand()
    .domain(stumblers)
    .range([0, height])
    .padding(padding);
  svg.append("g")
    .attr("class", "axis")
    .attr('transform', 'translate(0, 0)')
    .call(d3.axisLeft(y).tickFormat(function (d) {
      if (screen.width < 600) {
        return d.split(' ').pop();
      }
      return d;
    }));

  const heatmapTooltip = d3.select("#heatmapTooltip");
  var mousemove = function (event, d) {
    heatmapTooltip.style("opacity", d.value == 0 ? 0 : 1);

    heatmapTooltip
      .html(d.name + " ate<br> " + d.value + " samosas in " + d.year)
      .style('left', event.pageX / window.innerWidth <= 0.5 ? event.clientX + 20 + "px" : event.clientX - heatmapTooltip.node().getBoundingClientRect().width + 25 + 'px')
      .style('top', y(d.name) + heatmapTooltip.node().getBoundingClientRect().height + 25 + "px")
      .style('display', 'block');
  }

  // Cell color scale
  var heatmapColors = d3.scaleLinear()
    .domain(d3.extent(heatmapData, function (d) { return (d.value); }))
    .range(["#312e2b", "cyan"]);

  svg.selectAll()
    .data(heatmapData)
    .enter()
    .append("rect")
    .attr("id", function (d) { return d.name.replaceAll(" ", "") + d.year + "Rect" })
    .attr("y", function (d) { return y(d.name) })
    .attr("x", function (d) { return x(d.year) })
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", function (d) { return heatmapColors(d.value) })
    .on("mousemove", mousemove);

  // Text label color scale
  var textColor = d3.scaleQuantile()
    .domain(d3.extent(heatmapData, function (d) { return (d.value); }))
    .range(["white", "white", "white", "black"])

  svg.selectAll(".heatmapLabel")
    .data(heatmapData)
    .enter()
    .append("text")
    .text(function (d) { return d.value == 0 ? "" : d.value; })
    .attr("y", function (d) { return y(d.name) + (y.bandwidth() / 2) })
    .attr("x", function (d) { return x(d.year) + (x.bandwidth() / 2) })
    .style("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr('class', 'heatmapLabel')
    .style("fill", function (d) { return textColor(d.value) })
    .attr('pointer-events', 'none');
}

loadYearsData([2022, 2023, 2024, 2025]).then(arrayOfDataFromAllYears => {
  const data = arrayOfDataFromAllYears.flat();
  drawHeatmap(data);
});

// for tab navigation
function openTab(evt, tabID) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabID).style.display = "block";
  evt.currentTarget.className += " active";
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  if (tabID == "analysis") {
    Waypoint.enableAll();
  }
}


//////////////////////////////////////////////////////////
// Data prep
//////////////////////////////////////////////////////////

function readData() { 
  const years = [2022, 2023, 2024, 2025];

  // Load all year files
  const promises = years.map(year => 
    d3.csv(`data/${year}.csv`).then(yearData => {
      yearData.forEach(d => d.year = year);
      return yearData;
    })
  );
  
  // Once all files are loaded, combine and process
  Promise.all(promises).then(arrayOfDataFromAllYears => {
    // for each year, add a results table
    arrayOfDataFromAllYears.forEach((yearData, index) => {
      const year = years[index];
      
      // Convert to numbers
      yearData.forEach(d => {
        d.samosas = +d.samosas;
        d.miles = +d.miles;
        d.year = +d.year;
      });
      
      // Sort by samosas
      yearData.sort((a, b) => b.samosas - a.samosas);
      
      // Calculate color scale for this year
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

    const data = arrayOfDataFromAllYears.flat(); // Combine all years into one array

    // Convert columns to numbers
    data.forEach(d => {
      d.samosas = +d.samosas; 
      d.miles = +d.miles;
      d.year = +d.year; 
    });
        
    // Get the min and max samosas from your data
    const minSamosas = d3.min(data, d => d.samosas);
    const maxSamosas = d3.max(data, d => d.samosas);

    // Create color scale based on samosas range
    const rankColorScale = d3.scaleLinear()
      .domain([minSamosas, maxSamosas])
      .range(["#8181df", "#333399"]);
      
    // add row color
    data.forEach(d => {
      d.rowColor = rankColorScale(d.samosas);
    });
      
    // Sort by samosas in descending order (most samosas first)
    data.sort((a, b) => b.samosas - a.samosas);

    // create lifetime leaderboard
    lifetimeLeaderboard(data);
    
    // add some viz
    drawHeatmap(); // draw heatmap
  }); 
};

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

  // Add ranks to lifetime data
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

  // Color based on total samosas
    // Calculate color scale based on actual data range
    const minTotal = d3.min(lifetimeArray, d => d.totalSamosas);
    const maxTotal = d3.max(lifetimeArray, d => d.totalSamosas);
    const colorScale = d3.scaleLinear()
      .domain([minTotal, maxTotal])
      .range(["#8181df", "#333399"]);

  // add each player to lifetime leaderboard
  lifetimeArray.forEach(person => {
    const rowColor = colorScale(person.totalSamosas);
    addLifetimeRow(person.rank, person.name, person.totalSamosas, person.yearsParticipated, rowColor);
  });
}

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
    }
    else {
      var yearsCell = row.insertCell(2);
    }
    yearsCell.style.textAlign = 'right';
    yearsCell.innerHTML = yearsParticipated;

    rankCell.innerHTML = '<span class="circle">' + rank + '</span>';
    nameCell.innerHTML = name;
    
    row.style.backgroundColor = rowColor;

    nameCell.style.textAlign = 'left';
    nameCell.style.fontSize = '18px';
}

//////////////////////////////////////////////////////////
// Leaderboard
//////////////////////////////////////////////////////////

// function addResultsRow(rank, name, samosas, year, rowColor, d) {
//     var table = document.getElementById("leaderboardTable");
//     var row = table.insertRow(-1);
//     row.id = "leaderboardRow" + d.participantID;
//     row.classList.add('leaderboardRow');

//     var rankCell = row.insertCell(0);
//     var nameCell = row.insertCell(1);

//     if (screen.width >= 600) {
//       var distanceCell = row.insertCell(2);
//       var accuracyCell = row.insertCell(3);
//       distanceCell.style.textAlign = 'right';
//       distanceCell.innerHTML = samosas;
//     }
//     else {
//       var accuracyCell = row.insertCell(2);
//     }
//     accuracyCell.style.textAlign = 'right';
//     accuracyCell.innerHTML = Math.round(year);

//     rankCell.innerHTML = '<span class="circle">' + rank + '</span>';
//     nameCell.innerHTML = name;

//     // make winners stand out
//     if ((name == "Oliver Gladfelter" && year == 2023) || (name == "Jason Sikora" && year == 2024) || (name == "Ian McLeod" && year == 2022)) {
//       nameCell.innerHTML += " &#129351;";
//     }

//     row.style.backgroundColor = rowColor;

//     nameCell.style.textAlign = 'left';
//     nameCell.style.fontSize = '18px';

//     // add interactions for rows in leaderboard
//     row.addEventListener("mouseover", function() {
//         console.log(this);
//     });
//     row.addEventListener("mouseout", function() {
//       console.log("out");
//     });
//     row.addEventListener("click", function() { // click a row to show their line in Standings Over Time tab
//       document.getElementById('lineplotRow' + d.participantID).click();
//       console.log('click');
//     });
// }

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

//////////////////////////////////////////////////////////
// Heatmap functions
//////////////////////////////////////////////////////////

function drawHeatmap() {

  // read heatmap data generated by python script
  d3.csv("data/heatmapData.csv").then(function(data) {
    
    const years = [2022, 2023, 2024];

    // Calculate total samosas for each person and sort by highest total
    data.forEach(d => {
      d.total = years.reduce((sum, year) => sum + parseInt(d[year]), 0);
    });
    
    // Sort by total samosas (descending - highest first)
    data.sort((a, b) => b.total - a.total);
    
    const stumblers = data.map(function(d) { return d.name}); // list names sorted by total samosas

    // reformat data into long format
    const heatmapData = [];
    data.forEach(d => {
      years.forEach(year => {
        heatmapData.push({name: d.name, year: year, value: parseInt(d[year])})
      });
    });

    // set the dimensions and margins of the graph
    var margin = {top: 50, right: 0, bottom: 10, left: 180},
        width = screen.width - 150 - margin.left - margin.right,
        height = screen.height - 150 - margin.top - margin.bottom;

    if (screen.width < 600) {
        margin = {top: 50, right: 30, bottom: 10, left: 70},
        width = (screen.width * .95) - margin.left - margin.right,
        height = (screen.width * .95) - margin.top - margin.bottom;
    }

    // Ensure reasonable sizing based on data dimensions
    // Width should accommodate years (3 columns)
    const minCellWidth = 80;
    const minCellHeight = 25;
    
    width = Math.max(width, years.length * minCellWidth);
    height = Math.max(height, stumblers.length * minCellHeight);

    var padding = 0.05;

    // append the svg object to the body of the page
    var svg = d3.select("#heatmap")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Build X scales and axis:
    var x = d3.scaleBand()
        .domain(years)
        .range([ 0, width ])
        .padding(padding);
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0,0)")
        .call(d3.axisTop(x));
    
    // Build Y scales and axis:
    var y = d3.scaleBand()
        .domain(stumblers)
        .range([ 0, height ])
        .padding(padding);
    svg.append("g")
        .attr("class", "axis")
        .attr('transform', 'translate(0, 0)')
        .call(d3.axisLeft(y).tickFormat(function(d) {
          if (screen.width < 600) {
              // Split the name and return just the last part
              return d.split(' ').pop();
          }
          return d; // Return full name for desktop
      }));
    
    // grab the heatmap tooltip
    const heatmapTooltip = d3.select("#heatmapTooltip");
    var mousemove = function(event, d) {

        heatmapTooltip.style("opacity", d.value == 0 ? 0 : 1);
      
        heatmapTooltip
            .html(d.name + " ate<br> " + d.value + " samosas in " + d.year)
            .style('left', event.pageX / window.innerWidth <= 0.5 ? event.clientX + 20 + "px" : event.clientX - heatmapTooltip.node().getBoundingClientRect().width + 25 + 'px')
            .style('top', y(d.name) + heatmapTooltip.node().getBoundingClientRect().height + 25 + "px")
            .style('display', 'block');
    }

    // Build color scale for cells
    var heatmapColors = d3.scaleLinear()
      .domain(d3.extent(heatmapData, function(d) { return (d.value); }))
      .range(["#312e2b", "cyan"]); // from background color of charcoal to less-light cyan
      
    // draw and color the cells
    svg.selectAll()
        .data(heatmapData)
        .enter()
        .append("rect")
        .attr("id", function(d) { return d.name.replaceAll(" ","") + d.year + "Rect"})
        .attr("y", function(d) { return y(d.name) })
        .attr("x", function(d) { return x(d.year) })
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) {return heatmapColors(d.value)} )
        //.style('cursor', function(d) { return d.value > 0 ? 'pointer' : 'default' })
        // .on("mouseover", function(d, data) {
        //   heatmapTooltip.style("opacity", 1);
        //   // if (data.value > 0) {
        //   //   d3.select(this).style("fill", "orange");
        //   // }
        // })
        .on("mousemove", mousemove)
        // .on("mouseleave", function() {
        //   heatmapTooltip.style("opacity", 0);
        //   //d3.select(this).style("fill", function(d) {return heatmapColors(d.value)} );
        // });

    // svg.append('rect')
    //     .attr("y", function(d) { return y('ramaswamy') })
    //     .attr("x", function(d) { return x(1) })
    //     .attr("width", width - 5)
    //     .attr("height", height / data.length )
    //     .style('fill', 'none')
    //     .style('stroke', 'orange')
    //     .style('stroke-width', '2px')
    //     .style('display', 'none')
    //     .attr('id', 'ramaswamyHighlightRect');

    // Build color scale for text label
    var textColor = d3.scaleQuantile()
      .domain(d3.extent(heatmapData, function(d) { return (d.value); })) // pass only the extreme values to a scaleQuantize’s domain
      .range(["white", "white", "white", "black"])

    // labels for squares
    svg.selectAll(".heatmapLabel")
        .data(heatmapData)
        .enter()
        .append("text")
        .text(function(d) { return d.value == 0 ? "" : d.value; })
        .attr("y", function(d) { return y(d.name) + (y.bandwidth() / 2) }) 
        .attr("x", function(d) { return x(d.year) + (x.bandwidth() / 2) }) 
        .style("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr('class', 'heatmapLabel')
        .style("fill", function(d) { return textColor(d.value)})
        .attr('pointer-events', 'none');
            
    // text label for the x axis
    // svg.append("text")             
    //     .attr("transform", "translate(" + (width/2) + " ," + (0 - (margin.top / 3)) + ")")
    //     .style("text-anchor", "middle")
    //     .attr('class', 'heatmapLabel')
    //     .text("Year");

  });
}

readData();

let currentSlide = 0;
const totalSlides = document.querySelectorAll('.carousel-item').length;

function changeSlide(direction) {
  currentSlide += direction;
  
  if (currentSlide >= totalSlides) {
    currentSlide = 0;
  } else if (currentSlide < 0) {
    currentSlide = totalSlides - 1;
  }
  
  const carousel = document.querySelector('.carousel');
  carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
}
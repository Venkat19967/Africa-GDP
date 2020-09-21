var mapSvg;
var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };

var mapData;
var timeData;

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  mapSvg = d3.select('#map');
  lineSvg = d3.select('#linechart');
  lineWidth = +lineSvg.style('width').replace('px','');
  lineHeight = +lineSvg.style('height').replace('px','');;
  lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
  lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;

  // Load both files before doing anything else
  Promise.all([d3.json('data/africa.geojson'),
               d3.csv('data/africa_gdp_per_capita.csv')])
          .then(function(values){
    
    mapData = values[0];
    timeData = values[1];
   
    drawMap();
  })

});

// Get the min/max values for a year and return as an array
// of size=2. You shouldn't need to update this function.
function getExtentsForYear(yearData) {
  var max = Number.MIN_VALUE;
  var min = Number.MAX_VALUE;
  for(var key in yearData) {
    if(key == 'Year') 
      continue;
    let val = +yearData[key];
    if(val > max)
      max = val;
    if(val < min)
      min = val;
  }
  return [min,max];
}

// Draw the map in the #map svg
function drawMap() {

  d3.select("#linear-gradient").remove();
  d3.selectAll('.tick').remove();

  // create the map projection and geoPath
  let projection = d3.geoMercator()
                      .scale(400)
                      .center(d3.geoCentroid(mapData))
                      .translate([+mapSvg.style('width').replace('px','')/2,
                                  +mapSvg.style('height').replace('px','')/2.3]);
  let path = d3.geoPath()
               .projection(projection);

  // get the selected year based on the input box's value
  var year = document.getElementById("year-input").value;

  // get the GDP values for countries for the selected year
  let yearData = timeData.filter( d => d.Year == year)[0];
  
  // get the min/max GDP values for the selected year
  let extent = getExtentsForYear(yearData);

  // get the selected color scale based on the dropdown value
  var colorval = document.getElementById("color-scale-select").value;

  var colorScale = d3.scaleSequential(window["d3"][colorval])
                     .domain(extent);

  var div = d3.select("body").append("div")
  .attr("class", "tooltip-map")
  .style("opacity", 0);
  
  // draw the map on the #map svg
  let g = mapSvg.append('g');
  g.selectAll('path')
    .data(mapData.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', d => {return d.properties.name})
    .attr('class','countrymap')
    .style('fill', d => {
      let val = +yearData[d.properties.name];
      if(isNaN(val) || val == 0) 
        return 'white';
      return colorScale(val);
    })
    .on('mouseover', function(d,i) {
      console.log('mouseover on ' +yearData[d.properties.name]);
      d3.select(this).transition()
               .attr('class', 'countrymap_hover');
      div.transition()
            .duration(50)
            .style("opacity", 1);
      div.html(`Country: ${d.properties.name} <br />GDP: ${+yearData[d.properties.name]}`)
      .style("left", (d3.event.pageX) + 10 + "px")
      .style("top", (d3.event.pageY) + 10 + "px");
    })
    .on('mousemove',function(d,i) {
      console.log('mousemove on ' + d.properties.name);
      div.html(`Country: ${d.properties.name} <br /> GDP: ${+yearData[d.properties.name]}`)
      .style("left", (d3.event.pageX) + 10 + "px")
      .style("top", (d3.event.pageY) + 10 + "px");
    })
    .on('mouseout', function(d,i) {
      console.log('mouseout on ' + d.properties.name);
      d3.select(this).transition()
               .attr('class', 'countrymap');
      div.transition()
               .duration(50)
               .style("opacity", 0);
    })
    .on('click', function(d,i) {
      console.log('clicked on ' + d.properties.name);
    });



  var barHeight = 20;
  var colorScale_legend = d3.scaleSequential(window["d3"][colorval]).domain(extent);

  var axisScale = d3.scaleLinear()
    .domain(colorScale_legend.domain())
    .range([0,220]);

  var axisBottom = g => g
  .attr("class", `x-axis`)
  .attr("transform", `translate(20,500)`)
  .call(d3.axisBottom(axisScale)
    .ticks(7)
    .tickSize(-barHeight));

  let defs = mapSvg.append("defs");
   
  let linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");

  linearGradient.selectAll("stop")
      .data(colorScale_legend.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale_legend(t)})))
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

  mapSvg.append('g')
      .attr("transform", `translate(20,480)`)
      .attr("id", "rect_g")
      .append("rect")
    .attr("width", 220)
    .attr("height", 20)
    .style("fill", "url(#linear-gradient)");
    
    // .style("fill", colorScale(5));
  mapSvg.append('g')
    .call(axisBottom);

    d3.selectAll('line').attr('stroke','white');
    d3.selectAll('path').attr('stroke','white');
    

}



// Draw the line chart in the #linechart svg for
// the country argument (e.g., `Algeria').

function drawLineChart(country) {

  if(!country)
    return;
  
}

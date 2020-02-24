const width = 1200;
const height = 600;
const EducationDataURL = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const CountyDataURL = ' https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

//Create SVG canvas
const svg = d3.select('#cloropethMap').
append('svg').
attr('viewBox', '0 0 ' + width + ' ' + height).
attr('preserveAspectRatio', 'xMinYMin meet');


//Create a path
var path = d3.geoPath();

//Read the JSON files
var jsonFiles = [CountyDataURL, EducationDataURL];
Promise.all(jsonFiles.map(url => d3.json(url))).then(function (data) {

  //Set the color scheme and scale
  var colorDomain = d3.extent(data[1].map(d => d.bachelorsOrHigher));
  var colorScale = d3.scaleQuantile().
  domain(colorDomain).
  range(d3.schemeOranges[9]);

  //tool tip
  var tip = d3.tip().
  attr('id', 'tooltip').
  offset(function () {return [this.getBBox().height / 2, 0];}).
  html(d => {
    var result = data[1].filter(obj => obj.fips == d.id);
    d3.select('#tooltip').attr('data-education', result[0].bachelorsOrHigher);
    return '<span>' + result[0].area_name + ', ' + result[0].state + ': ' + result[0].bachelorsOrHigher + '%' + '</span>';
  });
  svg.call(tip);

  //topoJSON.feature converts RAW geodata into Usable geodata. 
  //Pass data to it, and then get .features out of it
  var counties = topojson.feature(data[0], data[0].objects.counties).features;
  svg.selectAll('.county').
  data(counties).
  enter().append('path').
  attr('class', 'county').
  attr('d', path).
  attr('fill', d => {
    var result = data[1].filter(obj => obj.fips == d.id);
    return colorScale(result[0].bachelorsOrHigher);
  }).
  attr('data-fips', d => d.id).
  attr('data-education', d => {
    var result = data[1].filter(obj => obj.fips == d.id);
    return result[0].bachelorsOrHigher;
  }).
  on('mouseover', tip.show).
  on('mouseout', tip.hide);

  //Draw state lines
  svg.append('path').
  datum(topojson.mesh(data[0], data[0].objects.states, (a, b) => a !== b)).
  attr('class', 'states').
  attr('d', path);


  //legend
  svg.append('g').
  attr('class', 'legend').
  attr('id', 'legend').
  attr('transform', 'translate(' + (width - 200) + ', ' + 70 + ')');

  var colorScale2 = d3.scaleQuantile()
  //divide domain by 100 to show the legend in % format
  .domain(d3.extent(data[1].map(d => d.bachelorsOrHigher / 100))).
  range(d3.schemeOranges[9]);

  var legend = d3.legendColor().
  labelFormat(d3.format('.1%')).
  shapePadding(6).
  shapeWidth(20).
  shapeHeight(30).
  labelAlign('middle').
  labelDelimiter('-').
  labelOffset(5).
  scale(colorScale2);

  svg.select(".legend").
  call(legend);

});
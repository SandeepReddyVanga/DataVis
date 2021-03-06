
function lineChart(id,h,w){

	var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

	//var parseDate = d3.time.format("%Y").parse;

	var x = d3.time.scale()
    		.range([0, width]);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	var line = d3.svg.line()
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.count); });

var svg = d3.selectAll("#"+id).append("svg")
    .attr("width", width )
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("movies.csv", function(error, data) {
	var counts = {}
  data.forEach(function(d) {
    if(!counts[d.year]){
    	counts[d.year] = 0;
    }
    counts[d.year]++;
  });

  console.log(data);
  console.log(counts);

  var newdata = [];
	Object.keys(counts).forEach(function(key) {
	    newdata.push({
	        date: new Date(+key, 0, 1), // convert "Year" column to Date
	        count: counts[key]
	    });
	});

console.log(newdata);

  x.domain(d3.extent(newdata, function(d) { return d.date; }));
  y.domain([0,d3.max(newdata, function(d) { return d.count; })]);

  console.log(x);
  console.log(y);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Number of movies");

  svg.append("path")
      .datum(newdata)
      .attr("class", "line")
      .attr("d", line);
});
}
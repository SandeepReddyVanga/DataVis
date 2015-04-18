function scatter_plot_matrix(id,height,width) {

  var size = 200,
    padding = 35;

var x = d3.scale.linear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scale.linear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(5);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

var color = d3.scale.category10();

d3.csv("state.x77.csv", function(error, data) {
  var domainByTrait = {},
      traits = d3.keys(data[0]).filter(function(d) { return (d == "HS.Grad") || (d == "Illiteracy") || (d == "Life.Exp") || (d == "Murder")  ; }),
      n = traits.length;

  traits.forEach(function(trait) {
    domainByTrait[trait] = d3.extent(data, function(d) { return +d[trait]; });
  });

  xAxis.tickSize(size * n);
  yAxis.tickSize(-size * n);

  var svg = d3.selectAll("#"+id).select("svg")
              .attr("width", size * n + padding)
            .attr("height", size * n + 5*padding)
            .append("g")
            .attr("transform", "translate(" + padding + "," + 3*padding + ")");

  svg.selectAll(".x.axis2")
      .data(traits)
    .enter().append("g")
      .attr("class", "x axis2")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

  svg.selectAll(".y.axis2")
      .data(traits)
    .enter().append("g")
      .attr("class", "y axis2")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

  var cell = svg.selectAll(".cell")
      .data(cross(traits, traits))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) { return d.x; });

  function plot(p) {
    var cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("cx", function(d) { return x(d[p.x]); })
        .attr("cy", function(d) { return y(d[p.y]); })
        .attr("r", 3)
        .attr("data-legend",function(d) { return d.region})
        .style("fill", function(d) { return color(d.region); });
  }

  function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
  }

  svg.append("text")
      .attr("x", 400)             
      .attr("y", 0 - (padding/2))
      .attr("text-anchor", "middle")  
      .style("font-size", "40px") 
      .text("Scatter Plot Matrix");

  legend = svg.append("g")
      .attr("class","legend")
      .attr("transform","translate(650,-30)")
      .style("font-size","10px")
      .call(d3.legend);

  d3.select(self.frameElement).style("height", size * n + padding + 20 + "px");
});
}

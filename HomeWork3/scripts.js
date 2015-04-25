function multiseries_line(id,h,w) {
var margin = {top: 40, right: 100, bottom: 30, left: 100},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;


var parseDate = d3.time.format("%b %Y").parse;

var x = d3.time.scale()
    .range([0,width]);
    
var y = d3.scale.linear()
    .range([height,0]);

var color = d3.scale.ordinal().range(["#FF00FF", "#000000", "#FF0000"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.deaths); });

//Create SVG element
var svg = d3.selectAll("#"+id).select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function make_y_axis() {        
    return d3.svg.axis()
        .scale(y)
        .orient("left")
}

d3.csv("seatBelts.csv", function(error, data) {

  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });

   
color.domain(d3.keys(data[0]).filter(function(key) { return (key == "DriverDeaths") || (key == "FrontDeaths") ||
                                                        (key == "RearDeaths"); }));
   
// first we need to corerce the data into the right formats

  var accidents = color.domain().map(function(name) {
  return {
    name: name,
    values: data.map(function(d) {
      return {date: d.date, deaths: +d[name]};
    })
  };
  });

  console.log(accidents);
  
  
// then we need to nest the data on city since we want to only draw one
// line per city
//data = d3.nest().key(function(d) { return d.city; }).entries(data);


  x.domain(d3.extent(data, function(d) { return d.date; }));

  y.domain([
    d3.min(accidents, function(c) { return d3.min(c.values, function(v) { return v.deaths; }); }),
    d3.max(accidents, function(c) { return d3.max(c.values, function(v) { return v.deaths; }); })
  ]);
                                                                                   
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  svg.append("g")         
  .attr("class", "grid")
  .call(make_y_axis()
      .tickSize(-width, 0, 0)
      .tickFormat(""))

  var driver = svg.selectAll(".drivers")
      .data(accidents)
    .enter().append("g")
      .attr("class", "drivers");

  driver.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); })
      .attr("data-legend",function(d) { return d.name});

  legend = svg.append("g")
      .attr("class","legend")
      .attr("transform","translate(800,30)")
      .style("font-size","12px")
      .call(d3.legend);

  svg.append("text")
      .attr("x", (w / 2)-60)             
      .attr("y", 0 - (margin/2))
      .attr("text-anchor", "middle")  
      .style("font-size", "25px") 
      .text("Time series of Driver, Front-seat and Back-seat passenger Deaths/Injuries");

  //Add a y-axis label.
  svg.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("y", -50)
  .attr("x", -150)
  //.attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .text("Number of Deaths / Injuries");

});                    
}

function stacked_area(id,h,w) {

var margin = {top: 100, right: 10, bottom: 100, left: 40},
    margin2 = {top: 430, right: 10, bottom: 20, left: 40},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom,
    height2 = h - margin2.top - margin2.bottom;

var parseDate = d3.time.format("%b %Y").parse;

var x = d3.time.scale().range([0, width]),
    x2 = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left");

var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brushed);

var area = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.PetrolPrice); });

var area2 = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x2(d.date); })
    .y0(height2)
    .y1(function(d) { return y2(d.PetrolPrice); });

var svg = d3.selectAll("#"+id).select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);


svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

d3.csv("seatBelts.csv", type, function(error, data) {
  x.domain(d3.extent(data.map(function(d) { return d.date; })));
  y.domain([0, d3.max(data.map(function(d) { return d.PetrolPrice; }))]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  focus.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area);

  focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  context.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area2);

  context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", height2 + 7);

  svg.append("text")
      .attr("x", (w / 2)+20)             
      .attr("y", 70)
      .attr("text-anchor", "middle")  
      .style("font-size", "25px") 
      .text("Time series of Petrol Price");

  //Add a y-axis label.
  svg.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("y", 60)
  .attr("x", -60)
  //.attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .text("Petrol Price");

});

function brushed() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  focus.select(".area").attr("d", area);
  focus.select(".x.axis").call(xAxis);
}

function type(d) {
  d.date = parseDate(d.date);
  d.PetrolPrice = +d.PetrolPrice;
  return d;
}

}


/*function bubble_chart(id,height,width) {

// Various accessors that specify the four dimensions of data to visualize.
function state(d) { return d.state_name; }
function x(d) { return d.Illiteracy; }
function y(d) { return d.Murder; }
function radius(d) { return +d.Population; }
function color(d) { return d.region; }

var margin = 100;

//Create SVG element
var svg = d3.selectAll("#"+id).select("svg")
      .append("g")
      .attr("transform", "translate(" + margin + "," + margin + ")");

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<span style='color:red'> State Name: " + state(d) + "<br>Population: "+ radius(d)+ "<br>Illiteracy Rate: " 
          + x(d) + "<br>Murder Rate: " + y(d) +"</span>";
  })

svg.call(tip);

var h = height-(2*margin)
var w = width-(2*margin)

// Defines a sort order so that the smallest dots are drawn on top.
function order(a, b) {
  return radius(b) - radius(a);
}





d3.csv("state.x77.csv", function(error, data){

      
      x_data=data.map(function(d) { return +x(d); });
      y_data=data.map(function(d) { return +y(d); });
      r_data=data.map(function(d) { return +radius(d); });
      col_data=data.map(function(d) { return +color(d); });

      var xScale = d3.scale.linear()
       .domain([d3.min(x_data),d3.max(x_data)])
       .range([20, w ]);


      var yScale = d3.scale.linear()
       .domain([d3.max(y_data), 0])
       .range([0, h]);

      //Define X axis
      var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(5);

    //Define Y axis
    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .tickValues([0, 5, 10, 15]);


  var rScale = d3.scale.linear()
          .domain([d3.min(r_data),d3.max(r_data)])
          .range([w/150, w/20]);

      var colorScale = d3.scale.ordinal()
       //.range(["#7479BC","#7C2833","#E7AC37","BDE7AE","E17250","ECF809","FC6E61"]);
       .range(["orange","pink","cyan","olive"]);

      //Create X axis
      svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);
                  
      //Create Y axis
      svg.append("g")
      .attr("class", "axis")
      .call(yAxis);


      

      // Add a dot per nation. Initialize the data at 1800, and set the colors.
      var dot = svg.append("g")
      .attr("class", "dots")
      .selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", function(d) {
            return xScale( x(d));
      })
      .attr("cy", function(d) {
            return yScale(y(d));
      })
      .style("fill", function(d) { return colorScale(color(d)); })
      .style("stroke", "black")
      .attr("r", function(d) {
            return rScale(radius(d));
      })
      .attr("data-legend",function(d) { return color(d)})
      .sort(order)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);



      legend = svg.append("g")
      .attr("class","legend")
      .attr("transform","translate(50,30)")
      .style("font-size","12px")
      .call(d3.legend);


      // Add an x-axis label.
      svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("y", h+40)
      .attr("x", (w/2)+100)
      //.attr("dy", ".75em")
      .text("illiteracy (percent of population)");

      //Add a y-axis label.
      svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", -50)
      .attr("x", -90)
      //.attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("murder and non-negligent manslaughter rate per 100,000 population");


      svg.append("text")
      .attr("x", (w / 2))             
      .attr("y", 0 - (margin/2))
      .attr("text-anchor", "middle")  
      .style("font-size", "40px") 
      .text("Illiteracy Vs Murder rate");

      });
}*/
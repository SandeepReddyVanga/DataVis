function bubble_chart(svgid,id,h,w) {


	var svg = d3.select("svg#" + svgid);


    // ColorBrewer
    /*var colors = {
        "grey":   "#bbbbbb",
        "blue":   "#377eb8",
        "purple": "#984ea3",
        "green":  "#4daf4a",
        "orange": "#ff7f00"
    };*/


// Various accessors that specify the four dimensions of data to visualize.
function state(d) { return d['state_name']; }
function x(d) { return d['Illiteracy']; }
function y(d) { return d['Murder']; }
function radius(d) { return +d['Population']; }
function color(d) { return d['region']; }


var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<span style='color:red'> State Name: " + state(d) + "<br>Population: "+ radius(d)+ "<br>Illiteracy Rate: " 
    			+ x(d) + "<br>Murder Rate: " + y(d) +"</span>";
  })

var padding = 100;

//Create SVG element
    var svg = d3.selectAll("#"+id).select("svg")
      .append("g")
      .attr("transform", "translate(" + padding + "," + padding + ")");
// Create SVG element (remember use normal CSS style attributes)

//svg.style("border-color", colors.grey);
svg.style("border-width", 1);
svg.style("border-style", "solid");

svg.call(tip);

// Defines a sort order so that the smallest dots are drawn on top.
function order(a, b) {
  return radius(b) - radius(a);
}


d3.csv("state.x77.csv", function(error, dataset){

      
      x_data=dataset.map(function(d) { return +x(d); });
      y_data=dataset.map(function(d) { return +y(d); });
      r_data=dataset.map(function(d) { return +radius(d); });
      col_data=dataset.map(function(d) { return +color(d); });

      //console.log(x_data);
      //console.log(dataset);
      //Create scale functions

        var rScale = d3.scale.linear()
       .domain([d3.min(r_data),d3.max(r_data)])
       .range([w/200, w/20]);

      // find radius of the most most left and bottom points to shift axis.
      //minx_radius=radius(dataset.sort(function(a,b) {return - x(b) + x(a)})[1] ) 
      //miny_radius=radius(dataset.sort(function(a,b) {return - y(b) + y(a)})[1] ) 
      //console.log(rScale(miny_radius ) )

      var xScale = d3.scale.linear()
       .domain([0,d3.max(x_data)])
       .range([0, w-(2*padding) ]);


      var yScale = d3.scale.linear()
       .domain([d3.max(y_data), 0])
       .range([0, h-(2*padding)]);




      var colorScale = d3.scale.category20();


      //Define X axis
      var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(5);

      //Define Y axis
      var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(5);

      // Add a dot per nation. Initialize the data at 1800, and set the colors.
      var dot = svg.append("g")
      .attr("class", "dots")
      .selectAll(".dot")
      .data(dataset)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", function(d) {
            return xScale( x(d));
      })
      .attr("cy", function(d) {
            return yScale(y(d));
      })
      .style("fill", function(d) { return colorScale(color(d)); })
      .attr("r", function(d) {
            return rScale(radius(d));
      })
      //.attr("data-legend",function(d) { return color(d)})
      .sort(order)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);



      //legend = svg.append("g")
      //.attr("class","legend")
      //.attr("transform","translate(50,30)")
      //.style("font-size","12px")
      //.call(d3.legend);


      // Add an x-axis label.
      svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("y", -30)
      .attr("x", 400)
      .attr("dy", ".75em")
      .text("illiteracy (percent of population)");

      //Add a y-axis label.
      svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", -50)
      .attr("x", -100)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("murder and non-negligent manslaughter rate per 100,000 population");


      //Create X axis
      svg.append("g")
      .attr("class", "axis")
      //.attr("transform", "translate(0," + h-100 + ")")
      .call(xAxis);
                  
      //Create Y axis
      svg.append("g")
      .attr("class", "axis")
      .call(yAxis);

      svg.append("text")
      .attr("x", (w / 2))             
      .attr("y", 0 - (padding/2))
      .attr("text-anchor", "middle")  
      .style("font-size", "20px") 
      .text("Illiteracy Vs Murder rate");

      });
}
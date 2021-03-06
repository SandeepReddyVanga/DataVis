function bubble_chart(id,height,width) {

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
}
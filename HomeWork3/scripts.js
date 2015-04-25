function multiseries_line(id,h,w) {
var margin = {top: 40, right: 200, bottom: 100, left: 80},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;


var parseDate = d3.time.format("%b %Y").parse;
var bisectDate = d3.bisector(function(d) { return d.date; }).left;

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
    .y(function(d) { return y(d.deaths); })
    .defined(function(d) { return d.deaths; });  // Hiding line value defaults of 0 for missing data

var maxY;

//Create SVG element
var svg = d3.selectAll("#"+id).select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Create invisible rect for mouse tracking
svg.append("rect")
    .attr("width", width)
    .attr("height", height)                                    
    .attr("x", 0) 
    .attr("y", 0)
    .attr("id", "mouse-tracker")
    .style("fill", "white"); 

function make_y_axis() {        
    return d3.svg.axis()
        .scale(y)
        .orient("left")
}

d3.csv("seatBelts.csv", function(error, data) {

  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });

   
color.domain(d3.keys(data[0]).filter(function(key) { return (key === "DriverDeaths") || (key === "FrontDeaths") ||
                                                        (key === "RearDeaths"); }));
   
// first we need to corerce the data into the right formats

  var accidents = color.domain().map(function(name) {
  return {
    name: name,
    values: data.map(function(d) {
      return {date: d.date,
              deaths: +(d[name]),
            };
    }),
    visible: (name === "DriverDeaths" ? true : false) // "visible": all false except for DriverDeaths.
  };
  });

  console.log(accidents);
  
  
// then we need to nest the data on city since we want to only draw one
// line per city
//data = d3.nest().key(function(d) { return d.city; }).entries(data);


  x.domain(d3.extent(data, function(d) { return d.date; }));

  /*y.domain([
    d3.min(accidents, function(c) { return d3.min(c.values, function(v) { return v.deaths; }); }),
    d3.max(accidents, function(c) { return d3.max(c.values, function(v) { return v.deaths; }); })
  ]);*/
y.domain([0, 400
    //d3.max(accidents, function(c) { return d3.max(c.values, function(v) { return v.deaths; }); })
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

  var driver = svg.selectAll(".driver")
      .data(accidents)
    .enter().append("g")
      .attr("class", "driver");

  /*driver.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); })
      .attr("data-legend",function(d) { return d.name});*/

  driver.append("path")
    .attr("class", "line")
    .style("pointer-events", "none") // Stop line interferring with cursor
    .attr("id", function(d) {
      return "line-" + d.name.replace(" ", "").replace("/", ""); // Give line id of line-(insert issue name, with any spaces replaced with no spaces)
    })
    .attr("d", function(d) { 
      return d.visible ? line(d.values) : null; // If array key "visible" = true then draw line, if not then don't 
    })
    //.attr("clip-path", "url(#clip)")//use clip path to make irrelevant part invisible
    .style("stroke", function(d) { return color(d.name); });

  // draw legend
  var legendSpace = 150 / accidents.length; // 450/number of issues (ex. 40

 
  driver.append("rect")
      .attr("width", 10)
      .attr("height", 10)                                    
      .attr("x", width + (margin.right/3) - 15) 
      .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace) - 8; })  // spacing
      .attr("fill",function(d) {
        return d.visible ? color(d.name) : "#F1F1F2"; // If array key "visible" = true then color rect, if not then make it grey 
      })
      .attr("class", "legend-box")

      .on("click", function(d){ // On click make d.visible 
        d.visible = !d.visible; // If array key for this data selection is "visible" = true then make it false, if false then make it true

        maxY = findMaxY(accidents); // Find max Y rating value categories data with "visible"; true
        y.domain([0,maxY]); // Redefine yAxis domain based on highest y value of categories data with "visible"; true
        svg.select(".y.axis")
          .transition()
          .call(yAxis);   

        driver.select("path")
          .transition()
          .attr("d", function(d){
            return d.visible ? line(d.values) : null; // If d.visible is true then draw line for this d selection
          })

        driver.select("rect")
          .transition()
          .attr("fill", function(d) {
          return d.visible ? color(d.name) : "#F1F1F2";
        });
      })

      .on("mouseover", function(d){

        d3.select(this)
          .transition()
          .attr("fill", function(d) { return color(d.name); });

        d3.select("#line-" + d.name.replace(" ", "").replace("/", ""))
          .transition()
          .style("stroke-width", 2.5);  
      })

      .on("mouseout", function(d){

        d3.select(this)
          .transition()
          .attr("fill", function(d) {
          return d.visible ? color(d.name) : "#F1F1F2";});

        d3.select("#line-" + d.name.replace(" ", "").replace("/", ""))
          .transition()
          .style("stroke-width", 1.5);
      })

    driver.append("text")
      .attr("x", width + (margin.right/3)) 
      .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace); })  // (return (11.25/2 =) 5.625) + i * (5.625) 
      .text(function(d) { return d.name; }); 

    // Hover line 
    //var hoverLineGroup = svg.append("g") 
              //.attr("class", "hoverline");

    //var hoverLine = hoverLineGroup // Create line with basic attributes
    var hoverLine = svg.append("g")
          .append("line")
              //.attr("id", "hoverline")
              .attr("class", "hoverline")
              .attr("x1", 10).attr("x2", 10) 
              .attr("y1", 0).attr("y2", height + 10)
              .style("pointer-events", "none") // Stop line interferring with cursor
              .style("opacity", 1e-6); // Set opacity to zero 

    //var hoverDate = hoverLineGroup
    var hoverDate = svg.append("g")
          .append('text')
              .attr("class", "hovertext")
              .attr("y", 40 ) // hover date text position
              .attr("x", width-150 ) // hover date text position
              .style("fill", "#E6E7E8");

    //console.log(hoverLineGroup);

    var columnNames = ["DriverDeaths", "FrontDeaths", "RearDeaths"];

    console.log(columnNames);

    var focus = driver.select("g") // create group elements to house tooltip text
      .data(columnNames) // bind each column name date to each g element
    .enter().append("g") //create one <g> for each columnName
      .attr("class", "focus");

    console.log(focus);

    focus.append("text") // http://stackoverflow.com/questions/22064083/d3-js-multi-series-chart-with-y-value-tracking
        .attr("class", "tooltip")
        .attr("x", width + 20) // position tooltips  
        .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace); }); // (return (11.25/2 =) 5.625) + i * (5.625) // position tooltips       

    // Add mouseover events for hover line.
    d3.select("#mouse-tracker") // select chart plot background rect #mouse-tracker
    .on("mousemove", mousemove) // on mousemove activate mousemove function defined below
    .on("mouseout", function() {
        hoverDate
            .text(null) // on mouseout remove text for hover date

        hoverLine.style("opacity", 1e-6);

        //d3.select("#hoverline")
            //.style("opacity", 1e-6); // On mouse out making line invisible
    });


    function mousemove() { 
      var mouse_x = d3.mouse(this)[0]; // Finding mouse x position on rect
      var graph_x = x.invert(mouse_x); // 

      //var mouse_y = d3.mouse(this)[1]; // Finding mouse y position on rect
      //var graph_y = yScale.invert(mouse_y);
      //console.log(graph_x);
      
      var format = d3.time.format('%b %Y'); // Format hover date text to show three letter month and full year
      
      hoverDate.text(format(graph_x)); // scale mouse position to xScale date and format it to show month and year
      
      //d3.select("#hoverline") // select hover-line and changing attributes to mouse position
          //.attr("x1", mouse_x) 
          //.attr("x2", mouse_x)
          //.style("opacity", 1); // Making line visible

      hoverLine.attr("x1", mouse_x) 
          .attr("x2", mouse_x)
          .style("opacity", 1); // Making line visible;

      // Legend tooltips // http://www.d3noob.org/2014/07/my-favourite-tooltip-method-for-line.html

      var x0 = x.invert(d3.mouse(this)[0]), /* d3.mouse(this)[0] returns the x position on the screen of the mouse. xScale.invert function is reversing the process that we use to map the domain (date) to range (position on screen). So it takes the position on the screen and converts it into an equivalent date! */
      i = bisectDate(data, x0, 1), // use our bisectDate function that we declared earlier to find the index of our data array that is close to the mouse cursor
      /*It takes our data array and the date corresponding to the position of or mouse cursor and returns the index number of the data array which has a date that is higher than the cursor position.*/
      d0 = data[i - 1],
      d1 = data[i],
      /*d0 is the combination of date and rating that is in the data array at the index to the left of the cursor and d1 is the combination of date and close that is in the data array at the index to the right of the cursor. In other words we now have two variables that know the value and date above and below the date that corresponds to the position of the cursor.*/
      d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      /*The final line in this segment declares a new array d that is represents the date and close combination that is closest to the cursor. It is using the magic JavaScript short hand for an if statement that is essentially saying if the distance between the mouse cursor and the date and close combination on the left is greater than the distance between the mouse cursor and the date and close combination on the right then d is an array of the date and close on the right of the cursor (d1). Otherwise d is an array of the date and close on the left of the cursor (d0).*/

      //d is now the data row for the date closest to the mouse position

      focus.select("text").text(function(columnName){
         //because you didn't explictly set any data on the <text>
         //elements, each one inherits the data from the focus <g>

         return (d[columnName]);
      });
  }; 

  /*legend = svg.append("g")
      .attr("class","legend")
      .attr("transform","translate(800,30)")
      .style("font-size","12px")
      .call(d3.legend);*/

  svg.append("text")
      .attr("x", (w / 2)-140)             
      .attr("y", -20)
      .attr("text-anchor", "middle")  
      .style("font-size", "25px") 
      .text("Time series of Driver, Front-seat and Back-seat passenger Deaths/Injuries");

  //Add a y-axis label.
  svg.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("y", -50)
  .attr("x", -100)
  //.attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .text("Number of Deaths / Injuries");

});

function findMaxY(data){  // Define function "findMaxY"
    var maxYValues = data.map(function(d) { 
      if (d.visible){
        return d3.max(d.values, function(value) { // Return max rating value
          return value.deaths; })
      }
    });
    return d3.max(maxYValues);
  }               
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
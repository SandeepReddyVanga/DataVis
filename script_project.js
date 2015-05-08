function multiseries_line_imports(id,h,w) {
var margin = {top: 40, right: 400, bottom: 100, left: 80},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;


var parseDate = d3.time.format("%Y").parse;
var bisectDate = d3.bisector(function(d) { return d.year; }).left;

var x = d3.time.scale()
    .range([0,width]);
    
var y = d3.scale.linear()
    .range([height,0]);

// 40 Custom DDV colors 
var color = d3.scale.ordinal().range(["#48A36D",  "#56AE7C",  "#64B98C", "#72C39B", "#80CEAA", "#80CCB3", "#7FC9BD", "#7FC7C6", "#7EC4CF", "#7FBBCF", "#7FB1CF", "#80A8CE", "#809ECE", "#8897CE", "#8F90CD", "#9788CD", "#9E81CC", "#AA81C5", "#B681BE", "#C280B7", "#CE80B0", "#D3779F", "#D76D8F", "#DC647E", "#E05A6D", "#E16167", "#E26962", "#E2705C", "#E37756", "#E38457", "#E39158", "#E29D58", "#E2AA59", "#E0B15B", "#DFB95C", "#DDC05E", "#DBC75F", "#E3CF6D", "#EAD67C", "#F2DE8A"]);  

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.volume); })
    .defined(function(d) { return d.volume; });  // Hiding line value defaults of 0 for missing data

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

d3.csv("./ProjectDataSet/fertilizer_imports_timeseries_volume.csv", function(error, data) {

  color.domain(d3.keys(data[0]).filter(function(key) { // Set the domain of the color ordinal scale to be all the csv headers except "date", matching a color to an issue
    return key !== "year"; 
  }));

  data.forEach(function(d) {
    d.year = parseDate(d.year);
  });
   
// first we need to corerce the data into the right formats

  var imports = color.domain().map(function(name) {
  return {
    name: name,
    values: data.map(function(d) {
      return {year: d.year,
              volume: d3.round(d[name]),
            };
    }),
    visible: (name === "Ammonium Sulfate" ? true : false) // "visible": all false except for DriverDeaths.
  };
  });

  console.log(imports);
  
  
// then we need to nest the data on city since we want to only draw one
// line per city
//data = d3.nest().key(function(d) { return d.city; }).entries(data);


  x.domain(d3.extent(data, function(d) { return d.year; }));

  /*y.domain([
    d3.min(accidents, function(c) { return d3.min(c.values, function(v) { return v.deaths; }); }),
    d3.max(accidents, function(c) { return d3.max(c.values, function(v) { return v.deaths; }); })
  ]);*/
y.domain([0, 1500000
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

  var importt = svg.selectAll(".importt")
      .data(imports)
    .enter().append("g")
      .attr("class", "importt");

  /*driver.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); })
      .attr("data-legend",function(d) { return d.name});*/

  importt.append("path")
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
  var legendSpace = 380 / imports.length; // 450/number of issues (ex. 40

 
  importt.append("rect")
      .attr("width", 10)
      .attr("height", 10)                                    
      .attr("x", width + (margin.right/3)-15) 
      .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace) - 8; })  // spacing
      .attr("fill",function(d) {
        return d.visible ? color(d.name) : "#F1F1F2"; // If array key "visible" = true then color rect, if not then make it grey 
      })
      .attr("class", "legend-box")

      .on("click", function(d){ // On click make d.visible 
        d.visible = !d.visible; // If array key for this data selection is "visible" = true then make it false, if false then make it true

        maxY = findMaxY(imports); // Find max Y rating value categories data with "visible"; true
        y.domain([0,maxY]); // Redefine yAxis domain based on highest y value of categories data with "visible"; true
        svg.select(".y.axis")
          .transition()
          .call(yAxis);   

        importt.select("path")
          .transition()
          .attr("d", function(d){
            return d.visible ? line(d.values) : null; // If d.visible is true then draw line for this d selection
          })

        importt.select("rect")
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

    importt.append("text")
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

    var columnNames = d3.keys(data[0])
                        .slice(1); //remove the first column name (`date`);

    console.log(columnNames);

    var focus = importt.select("g") // create group elements to house tooltip text
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
      
      var format = d3.time.format('%Y'); // Format hover date text to show three letter month and full year
      
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
      d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      /*The final line in this segment declares a new array d that is represents the date and close combination that is closest to the cursor. It is using the magic JavaScript short hand for an if statement that is essentially saying if the distance between the mouse cursor and the date and close combination on the left is greater than the distance between the mouse cursor and the date and close combination on the right then d is an array of the date and close on the right of the cursor (d1). Otherwise d is an array of the date and close on the left of the cursor (d0).*/

      //d is now the data row for the date closest to the mouse position

      focus.select("text").text(function(columnName){
         //because you didn't explictly set any data on the <text>
         //elements, each one inherits the data from the focus <g>

         //return (d3.round(d[columnName],1));
         return (d[columnName] == "" ? "" : d3.round(d[columnName],1));
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
      .text("Time series of U.S. Fertilizer Imports");

  //Add a y-axis label.
  svg.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("y", 20)
  .attr("x", -10)
  //.attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .text("Volume in Tons");

});

function findMaxY(data){  // Define function "findMaxY"
    var maxYValues = data.map(function(d) { 
      if (d.visible){
        return d3.max(d.values, function(value) { // Return max rating value
          return value.volume; })
      }
    });
    return d3.max(maxYValues);
  }               
}

function multiseries_line_exports(id,h,w) {
var margin = {top: 40, right: 400, bottom: 100, left: 80},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;


var parseDate = d3.time.format("%Y").parse;
var bisectDate = d3.bisector(function(d) { return d.year; }).left;

var x_e = d3.time.scale()
    .range([0,width]);
    
var y_e = d3.scale.linear()
    .range([height,0]);

// 40 Custom DDV colors 
var color = d3.scale.ordinal().range(["#48A36D",  "#56AE7C",  "#64B98C", "#72C39B", "#80CEAA", "#80CCB3", "#7FC9BD", "#7FC7C6", "#7EC4CF", "#7FBBCF", "#7FB1CF", "#80A8CE", "#809ECE", "#8897CE", "#8F90CD", "#9788CD", "#9E81CC", "#AA81C5", "#B681BE", "#C280B7", "#CE80B0", "#D3779F", "#D76D8F", "#DC647E", "#E05A6D", "#E16167", "#E26962", "#E2705C", "#E37756", "#E38457", "#E39158", "#E29D58", "#E2AA59", "#E0B15B", "#DFB95C", "#DDC05E", "#DBC75F", "#E3CF6D", "#EAD67C", "#F2DE8A"]);  

var xAxis_e = d3.svg.axis()
    .scale(x_e)
    .orient("bottom");

var yAxis_e = d3.svg.axis()
    .scale(y_e)
    .orient("left");

var line_e = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x_e(d.year); })
    .y(function(d) { return y_e(d.volume); })
    .defined(function(d) { return d.volume; });  // Hiding line value defaults of 0 for missing data

var maxY_e;

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
        .scale(y_e)
        .orient("left")
}

d3.csv("./ProjectDataSet/fertilizer_exports_timeseries_volume.csv", function(error, data) {

  color.domain(d3.keys(data[0]).filter(function(key) { // Set the domain of the color ordinal scale to be all the csv headers except "date", matching a color to an issue
    return key !== "year"; 
  }));

  data.forEach(function(d) {
    d.year = parseDate(d.year);
  });
   
// first we need to corerce the data into the right formats

  var exports = color.domain().map(function(name) {
  return {
    name: name,
    values: data.map(function(d) {
      return {year: d.year,
              volume: d3.round(d[name]),
            };
    }),
    visible: (name === "Ammonium Sulfate" ? true : false) // "visible": all false except for DriverDeaths.
  };
  });

  console.log(exports);
  
  
// then we need to nest the data on city since we want to only draw one
// line per city
//data = d3.nest().key(function(d) { return d.city; }).entries(data);


  x_e.domain(d3.extent(data, function(d) { return d.year; }));

  /*y.domain([
    d3.min(accidents, function(c) { return d3.min(c.values, function(v) { return v.deaths; }); }),
    d3.max(accidents, function(c) { return d3.max(c.values, function(v) { return v.deaths; }); })
  ]);*/
y_e.domain([0, 1500000
    //d3.max(accidents, function(c) { return d3.max(c.values, function(v) { return v.deaths; }); })
  ]);
                                                                                   
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis_e);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis_e);

  svg.append("g")         
  .attr("class", "grid")
  .call(make_y_axis()
      .tickSize(-width, 0, 0)
      .tickFormat(""))

  var exportt = svg.selectAll(".exportt")
      .data(exports)
    .enter().append("g")
      .attr("class", "exportt");

  /*driver.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); })
      .attr("data-legend",function(d) { return d.name});*/

  exportt.append("path")
    .attr("class", "line")
    .style("pointer-events", "none") // Stop line interferring with cursor
    .attr("id", function(d) {
      return "line-" + d.name.replace(" ", "").replace("/", ""); // Give line id of line-(insert issue name, with any spaces replaced with no spaces)
    })
    .attr("d", function(d) { 
      return d.visible ? line_e(d.values) : null; // If array key "visible" = true then draw line, if not then don't 
    })
    //.attr("clip-path", "url(#clip)")//use clip path to make irrelevant part invisible
    .style("stroke", function(d) { return color(d.name); });

  // draw legend
  var legendSpace = 400 / exports.length; // 450/number of issues (ex. 40

 
  exportt.append("rect")
      .attr("width", 10)
      .attr("height", 10)                                    
      .attr("x", width + (margin.right/3)-15) 
      .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace) - 8; })  // spacing
      .attr("fill",function(d) {
        return d.visible ? color(d.name) : "#F1F1F2"; // If array key "visible" = true then color rect, if not then make it grey 
      })
      .attr("class", "legend-box")

      .on("click", function(d){ // On click make d.visible 
        d.visible = !d.visible; // If array key for this data selection is "visible" = true then make it false, if false then make it true

        maxY_e = findMaxY(exports); // Find max Y rating value categories data with "visible"; true
        y_e.domain([0,maxY_e]); // Redefine yAxis domain based on highest y value of categories data with "visible"; true
        svg.select(".y.axis")
          .transition()
          .call(yAxis_e);   

        exportt.select("path")
          .transition()
          .attr("d", function(d){
            return d.visible ? line_e(d.values) : null; // If d.visible is true then draw line for this d selection
          })

        exportt.select("rect")
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

    exportt.append("text")
      .attr("x", width + (margin.right/3)) 
      .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace); })  // (return (11.25/2 =) 5.625) + i * (5.625) 
      .text(function(d) { return d.name; }); 

    // Hover line 
    //var hoverLineGroup = svg.append("g") 
              //.attr("class", "hoverline");

    //var hoverLine = hoverLineGroup // Create line with basic attributes
    var hoverLine_e = svg.append("g")
          .append("line")
              //.attr("id", "hoverline")
              .attr("class", "hoverline")
              .attr("x1", 10).attr("x2", 10) 
              .attr("y1", 0).attr("y2", height + 10)
              .style("pointer-events", "none") // Stop line interferring with cursor
              .style("opacity", 1e-6); // Set opacity to zero 

    //var hoverDate = hoverLineGroup
    var hoverDate_e = svg.append("g")
          .append('text')
              .attr("class", "hovertext")
              .attr("y", 40 ) // hover date text position
              .attr("x", width-150 ) // hover date text position
              .style("fill", "#E6E7E8");

    //console.log(hoverLineGroup);

    var columnNames = d3.keys(data[0])
                        .slice(1); //remove the first column name (`date`);

    console.log(columnNames);

    var focus_e = exportt.select("g") // create group elements to house tooltip text
      .data(columnNames) // bind each column name date to each g element
    .enter().append("g") //create one <g> for each columnName
      .attr("class", "focus_e");

    console.log(focus);

    focus_e.append("text") // http://stackoverflow.com/questions/22064083/d3-js-multi-series-chart-with-y-value-tracking
        .attr("class", "tooltip")
        .attr("x", width + 20) // position tooltips  
        .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace); }); // (return (11.25/2 =) 5.625) + i * (5.625) // position tooltips       

    // Add mouseover events for hover line.
    d3.select("#mouse-tracker") // select chart plot background rect #mouse-tracker
    .on("mousemove", mousemove) // on mousemove activate mousemove function defined below
    .on("mouseout", function() {
        hoverDate_e
            .text(null) // on mouseout remove text for hover date

        hoverLine_e.style("opacity", 1e-6);

        //d3.select("#hoverline")
            //.style("opacity", 1e-6); // On mouse out making line invisible
    });


    function mousemove() { 
      var mouse_x = d3.mouse(this)[0]; // Finding mouse x position on rect
      var graph_x = x_e.invert(mouse_x); // 

      //var mouse_y = d3.mouse(this)[1]; // Finding mouse y position on rect
      //var graph_y = yScale.invert(mouse_y);
      //console.log(graph_x);
      
      var format = d3.time.format('%Y'); // Format hover date text to show three letter month and full year
      
      hoverDate_e.text(format(graph_x)); // scale mouse position to xScale date and format it to show month and year
      
      //d3.select("#hoverline") // select hover-line and changing attributes to mouse position
          //.attr("x1", mouse_x) 
          //.attr("x2", mouse_x)
          //.style("opacity", 1); // Making line visible

      hoverLine_e.attr("x1", mouse_x) 
          .attr("x2", mouse_x)
          .style("opacity", 1); // Making line visible;

      // Legend tooltips // http://www.d3noob.org/2014/07/my-favourite-tooltip-method-for-line.html

      var x0 = x_e.invert(d3.mouse(this)[0]), /* d3.mouse(this)[0] returns the x position on the screen of the mouse. xScale.invert function is reversing the process that we use to map the domain (date) to range (position on screen). So it takes the position on the screen and converts it into an equivalent date! */
      i = bisectDate(data, x0, 1), // use our bisectDate function that we declared earlier to find the index of our data array that is close to the mouse cursor
      /*It takes our data array and the date corresponding to the position of or mouse cursor and returns the index number of the data array which has a date that is higher than the cursor position.*/
      d0 = data[i - 1],
      d1 = data[i],
      /*d0 is the combination of date and rating that is in the data array at the index to the left of the cursor and d1 is the combination of date and close that is in the data array at the index to the right of the cursor. In other words we now have two variables that know the value and date above and below the date that corresponds to the position of the cursor.*/
      d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      /*The final line in this segment declares a new array d that is represents the date and close combination that is closest to the cursor. It is using the magic JavaScript short hand for an if statement that is essentially saying if the distance between the mouse cursor and the date and close combination on the left is greater than the distance between the mouse cursor and the date and close combination on the right then d is an array of the date and close on the right of the cursor (d1). Otherwise d is an array of the date and close on the left of the cursor (d0).*/

      //d is now the data row for the date closest to the mouse position

      focus_e.select("text").text(function(columnName){
         //because you didn't explictly set any data on the <text>
         //elements, each one inherits the data from the focus <g>

         return (d3.round(d[columnName],1));
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
      .text("Time series of U.S. Fertilizer Exports");

  //Add a y-axis label.
  svg.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("y", 20)
  .attr("x", -10)
  //.attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .text("Volume in Tons");

});

function findMaxY(data){  // Define function "findMaxY"
    var maxYValues = data.map(function(d) { 
      if (d.visible){
        return d3.max(d.values, function(value) { // Return max rating value
          return value.volume; })
      }
    });
    return d3.max(maxYValues);
  }               
}


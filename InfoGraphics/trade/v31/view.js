
function tradeMapVisualization () {


  idb.product.all = "All Products";
  // Remove the average timeline
  idb.period.periodType.active = false;
  idb.period.dropDownHeight -= idb.period.periodType.size[1];
  idb.period.timeline.position[1] -= idb.period.periodType.size[1];
  idb.period.play.position[1] -= idb.period.periodType.size[1];
  // configure the interfaces (menus)
  idb.product.showPeat = false;
  idb.product.showNonTradeProducts = false;
  idb.flow.onlyTrade = true;
  idb.tabSpacing = [200,200,160,160];
  var interfaces = idb.menuBar (theSVG, theVIS, [idb.country, idb.product, idb.period, idb.flow, idb.scale]);
  var countryInterface = interfaces[0];
  var productInterface = interfaces[1];
  var periodTypeInterface = interfaces[2];
  var flowInterface = interfaces[3];
  var scaleInterface = interfaces[4];

  /* Disable countries with no data */
  countryInterface.active(countries);

  /* Set the default country */
  countryInterface.select([defaultCountry]);

  /* Set active periods */
  var periods = [];
  for (var i = 0; i < years.length; i++) {
    periods.push(years[i]+"");
  }
  periodTypeInterface.active(periods);

  /* Set Default period */
  periodTypeInterface.select (defaultPeriod);

  /* Set Default product */
  productInterface.select(defaultProduct);

  /* Set Default units */ 
  scaleInterface.select(defaultScale);

  /* Set Default flow */
  flowInterface.select(defaultFlow);


  // Creates source legend
  var sourceLegends = function () {


    var legendGroup = theSVG.insert("g", "g.dropDownCombo")
      .attr("class", "legends");
    legendGroup.append ("rect")
      .style({fill:"white"})
      .attr({x:0,y:svgheight-35,width:width+80,height:35});
    legendGroup.append ("text")
      .attr({
        class: "sourceLegend",
        x : width-10,
        y : svgheight-10,
        "text-anchor": "end"
      })
      .text(TL("Source: UN COMTRADE, in 2000 US$"));
  }

  // The current visualization variant
  var currentVis;

  // Function to be called whenever a new variant is selected
  var variantCallback = function () {};

  // Function to build the variant visualization navigation
  var variantNavigation = function () {
    var self = this;
    var visName = ["Map", "Ranking", "Totals"];
    var visTitle = ["Trade map", "Partner ranking", "Totals by product"];
    currentVis = visName [0];
    var w = theSVG.attr("width"), h = theSVG.attr("height");
    var xsize = 10, ysize = 30, margin = 7;
    var subtitle = theSVG.select("g.legends").append("text")
      .attr ({
        class: "subtitle",
        x: 20,
        y: 60,
      });
    var nextVis = theSVG.append("g")
      .attr("class", "variantVisArrow")
      .attr ("transform", "translate("+(w-margin-xsize)+","+(h/2+ysize)+")");

    var prevVis = theSVG.append("g")
      .attr("class", "variantVisArrow")
      .attr ("transform", "translate("+margin+","+(h/2+ysize)+")");

    prevVis.append("rect").attr({
      x: -margin*3-2,
      y: -ysize*1.5,
      width:xsize*4+margin*2,
      height:ysize*4,
      rx:5,
      ry:5,
    });

    nextVis.append("rect").attr({
      x: -margin*3-2,
      y: -ysize*1.5,
      width:xsize*4+margin*2,
      height:ysize*4,
      rx:5,
      ry:5,
    });

    nextVis.append ("polyline")
      .attr("points", "0,0 "+(xsize)+","+(ysize/2)+" 0,"+ysize);
    nextVis.append ("text")
      .attr ("transform", "translate("+(-margin)+","+(ysize/2)+") rotate(-90)")
      .attr ("text-anchor", "middle")
      .text ("next");
    prevVis.append ("polyline")
      .attr("points", ""+xsize+",0 0,"+(ysize/2)+" "+xsize+","+ysize);
    prevVis.append ("text")
      .attr ("transform", "translate("+(margin*3)+","+(ysize/2)+") rotate(-90)")
      .attr ("text-anchor", "middle")
      .text ("prev");
    var switchVariant = function (increment) {
      var i = (visName.indexOf(currentVis)+increment+3)%3;
      currentVis = visName [i];
      subtitle.text(TL(visTitle[i]));
      var n = (i+1)%3;
      nextVis.select("text").text(TL(visTitle[n]));
      var p = (i+2)%3;
      prevVis.select("text").text(TL(visTitle[p]));
    }
    switchVariant (0);
    prevVis.on("click", function () { switchVariant(-1); variantCallback(); });
    nextVis.on("click", function () { switchVariant(1); variantCallback(); });

  }




  // Projection object for the map
  var projection;

  // A country name to centroid mapping
  var centroidsbyname; 

  // A null transformation
  var nullTransform = {tx : width/2, ty: height/2, s: 1.0 };

  // Previous and Current transformations
  var previousTransform = nullTransform;
  var currentTransform = nullTransform;

  // Functions to transform a point to the current view
  var fx = function (x) { 
    return (x - currentTransform.tx) * currentTransform.s + width/2; 
  };

  var fy = function (y) { 
    return (y - currentTransform.ty) * currentTransform.s + height/2; 
  };

  // Function called by clickableMap whenever the current map view changes.
  // When called, the transformation is set to 
  // translate(width/2,height/2) scale(s) translate(tx,ty)
  var setTransform = function (tx, ty, s) {};

  // A div to serve as a tool tip container
  var tooltip = d3.select("body")
      .append("div")
      .attr ("class", "arrow_box noselect");

  // How to draw the circles
  var circlePath = function (node) {
    var func = trianglePath;//roundTrianglePath;//pacmanPath;//trianglePath;
    if (node.trade.flow == "Imports") { 
      return func (0,0,0.95,180);
    } else {
      return func (0,0,0.95,0);
    }
  } 

  // Creates an element inside the current selection for representing a node
  var tradeElement = function (node) {
    var path = d3.select(this).append("path");//.attr("vector-effect", "non-scaling-stroke");
    path.attr("d", circlePath(node));
    /*
    if (node.trade.flow != "Imports") {

      path.attr({
        //d: "M 69.159472,0.49078328 A 77.059898,77.059898 0 1 0 146.95987,77.550683 77.059898,77.059898 0 0 0 69.159472,0.49078328 Z M 24.701029,27.905745 l 24.451467,0 20.006976,31.12046 20.005468,-31.12046 23.71097,0 -31.86095,46.681441 33.34195,48.902934 -23.70946,0.7405 -21.487978,-32.601457 -21.487971,32.601457 -24.451467,0 L 56.561985,75.327684 24.701029,27.905745 Z",
        //d: "M 0 -0.50976562 L 61.191406 80.746094 L 0 163.93945 L 75.359375 163.93945 L 99.28125 131.28516 L 124.12891 163.93945 L 200 163.93945 L 136.96094 80.3125 L 196.20312 -0.50976562 L 120.94531 -0.50976562 L 98.871094 29.773438 L 75.769531 -0.50976562 L 0 -0.50976562 z ",
        d:"M 29.111775,24.04764 A 99.999999,100 0 0 0 8.2245048,54.66039 L 48.321055,94.75693 8.2907948,134.78719 A 99.999999,100 0 0 0 29.110395,165.46761 99.999999,100 0 0 0 59.723155,186.35488 L 99.821077,146.25696 139.85272,186.28859 A 99.999999,100 0 0 0 170.53314,165.469 99.999999,100 0 0 0 191.42041,134.85624 L 151.3211,94.75693 191.35274,54.7253 A 99.999999,100 0 0 0 170.53175,24.04626 99.999999,100 0 0 0 139.91901,3.15899 L 99.821077,43.25691 59.790825,3.22666 A 99.999999,100 0 0 0 29.111775,24.04764 Z",
        transform: " scale(0.008) translate(-100,-100)",
      });   
    }
    else {
      path.attr({
        //d: "M 71.953614,-0.909066 A 77.059898,77.059898 0 1 0 149.01351,76.150832 77.059898,77.059898 0 0 0 71.953614,-0.909066 Z m -45.939442,29.637959 22.228469,0 24.451465,39.271952 24.451468,-39.271952 22.229976,0 -0.742,93.361377 -20.005475,0 0,-60.758417 -25.933969,40.012447 -0.740492,0 -25.93397,-39.27195 0,60.75841 -20.005472,0 0,-94.101867 z",
        //d: "M -0.671875 -0.93554688 L -0.671875 162.79883 L 71.859375 162.79883 L 71.859375 80.822266 L 99.328125 112.47461 L 126.79688 80.822266 L 126.79688 162.79883 L 199.32812 162.79883 L 199.32812 -0.93554688 L 129.05078 -0.93554688 L 99.328125 33.185547 L 69.714844 -0.93554688 L -0.671875 -0.93554688 z ",
        d:"M 67.149905,0.77933 A 100.00056,100.00056 0 0 0 0,95.10751 100.00056,100.00056 0 0 0 67.143995,189.43765 L 72.298767,189.43765 72.298767,94.98145 100.00099,131.45288 127.70321,94.98145 127.70321,189.43765 132.8501,189.43765 A 100.00056,100.00056 0 0 0 200.00001,95.10751 100.00056,100.00056 0 0 0 132.85601,0.77933 L 129.97627,0.77933 100.00099,40.09307 70.136008,0.77933 67.149905,0.77933 Z",
        transform: " scale(0.008) translate(-100,-100)",
      });
    }*/
  } 

  // Radii of the trade elements of the legend
  var tradeElementRadii = [25, 12, 6];
  // Draws a box with a legend for the trade elements
  var createTradeElementLegend = function () {
    var dx = [45,50,35,30];
    var dy = [45,45,20];
    
    var sum = function (arr, first, last) {
      var s = 0.0;
      for (var i = first; i < last; i++) {s += arr[i];}
      return s;
    } 
    tradeElementLegend = theSVG.append ("g")
      .attr("id", "tradeElementLegend")
      .attr("transform", "translate (10,450)");
 
    var x = function (i) { return sum(dx,0,i) + dx[i]/2; }
    var y = function (j) { return sum(dy,0,j) + dy[j]/2; }
    var data = [];
    for (var i = 1; i < 4; i++) {
      data.push ({
        trade: {flow:"Imports"},
        radius: tradeElementRadii[i-1],
        x: x(i),
        y: y(0)
      });
      data.push ({
        trade: {flow:"Exports"},
        radius: tradeElementRadii[i-1],
        x: x(i),
        y: y(1)
      });
    }
    tradeElementLegend.append("rect")
      .attr({
        x: -5,
        y: -5,
        width: sum(dx,0,4)+10,
        height: sum(dy,0,3)+10,
        rx: 5, ry:5,
      })
      .style("fill", "white")
      .style("stroke", "lightgray");
    tradeElementLegend.selectAll("g.tradeElementSample")
      .data(data)
      .enter()
      .append("g")
      .classed("tradeElementSample", true)
      .attr("transform", function(d) {
        return "translate("+d.x+","+d.y+")";
      })
      .append("g").classed("tradeElement", true).each(tradeElement)
      .style({fill:"white", 
              stroke:"darkgray",
              "stroke-width" : function(d) { return 1.0/d.radius; }
            })
      .attr ("transform", function (d) {
          return "scale("+d.radius+")";
      });
    tradeElementLegend.selectAll("text.legendText")
      .data([{ x: x(0), y:y(0), t: TL("Imports"), id: ""},
             { x: x(0), y:y(1), t: TL("Exports"), id: ""},
             { x: x(1), y:y(2), t: "$400", id: "amountBig"},
             { x: x(2), y:y(2), t: "$200", id: "amountMedium"},
             { x: x(3), y:y(2), t: "$100", id: "amountSmall"}])
      .enter()
      .append("text")
      .each (function (d) {
        d3.select(this)
          .attr(d)
          .attr({class: "legendText", "text-anchor" : "middle", dy: "0.5em" })
          .style({"font-size":"9px"})
          .text(d.t);
      })
  }

  // Sets amount labels for the legend with corresponding values
  var updateTradeElementLegend = function () {
    var ids = ["amountBig", "amountMedium", "amountSmall"];
    for (var i = 0; i < 3; i++) {
      d3.select("#"+ids[i]).text(valueFormat(amountFromRadius(tradeElementRadii[i])));
    }
  } 

  // Updates a circle with the proper transform
  var nodeTransform = function (node) {
    if (node) return "translate("+node.x+","+node.y+")";
    return "translate (10,10)";
  }

  // Transformation for a node that is to disappear
  var nullNodeTransform = function (node) {
    if (node) return "translate("+node.x+","+node.y+") scale(1)";
    return "translate (10,10)";
  }



  //
  // Creates a clickable map on svg. Calls doneFunction when done
  //
  function clickableMap(doneFunction) {

    var centered;

    projection = d3.geo.mercator()
        .scale(170)
        .translate([width / 2 * 0.93, height * 0.55])
        .precision(.1);

    var path = d3.geo.path()
        .projection(projection);

    var countrygroup = theVIS.append("g").attr("class", "map");

    var background = countrygroup.append("rect")
        .attr("class", "background")
        .attr("x",-width)
        .attr("y",-height)
        .attr("width", 3*width)
        .attr("height", 3*height)
        .on("mousedown", mousedown)
        .on("mouseup", mouseup)
        .on("mousemove", mousemove)
        .on("click", countryClicked);
   

    // 
    var countries;

    // Read the world map topojson and at end calls doneFunction
    function readTopoJson (doneFunction) {
      d3.json(mapDataFolder+"/world-50m.json", function(error, world) {
        if (error) throw error;

        // The countries and country neighbors
        countries = topojson.feature(world, world.objects.countries).features;

        // Chain to the next function
        if (doneFunction) doneFunction ();
      })
    }


    // Reads a table with country names and ids, attaches country names to
    // the countries data structure 
    // and calls doneFunction at the end
    function readCountryNames (doneFunction) {  
      // Read country names table
      d3.tsv(mapDataFolder+"/world-country-names.tsv", function (error, names) {
        if (error) throw error;

        // Build an id-to-name array mapping
        var namesbyid = {};
        names.forEach (function (n) {
          if (n.id>0) namesbyid[n.id] = n.name;
        });

        // Attach the name field to the country data
        var unknown = 0;
        var unlabeled = [undefined, undefined, "Kashmir", "Kosovo", "Eritrea"];
        countries.forEach (function (c) {
          c.name = namesbyid[c.id] || unlabeled[unknown++] || "Unknown Country"+(unknown-1);
          if (countrySynonym[c.name]) c.name = countrySynonym[c.name];
        });

        if (doneFunction) doneFunction();
      });
    }

    // Reads a table with country centroids, 
    // attaches a centroid field to each country and calls doneFunction when done
    function readCountryCentroids (doneFunction) {

      d3.csv (mapDataFolder+"/country-centroids.csv", function (error, centroids) {
        if (error) throw error;

        // A country name to centroid mapping
        centroidsbyname = {};
        centroids.forEach (function (c) {
          centroidsbyname[c.name] = c; 
        });


        // Attach the name field to the country data
        countries.forEach (function (c) {
          var centroid = centroidsbyname[c.name];
          if (centroid) c.centroid = [centroid.long, centroid.lat];
        });

        if (doneFunction) doneFunction();

      });
    } 

    // Plots the countries
    function plotCountries () {
      countrygroup.selectAll(".country")
        .data(countries)
      .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .on("mousemove", mousemove)
        .on("mousedown", mousedown)
        .on("mouseup", mouseup)
        .on("click", countryClicked);
    }

    // Variable that tells whether a transition is in effect
    var transitionInProgress = false;

    // Functions that implement map panning
    var mouseIsDown = false;
    var dragging = false;

    var zoomX = width/2, zoomY = height/2, zoomScale = 1;
    function setZoom (x,y,k,instant) {
      zoomX = x; zoomY = y; zoomScale = k;

      var group = instant ? countrygroup : countrygroup.transition().duration(750)  ;


      var newStrokeWidth = 0.5 / k + "px";

      countrygroup.selectAll("path")
          .classed("active", centered && function(d) { return d === centered; })
          .style("stroke-width", newStrokeWidth);

      var transform = "translate(" + width / 2 + "," + height / 2 + 
                      ")scale(" + k + ")translate(" + -x + "," + -y + ")";

      var newStrokeWidth = 0.5 / k + "px";
      group.attr("transform", transform);

      setTransform(x,y,k,instant);
    }


    function mousemove(d) {
      if (mouseIsDown && zoomX != undefined) {
        dragging = true;
        var dx = d3.event.clientX - mousePos[0], dy = d3.event.clientY - mousePos[1];
        setZoom (zoomX-dx/zoomScale, zoomY-dy/zoomScale, zoomScale, true);
        mousePos = [d3.event.clientX, d3.event.clientY];
      }
    }

    function mousedown(d) {
      dragging = false;
      mouseIsDown = true;
      mousePos = [d3.event.clientX, d3.event.clientY];
    }

    function mouseup(d) {
      mouseIsDown = false;
    }

    // Callback function when a country is clicked
    function countryClicked(d) {
      var x, y, k;

      if (dragging) return;

      if (transitionInProgress) return; // Must finish all transitions to accept another click
      transitionInProgress = true;

      if (d && centered !== d) {
        var centroid;
        if (d.centroid) {
          centroid = projection (d.centroid);
        }
        else {
          centroid = path.centroid(d);
        }
        x = centroid[0];
        y = centroid[1];
        var s =  Math.sqrt(path.area(d));
        k = s <= 2 ? 40 : (s < 20 ? 10 : (s < 70 ? 4 : 3)) ;
        centered = d;
      } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
      }
      setZoom(x,y,k);


      //setZoom (-x,-y,k);

      // countrygroup.transition()
      //     .duration(750)
      //     .attr("transform", transform);

      // When all transitions are done, unset the flag
      window.setTimeout(function () {
        transitionInProgress = false;      
      }, 750);
    }

    d3.select(self.frameElement).style("height", height + "px");

    readTopoJson(function() {
      readCountryNames (function () {
        readCountryCentroids (function () {
          plotCountries (countries);
          if (doneFunction) doneFunction();
        }) 
      })
    })
  }

  // Returns an array of objects from an input country data table
  // filtered by year. Fields partner, product and flow are 
  // replaced by their text descriptions (rather than id)
  function getYearData (countryData,year) {
    var data = [];
    countryData.forEach (function(d) {
      if (d.year != year) return;
      if (d.value > 1000000) { // Filter out small values (less than 1M dollars)
        data.push ({
          partner: cat.country[d.partner],
          year: parseInt(d.year),
          product: cat.product[d.product],
          flow: cat.flow[d.flow],
          value: parseFloat(d.value)
        })
      }
    });
    return data;
  }

  // Returns data filtered by the items selected in the product and flow menus
  function filterProductsFlows (data) {

    // Which products will become nodes?
    var products = {};

    var menuProd = productInterface.selectedData()[0];
    for (var i = 0; i < prod.length; i++) {
      if (menuProd == "All Products" || menuProd == menuProdNames[i]) {
        products[prod[i]] = true;
      }
    }

    // Which flows will become nodes?
    var menuFlow = flowInterface.selectedData()[0]; 
    var flows = {
      Imports: (menuFlow == "Imports" || menuFlow == "Both"), 
      Exports: (menuFlow == "Exports" || menuFlow == "Both"),
    };

    var retData = [];
    data.forEach (function (d) {
      if (!products[d.product]) return; // Ignore non-selected products
      if (!flows[d.flow]) return; // Ignore non-selected flows
      retData.push(d) ;
    }); 

    return retData;
  }

  // This function totalizes the amounts by country, product and flow, returning
  // this information as a hash (dictionary) whose keys are these categories
  function totalizeData (data, amountType) {
    // Totalize amounts
    var byPartner = {}, byProduct = {}, byFlow = { Imports : { all: 0.0 }, Exports : { all : 0.0 } };
    data.forEach (function (d) {
      var amount = d[amountType];
      if(!byFlow [d.flow]) byFlow [d.flow] = { all : 0 };
      byFlow [d.flow].all += amount;
      byFlow [d.flow][d.product] = (byFlow [d.flow][d.product] || 0.0) + amount;
      if (!byProduct[d.product]) byProduct [d.product] = { all : 0 };
      byProduct [d.product].all += amount;
      byProduct [d.product][d.flow] = (byProduct [d.product][d.flow] || 0.0) + amount;
      if (!byPartner[d.partner]) byPartner [d.partner] = { all : 0 };
      byPartner [d.partner].all += amount;
      byPartner [d.partner][d.flow] = (byPartner[d.partner][d.flow] || 0) + amount;
      byPartner [d.partner][d.product] = (byPartner [d.partner][d.product] || 0) + amount;
    });
    return {byPartner: byPartner, byFlow : byFlow, byProduct: byProduct};
  }

  // Returns an array of strings that splits txt into lines with no more than maxchars
  function splitText(txt,maxchars) {
    var lines = [];
    while (txt.length > maxchars) {
      var i = maxchars-1;
      while (i > 0 && txt[i]!=" ") i--;
      if (i > 0) {
        lines.push (txt.substr(0,i));
        txt = txt.substr(i+1);
      } else {
        lines.push (txt.substr(0,maxchars));
        txt = txt.substr(maxchars);
      }
    }
    lines.push(txt);
    return lines;
  }


  // Callback to visualize a country 
  function visualizeCountry(countryData) {

    var data; // Data for the current year

    var countryPosition; // Maps countries to a focus point

    var partners; // Array with all partners of the country

    var products; // Array with all products imported or exported for the current year

    var total; // Structure for storing totals by partner / flow / product

    var nodePosition; // Function that computes a node position from a data item

    var displayType = currentVis; // What visualization variant?



    // Generates and returns an array of nodes 
    function getNodes(data) {

      // Which amount type to use for the circle sizes
      var amountType = "value";


      // Clear the previous transformation since were starting from scratch
      var tmp = previousTransform;
      previousTransform = nullTransform;


      // compute a proper radius scale
      var totalAmount = Math.max (1, total.byFlow.Exports.all,total.byFlow.Imports.all);
      var amountToRadius = areaRatio * Math.sqrt(width*height) / Math.sqrt(totalAmount);
      ratio = (scaleInterface.selectedData()[0] == "fixed") ? 0.0002 : amountToRadius;
      radiusFromAmount = function (amount) {
        return minimumRadius + Math.sqrt(amount) * ratio;
      }
      amountFromRadius = function (radius) {
        var amt = (radius-minimumRadius) / ratio;
        return amt*amt;
      }
      //
      // Compute a function to position the partner countries' amount elements
      // 
      if (displayType == "Map") {
        // Position by country centroid
        countryPosition = function (cname) {
          var countryName = countrySynonym[cname] || cname;
          var centroid = centroidsbyname [countryName] || { long: 0.0, lat: 0.0 };
          var pos = projection ([centroid.long, centroid.lat]);
          return pos;
        }
      } 
      else if (displayType == "Ranking") {
        // Rank partners according to total
        partners.sort (function (a,b) {
          return Math.sign (total.byPartner[b].all-total.byPartner[a].all);
        });


        // Compute rows and columns
        countryGrid.cols = Math.min(10, partners.length);
        var nonEmptyProducts = [];
        var maxPerCol = [];
        var colSum = 0;
        for (var i = 0; i < countryGrid.cols; i++) {
          var partner = partners[i];
          var rowMax = 0;
          for (var j = 0; j < products.length; j++) {
            var p = products[j];
            if (total.byPartner[partner][p]) {
              var space = radiusFromAmount(total.byPartner[partner][p]);
              rowMax = Math.max(rowMax,space);
              if (nonEmptyProducts.indexOf(p) == -1) {
                nonEmptyProducts.push(p);
              }
            }
          }
          maxPerCol [i] = rowMax;
          colSum += rowMax;
        }
        products = nonEmptyProducts;
        countryGrid.rows = nonEmptyProducts.length;
        var maxPerRow = [];
        var rowSum = 0;
        for (var j = 0; j < products.length; j++) {
          var p = products[j];
          var colMax = 0;
          for (var i = 0; i < countryGrid.cols; i++) {
            var partner = partners[i];
            if (total.byPartner[partner][p]) {
              var space = radiusFromAmount(total.byPartner[partner][p]);
              colMax = Math.max(colMax,space);
            }
          }
          maxPerRow [j] = colMax;
          rowSum += colMax;
        }

        // Compute horizontal space allocated per col
        var deltax = (width - countryGrid.marginLeft - countryGrid.marginRight);
        var fixedDx = deltax * 0.6, variableDx = deltax - fixedDx;
        var x0 = [countryGrid.marginLeft];
        var w = [];
        for (var i = 0; i < countryGrid.cols; i++) {
          w[i] = fixedDx / countryGrid.cols + variableDx * maxPerCol[i] / colSum;
          x0[i+1] = x0[i] + w[i];
        }
        var y0 = [countryGrid.marginTop];
        var deltay = (height - countryGrid.marginTop - countryGrid.marginBottom);
        var fixedDy = deltay * 0.6, variableDy = deltay - fixedDy;
        var h = []
        for (var i = 0; i < countryGrid.rows; i++) {
          h [i] = fixedDy / countryGrid.rows + variableDy * maxPerRow[i] / rowSum;
                  //deltay / countryGrid.rows;
          y0 [i+1] = y0[i]+h[i];
        }

        // compute the countryGrid cell rectangle function
        countryGrid.cellRect = function (row,col) {
          return { x: x0[col],
                   y: y0[row],
                   w: w[col],
                   h: h[row] }
        }

        // Map from partner name to its col in the Country grid
        var partnerCol = {};
        for (var i = 0; i < partners.length; i++) {
          partnerCol [partners[i]] = i;
        }
        // Map from product name to its row in the Country grid
        var productRow = {};
        for (var i = 0; i < products.length; i++) {
          productRow [products[i]] = i;
        }

        // Function to compute  a partner's cell rect 
        countryGrid.partnerProductCell= function (partner,product) {
          var row = productRow[product] || 0;
          var col = partnerCol[partner];
          if (col != undefined && col < countryGrid.cols) {
            return countryGrid.cellRect(row,col);
          } 
          return {x: -1000, y: -1000, w: 0, h: 0 };
        }



      } 


      //
      // Set function to position a node
      //
      if (displayType == "Map") {
        // Position depends on country name
        nodePosition = function (d) { return countryPosition (d.partner) }
      } 
      else if (displayType == "Ranking") {
        nodePosition = function (d) {
          var rect = countryGrid.partnerProductCell (d.partner,d.product);
          return [rect.x + rect.w/2, rect.y + rect.h/2];
        }
      }
      else if (displayType == "Totals") {
        // Layout according to products and flows : imports above and exports below
          
        // Compute totals by product
        var sprod = {};
        for (var flow in total.byFlow) {
          for (var prod in total.byFlow[flow]) {
            if (prod == "all") continue;
            sprod[prod] = (sprod[prod] || 0) + total.byFlow[flow][prod];
          }
        }
        // apply sqrt scale and compute sum
        var stotal = 0.0;
        var nprod = 0;
        for (var prod in sprod) {
          sprod[prod] = Math.sqrt(sprod[prod]);
          stotal += sprod[prod];
          nprod+=1;
        }

        // Sort products by value
        products.sort (function (a,b) { return Math.sign (sprod[b]-sprod[a]); });

        // Compute horizontal offsets
        var offset = {all: productGrid.marginLeft/2};
        var xsize = {};
        var deltax = width - productGrid.marginLeft - productGrid.marginRight;
        var dx0 = deltax*0.8, dx1 = deltax-dx0;
        var x = productGrid.marginLeft;
        for (var iprod = 0; iprod < products.length; iprod++) {
          var prod = products [iprod];
          var dx = dx0 / nprod + dx1 * sprod[prod] / stotal;
          offset [prod] = x + dx/2;
          xsize [prod] = dx;
          x += dx;
        }

        // Compute y space layout
        productGrid.ySpace = height - productGrid.gap*6 - productGrid.marginTop - productGrid.marginBottom 
                     - productGrid.importExportSep - productGrid.totalsHeight*2;
        productGrid.yImport = productGrid.marginTop + productGrid.gap;
        productGrid.yImportTotal = productGrid.yImport + productGrid.ySpace/2 + productGrid.gap;
        productGrid.ySep = productGrid.yImportTotal + productGrid.gap + productGrid.totalsHeight;
        productGrid.yExport = productGrid.ySep + productGrid.importExportSep + productGrid.gap;
        productGrid.yExportTotal = productGrid.yExport + productGrid.gap + productGrid.ySpace/2;
        productGrid.xOffset = offset;
        productGrid.xSize = xsize;

        nodePosition = function (d) {
          if (d.flow == "Imports") {
            return [productGrid.xOffset[d.product], productGrid.yImport+productGrid.ySpace/4];
          }
          else {
            return [productGrid.xOffset[d.product], productGrid.yExport+productGrid.ySpace/4];
          }
        }
        
      }

      // Create the nodes
      var nodes = [];
      data.forEach (function (d) {
        var amount = d[amountType];
        var r = radiusFromAmount(amount);
        if (amount != 0.0) {
          var pos = nodePosition (d);
          var x = pos[0], y = pos[1];
          if (displayType=="Map") {
            x = fx(x); y = fy(y);
          }
          nodes.push ({
            trade : d,
            x:x, 
            y:y, 
            px:x,
            py:y,
            focus : [x,y],
            //halfspace : d.flow=="Imports"?[0,-1]:[0,1], // ?[-1,0]:[1,0], 
            amount : amount,
            radius : r 
          });
        }
      });

   
      // Restore previous Transformation
      previousTransform = tmp;

      return nodes;
    }

    // The force layout algorithm
    var force = d3.layout.force()
        .gravity(0.001)
        .friction(0.5)
        .charge(function(d, i) { return -1; })
        .size([width, height]);
    force.stop();

    // The selected node
    var selected = null;

    // Function to format energy values
    valueFormat = function(d) {
      //return "$"+d3.format(",.1r")(d/1000000)+"m";
      return "$"+(d/1000000).energyFormat()+"m";
    }

    // Show info for the currently selected node
    var showInfo = function () {
      if (selected == null) {
        //tooltip.style("visibility", "hidden");
        return;
      }

      //tooltip.style("visibility", "visible");
      var trade = selected.trade;
      var value = valueFormat (trade.value);
      var flow = trade.flow == "Imports" ? "(M)" : "(X)";
      if (displayType == "Map")
        tooltip.html ("<b>"+TL(trade.partner)+"</b><br>"+TL(shortProd(trade.product))+"<br>"+TL(flow)+" "+value);
      else if (displayType == "Ranking")
        tooltip.html ("<b>"+TL(shortProd(trade.product))+"</b><br>"+TL(flow)+" "+value);
      else 
        tooltip.html ("<b>"+TL(trade.partner)+"</b><br>"+TL(flow)+" "+value);

      var svgRect = theSVG.node().getBoundingClientRect();
      var selRect = selectedElement.node().getBoundingClientRect();//svgPosition(selectedElement);
      var tipRect = tooltip.node().getBoundingClientRect();
      var body = d3.select ("body").node();
      var top = selRect.top-tipRect.height-10+body.scrollTop;
      var left = selRect.left+selRect.width/2-tipRect.width/2;

      tooltip.style ("top", top+"px");
      tooltip.style ("left", left+"px");

    }

    // Creates the actual display for the current product / year
    var changeVis = function () {

      // Get current year and filter data
      // var year = parseInt(d3.select("#yearMenu").property("value"));

      var year = parseInt(periodTypeInterface.selectedData()[0]);

      energy.updateAbstract(
        theSVG.select("g.legends text.subtitle").text(),
        TL(countryInterface.selectedData()[0]),
        TL(productInterface.selectedData()[0]),
        year,
        TL(flowInterface.selectedData()[0]),
        TL(scaleInterface.selectedData()[0]));

      data = filterProductsFlows(getYearData(countryData,year));
      total = totalizeData (data, "value");

      

      // Computes an array of all partner names
      partners = [];
      for (var key in total.byPartner)  {
          partners.push(key);
      };

      // Computes an array of all product names
      products = [];
      for (var key in total.byProduct) {
        products.push(key);
      }


      // Show / hide map according to display
      displayType = currentVis;
      var mapVisible = displayType == "Map";
      d3.select ("g.map").style("visibility", mapVisible ? "visible" : "hidden");
      d3.select ("rect.background").style("pointer-events", mapVisible ? "all" : "none");

      // Create a group for the partner ranking decorations 
      var granking = theVIS.select("g.ranking");
      if (granking.size() == 0) granking = theVIS.append("g").attr("class", "ranking");
      granking.style("visibility", (displayType == "Ranking") ? "visible" : "hidden");

      // Create a group for the by product totals decorations 
      var gtotals = theVIS.select("g.producttotals");
      var gtotalsdecorations = gtotals.select("g.decorations");
      if (gtotals.size() == 0) {
        gtotals = theVIS.append("g").attr("class", "producttotals");
        gtotalsdecorations = gtotals.append("g").attr("class","decorations");
      }
      gtotals.style("visibility", (displayType == "Totals") ? "visible" : "hidden");


      // Get the nodes and partners
      var nodes = getNodes (data, "value");

      // Clear selected 
      selected = null;
      tooltip.style("visibility", "hidden");
  

      // Color partner countries in the map
      d3.selectAll("path.country")
        .classed("partner", function(d) { 
          return partners.indexOf(d.name) >= 0; 
        });

      // Set up circles
      force.nodes(nodes);
      force.stop();

      // Create a group for the trade circles
      var gtrade = theVIS.select("g.tradecircles");
      if (gtrade.size() == 0) gtrade = theVIS.append("g").attr("class", "tradecircles");

      // Data join using partner and flow as key
      var update = gtrade.selectAll("g.trade").data(nodes, function (d) {
        return d.trade.partner + "-" + d.trade.flow + "-" + d.trade.product;
      });
      var enter = update.enter();
      var exit = update.exit();

      // Update circle and nodes
      update.each (function (d,i) {
        var group = d3.select(this);
        group.transition().duration(1000).attr("transform", nodeTransform);
        var path = group.select ("g.tradeElement");
        path.transition().duration(1000).attr ("transform", function (d) {
          return "scale("+d.radius+")";
        });
      });
   
      // Create new circles for the enter selection
      enter.append ("g")
        .attr ("class", function (d,i) { 
          return "trade "+ d.trade.flow + " " + d.trade.product.split(/[\s,]+/)[0]; 
        })
        .attr ("transform", nodeTransform)
        .on ("mousedown", function (d, i) {
          if (selected == d) {
            tooltip.style("visibility", "hidden");
            selected = null;
          } else {
            tooltip.style("visibility", "visible");
            selected = d; 
            d.fixed = true; 
          }
          selectedElement = d3.select(this); 
          showInfo ();
          d3.event.stopPropagation(); 
        })
        // .append ("path")
        // .attr ("d", function (d,i) { return circlePath (d) })
        .append("g").classed("tradeElement", true).each(tradeElement)
        .attr ("transform", "scale(0.1)")
        .transition()
        .duration(1000)
        .attr ("transform", function (d) {
          return "scale("+d.radius+")";
        })
        //.call(tradePath)
        //.attr ("d", function (d,i) { return circlePath (d) })
        ;

      // Remove the exiting circles
      //exit.select("path")
      exit.select("g.tradeElement")
        .transition().duration(1000)
        .attr("transform", "scale(0.1)");
      exit.transition().delay(1000).remove();


      //
      // Set up the country labels
      //

      // Create a group for the labels if not already there
      theVIS.selectAll("g.countrylabels").data([1]).enter().append("g").attr("class", "countrylabels");

      // Data join for country labels
      theVIS.select("g.countrylabels").selectAll("text.countrylabel").remove();
      var countryLabels = theVIS.select("g.countrylabels")
        .selectAll("text.countrylabel")
        .data(partners, function (d) { return d })
        .enter();

      // Create new labels
      countryLabels
        .append("text")
        .attr ("class", "countrylabel")
        .attr ("text-anchor", "start")
        .selectAll("tspan").data (function(d) { 
          var lines = splitText (TL(d), 15);
          if (total.byPartner[d].Imports) lines.push ("*IMP. "+ valueFormat(total.byPartner[d].Imports));
          if (total.byPartner[d].Exports) lines.push ("*EXP. "+ valueFormat(total.byPartner[d].Exports));
          return lines;
        })
          .enter()
          .append ("tspan")
          .classed ("amountlabel", function(d) { return d[0]=="*" })
          .attr("x", 0)
          .attr("dy", "1.1em")
          .text(function (d) { return d[0]=="*" ? d.substring(1) : d; });


      // Update 
      theVIS.select("g.rankingProductLabels").remove();
      if (displayType != "Ranking") {
        theVIS.selectAll("text.countrylabel").style ("visibility", "hidden");
      }
      else {
        // Draw decorations
        granking.selectAll("rect.colrect").remove();
        granking.selectAll("rect.colrect").data(d3.range(0,countryGrid.cols,2))
          .enter()
          .append("rect")
          .each(function(d,i) {
            var rect = countryGrid.cellRect(0,d);
            var h = height - countryGrid.marginTop - countryGrid.marginBottom
                    +countryGrid.labelHeight+countryGrid.labelSep;
            d3.select(this).attr({
              class: "colrect decoration",
              x: rect.x,
              y: countryGrid.marginTop-countryGrid.labelHeight-countryGrid.labelSep,
              width: rect.w,
              height: h
            });
          });
 
        // Update country label positions
        theVIS.selectAll("text.countrylabel")
          .style ("visibility", "visible")
          .attr ("transform", function (d) {
            var n = d3.select (this).selectAll("tspan").size();
            var rect = countryGrid.partnerProductCell (d);
            return "translate("+(rect.x+rect.w/2-6*n)+","+(rect.y-countryGrid.labelSep)+") rotate(-90)";
          });

        // Create product labels
        theVIS.append("g").attr("class","rankingProductLabels")
          .selectAll("text")
          .data(products)
          .enter()
          .append("text")
          .attr ("class", "productlabel")
          .attr ("text-anchor", "end")
          .attr ("transform", function (d) {
            var rect = countryGrid.partnerProductCell(partners[0],d);
            var lines = splitText (TL(d), 15);
            var n = lines.length;
            return "translate("+(rect.x-countryGrid.labelSep)+","+(rect.y+rect.h/2-6*n)+")";
          })
          .selectAll("tspan").data (function(d) { 
            var lines = splitText (menuProdNames[prod.indexOf(d)], 15);
            return lines;
          })
          .enter()
          .append ("tspan")
          .attr("x", 0)
          .attr("dy", "1.1em")
          .text(function (d) { return d; });

      }
      
      //
      // Update legend of trade elements
      //
      theSVG.select("#tradeElementLegend").style("visibility", displayType == "Map" ? "visible" : "hidden");
      updateTradeElementLegend();

      // 
      // Set up product labels
      //

      // Data join 
      if (displayType == "Totals") {
        var decorations = gtotals.selectAll ("rect.decoration");
        
        // Create decorations
        gtotalsdecorations.selectAll ("rect.decoration").remove();
        gtotalsdecorations.selectAll ("rect.decoration")
          .data (d3.range(0,products.length,2))
          .enter()
          .append("rect")
          .each (function(d) {
            var p = products[d];
            d3.select(this)
              .attr({
                class: "decoration",
                x: productGrid.xOffset[p]-productGrid.xSize[p]/2,
                y: productGrid.marginTop-productGrid.prodLabelHeight,
                width: productGrid.xSize[p],
                height: height-productGrid.marginBottom-productGrid.marginTop+productGrid.prodLabelHeight
              })
            });

        // a white line separating imports and exports
        gtotalsdecorations.append("rect")
          .attr({
            class: "decoration",
            x: productGrid.marginLeft, 
            y: productGrid.yImportTotal+productGrid.totalsHeight,
            height: 6,
            width: width -productGrid.marginLeft-productGrid.marginRight
          })
          .style("fill", "white");

        gtotals.selectAll("text.marginlabel")
          .data([[productGrid.marginLeft/2, productGrid.yImport+productGrid.ySpace*0.25,"Imports"],
                 [productGrid.marginLeft/2, productGrid.yImportTotal-productGrid.totalsLineSep,"Total"],
                 [productGrid.marginLeft/2, productGrid.yExport+productGrid.ySpace*0.25,"Exports"],
                 [productGrid.marginLeft/2, productGrid.yExportTotal-productGrid.totalsLineSep,"Total"],
                ])
          .enter()
          .append ("text")
          .attr("class", "marginlabel")
          .each (function(d) {
            d3.select(this)
              .attr({x:d[0], y:d[1], "text-anchor" : "middle"})
              .text(TL(d[2]))
            });
      

        // Place the product labels 
        var productLabels = gtotals
          .selectAll("text.productlabel")
          .data(products, function (d) { return d });
        

        productLabels.enter()
          .append("text")
          .attr ("text-anchor", "middle")
          .attr ("class", "productlabel")
          .selectAll("tspan").data (function(d) { 
            d = menuProdNames[prod.indexOf(d)];
            return splitText (TL(d), 13);
          })
            .enter()
            .append ("tspan")
            .attr("x", 0)
            .attr("dy", "1.1em")
            .text(function (d) { return TL(d); });

        // Place total amounts
        var productAmounts = gtotals
          .selectAll("text.amountlabel")
          .data(products.concat(["all"]), function (d) { return d });
        productAmounts.enter()
          .append("text")
          .attr ("text-anchor", "middle")
          .attr ("class", "amountlabel")
          .each (function (d,i) {
            var txt = d3.select(this);
            txt.append ("tspan").attr ("class", "import");
            txt.append ("tspan").attr ("class", "export");
          });

        // Remove unused products
        productLabels.exit()
          .remove();
        productAmounts.exit()
          .remove();

        // Update positions and amounts
        gtotals.style("visibility", "visible");
        gtotals.selectAll("text.amountlabel")
          .each(function (d,i) {
            var txt = d3.select(this);
            var x = productGrid.xOffset[d];
            var yi = productGrid.yImportTotal;
            var ye = productGrid.yExportTotal;
            var y = yi+productGrid.totalsHeight/2 + (d == "all" ? productGrid.totalsLineSep:0);
            txt.attr("transform", "translate("+x+","+y+")")
            txt.select("tspan.import")
              .text(total.byFlow["Imports"][d] ? valueFormat(total.byFlow["Imports"][d]) : "")
              .attr("x", 0)
              .attr("dy", 0);
            txt.select("tspan.export")
              .text(total.byFlow["Exports"][d] ? valueFormat(total.byFlow["Exports"][d]) : "")
              .attr("x", 0)
              .attr("dy", ye-yi);   
          });
        gtotals.selectAll("text.productlabel")
          .attr ("transform", function (d) {
            var n = d3.select (this).selectAll("tspan").size();
            return "translate("+productGrid.xOffset[d]+","+(productGrid.marginTop-productGrid.prodLabelHeight/2)+")";
          });
      }


      // Restart the physics
      force.start();

      dummy = 0;

      // Iterative relaxation loop
      force.on("tick", function(e) {

        // Push nodes toward their designated focus.
        var f = 0.3*e.alpha;

        nodes.forEach(function(o, i) {
          var dx = (o.focus[0] - o.x);
          var dy = (o.focus[1] - o.y);
          o.y += dy*f;
          o.x += dx*f;
          // if (o.halfspace) {
          //   var dot = dx*o.halfspace[0] + dy*o.halfspace[1];
          //   if (-dot < o.radius) {
          //     o.x += o.halfspace[0]*Math.abs(dot)*f;
          //     o.y += o.halfspace[1]*Math.abs(dot)*f;
          //   }
          // }
        });

        // Do collision detection
        var q = d3.geom.quadtree(nodes),
            i = 0,
            n = nodes.length;

        while (i < n) {
          q.visit(collide(nodes[i]));
          i++;
        }

        //console.log (e.alpha);

        // Move to their final position
        theVIS.selectAll("g.trade")
            .attr("transform", nodeTransform);
            showInfo();
      });

      // The collision relaxation procedure
      function collide(node) {
        var r = node.radius + 1,
            nx1 = node.x - r,
            nx2 = node.x + r,
            ny1 = node.y - r,
            ny2 = node.y + r;
        return function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = (node.radius + quad.point.radius)+1;
            if (l < r) {
              l = (l - r) / l * .1;
              x *= l;
              y *= l;
              if (!node.fixed) {
                node.x -= x ;
                node.y -= y ;
              }
              if (!quad.point.fixed) {
                quad.point.x += x;
                quad.point.y += y;
              }
            }
          }
          return x1 > nx2
              || x2 < nx1
              || y1 > ny2
              || y2 < ny1;
        };
      }

    }  

    // Drag balls
    theVIS.on("mousemove", function() {
      if (selected != null && selected.fixed)  {
        var p = d3.mouse(theVIS.node());
        selected.px = selected.x = p[0];
        selected.py = selected.y = p[1];
        showInfo();
        force.resume();
      }
    });
    theVIS.on ("mousedown", function() {
      selected = null;
      tooltip.style("visibility", "hidden");
      showInfo();
    });
    theVIS.on ("mouseup", function () { 
      if (selected != null) {
        selected.fixed = false;
      }
      //selected = null; 
      force.resume();
      showInfo();
    });


    // Rewrite the zooming transform callback so that the balls go to the right place
    setTransform = function (tx,ty,s,instant) {

      var group = d3.selectAll("g.trade");
      
      // Functions to remap to new transformation 
      var newfx = function (x) {
        x = (x - width/2)/currentTransform.s+currentTransform.tx;
        return (x - tx) * s + width/2;
      }
      var newfy = function (y) {
        y = (y - height/2)/currentTransform.s+currentTransform.ty;
        return (y - ty) * s + height/2;
      }

      // Remap nodes
      group.each(function (d) {
        d.x = d.px = newfx(d.x);
        d.y = d.py = newfy(d.y);
        d.focus = [newfx(d.focus[0]), newfy(d.focus[1])];
      })

      // Set the current transformation
      currentTransform = {tx: tx, ty: ty, s: s};

      if (instant) {
        d3.selectAll ("g.trade").attr ("transform", nodeTransform);
      }
      else {    
        // Stop the physical simulation and restart it after transition
        force.stop();
        d3.selectAll ("g.trade").transition().duration(750).attr ("transform", nodeTransform);
        window.setTimeout(function () {
          force.start();
        }, 750);
      }
    }

    /* Bindings for the interface */
    periodTypeInterface.onChange = changeVis;
    productInterface.onChange = changeVis;
    scaleInterface.onChange = changeVis;
    flowInterface.onChange = changeVis;
    variantCallback = changeVis;
    changeVis();

  };
/*****/

  // Loads data for the country selected in the country menu and
  // calls the visualization function
  function loadCountry () {
    // Get current country
    //var country = d3.select("#countryMenu").property("value");
    var country = countryInterface.selectedData()[0];

    // Load country data
    d3.csv (dataFolder+"/"+country+".csv", function (error,data) {
      if (error) {
        alert (error);
        return;
      }

      d3.selectAll("path.country")
          .classed("current", function(d) { return d.name == country; });

      visualizeCountry(data);
    });
  }


  // Id to category names map
  var cat = {
    country : {},
    product : {},
    flow: {}
  };

  // Read categories table, builds the cat data structure and
  // and call doneFunction when done
  function readCategories (doneFunction) {
    d3.csv (dataFolder+"/categories.csv", function (error,data) {
      if (error) {
        alert (error);
        return;
      }

      // Build category name map
      for (var i = 0; i < data.length; i++) {
        var d = data[i];
        cat [d.axis][d.id] = d.name;
      }

      if (doneFunction) doneFunction();

    });
  }


  sourceLegends();
  variantNavigation();
  createTradeElementLegend();

  clickableMap(function () {
    readCategories (function () {
      loadCountry();
    })
  });

  // Attach the country menu callback
  //d3.select("#countryMenu").on("change", loadCountry);
  countryInterface.onChange = loadCountry;
}


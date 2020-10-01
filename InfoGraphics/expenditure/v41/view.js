function expenditureVisualization() {

  /**
   * Created by Wesley on 03/03/2016.
   */

   /* Alter the margins by creating a group and adding a transformation */

  var newGroup = theVIS.append("g").attr("transform", "translate(20,30)");
  width -= 40;
  height -= 40;
  theVIS = newGroup;

  var w = width -180, h = height - 100;
  w = 6*w/5;
  var tooltip;
  var svg;
  var energyRectSelectKey;
  var electricityRectSelectKey = "#electricityRect", gasSelectKey = "#gasRect", othersSelectKey = "#othersRect", transportSelectKey = "#transportRect";
  var MAX, RECT_HEIGHT, RECT_WIDTH, HORIZONTAL_OFFSET, VERTICAL_OFFSET;
  var chartsChanged = false;
  var uniqueCountries = [];
  var csvDataArray;
  var SEPARATOR = ",";
  var BORDER_WIDTH = 2;
  var textFieldsProportion = 0.1;
  var rectFieldsProportion = (1 - 3*textFieldsProportion)/2;
  var energyRectsHorizontalBoundary = (textFieldsProportion + rectFieldsProportion)*w;
  var percentRectsX = energyRectsHorizontalBoundary + textFieldsProportion*w;
  var guideLinesOffset = 5.5;

  var countryInterface; // The country menu
  var periodInterface;  // The period menu
  var productInterface;


  //
  // Creates source legend
  //
  var sourceLegends = function () {
    var legendGroup = theSVG.insert("g")
      .attr("class", "legends");
    legendGroup.append ("text")
      .attr({
        class: "sourceLegend",
        x : width-5,
        y : svgheight-15,
        "text-anchor": "end"
      })
      .text(TL("Source: Country Household Surveys"));
  }


  // 
  // Create the IDB menus
  //
  function createMenus() {
    // Remove the average timeline
    idb.period.periodType.active = false;
    idb.period.dropDownHeight -= idb.period.periodType.size[1];
    idb.period.timeline.position[1] -= idb.period.periodType.size[1];
    idb.period.play.position[1] -= idb.period.periodType.size[1];

    var interfaces = idb.menuBar (theSVG, theVIS, [idb.country, idb.incomeProducts, idb.period]);

    countryInterface = interfaces[0];
    productInterface = interfaces[1];
    periodInterface = interfaces[2];

    /* Set default country */
    countryInterface.select([defaultCountry]);

    /* Set active periods */
    var periods = [];
    for (var i = 0; i < years.length; i++) {
      periods.push(years[i]+"");
    }
    periodInterface.active(periods);

    /* Set default year */
    periodInterface.select([defaultPeriod]);


    /* Set default product */
    productInterface.select(defaultProduct);
  }


  ///@function countriesChange
  ///Changes the update function when the country on the country selection menu has changed
  function countriesChange()
  {
      country = countryInterface.selectedData()[0];
      var chartData = makeChartData(csvDataArray);
      updateVisualizationData(chartData);
      updateAbstract();
  }

  ///@function productChange
  ///Changes the update function when the product on the product selection menu has changed
  function productChange()
  {
    var product = productInterface.selectedData()[0];
    selectProduct(product);
    
  }

  function selectProduct(product)
  {
    updateAbstract();
      if(product === "Transport fuels") product = "Transport";
    var animationDelay = 0;
    var animationDuration = 1000;
    var classes = ["Electricity", "Gas", "Others", "Transport"];

    if(product !== "All Sources")
    {
      for(var j = 0; j < classes.length; j++)
      {
       theVIS.selectAll("." + classes[j])
       .classed("productDimmed",function(d)
                               {
                                 if(this.tagName === "rect") return false;
                                 else return true;
                               })
       .classed("rectangleDimmed",function(d)
                               {
                                 if(this.tagName === "rect") return true;
                                 else return false;
                               })
       .classed("productSelected",false)
       .classed("percentRectangleVisible", false)
       .classed("energyRectVisible", false);
     }

     theVIS.selectAll("." + product)
     .classed("productDimmed",false)
     .classed("productSelected",function(d)
                             {
                               if(this.tagName === "rect") return false;
                               else return true;
                             })
     .classed("energyRectSelected", function(d)
                                   {
                                     var id = d3.select(this).attr("id")
                                     if(this.tagName === "rect" && id.search("Percent") !== -1) return false;
                                     else return true;
                                   })
     .classed("percentRectangleSelected", function(d)
                                   {
                                     var id = d3.select(this).attr("id")
                                     if(this.tagName === "rect" && id.search("Percent") !== -1) return true;
                                     else return false;
                                   })
     .classed("rectangleDimmed",false)
     .classed("energyRectVisible",false)
     .classed("percentRectangleVisible",false)
     .attr("filter",function(d){ /*if(this.tagName === "rect") return "url(#dropShadow)"*/ });
    }
    else
    {
      for(var j = 0; j < classes.length; j++)
      {
        theVIS.selectAll("." + classes[j])
        .classed("productDimmed",function(d)
                                      {
                                        if(this.tagName === "rect") return false;
                                        else return true;
                                      })
        .classed("productSelected",false)
        .classed("energyRectSelected", false)
        .classed("percentRectangleSelected", false)
        .classed("energyRectVisible", function(d)
                                      {
                                        var id = d3.select(this).attr("id")
                                        if(this.tagName === "rect" && id.search("Percent") !== -1) return false;
                                        else return true;
                                      })
        .classed("percentRectangleVisible", function(d)
                                      {
                                        var id = d3.select(this).attr("id")
                                        if(this.tagName === "rect" && id.search("Percent") !== -1) return true;
                                        else return false;
                                      })
        .classed("rectangleDimmed",false)
        .attr("filter","");
      }
    }
  }

  ///@function formatNumber
  ///Formats a number string with the precision given and using the globally defined separator
  ///@param {number} The number to be formatted into a string
  ///@param {precision} The float precision to be used
  function formatNumber(number, precision)
  {
      if (precision == 1)
        return number.numberFormat(",.1f")(number);
      return number.numberFormat(",.0f")(number);
  }

  ///@function formatTooltip
  ///Makes the hmtl for the tooltip to bem displayed when clicking on a chart rectangle
  ///@param {product} The product string to be shown as the tooltip title
  ///@param {value} The corresponding product value
  ///@param {percent} The corresponding product percent
  function formatTooltip(product, value, percent)
  {
      var result = "  <table>";
      var precision = 2;

      result += "<tr><td style='color:black; font-weight: bold;'>" + product + "</td></tr>";
      result += "<tr><td style='color:black;'> $" + formatNumber(value, precision) + "</td></tr>";
      result += "<tr><td style='color:black;'>" + formatNumber(percent, precision) + "%</td></tr>";

      result += "</table>";
      return result;
  }

  ///@function makePercentRects
  ///Makes the charts corresponding to the percent data of each product on each quintile
  ///@param {dataArray} The array containing the data
  ///@param {animationDelay} The time (in milliseconds) to be used as delay to start animations
  ///@param {animationDuration} The time (in milliseconds) to be used as the animation length
  function makePercentRects(dataArray, animationDelay, animationDuration)
  {
    if(tooltip === undefined)
    {
        tooltip = d3.tip()
          .attr('class', 'd3-tip');

         tooltip.direction('n');
         theVIS.call(tooltip);
    }

    var labelAttributeName = "Name";
    var max = dataArray[dataArray.length - 1];


    theVIS.selectAll("#electricityPercentText").data(dataArray).enter().append("text")
    .attr("id", "electricityPercentText")
    .attr("class", "Electricity productDimmed")
    .attr("x", function(d){return percentRectsX + RECT_WIDTH * (0.5 * d["Electricity (Percent)"]/max["Energy (Percent)"]);})
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 0.9)*VERTICAL_OFFSET;})
    .html(function(d){return formatNumber(d["Electricity (Percent)"],1) + "%";})

    theVIS.selectAll("#electricityPercentRect").data(dataArray).enter().append("rect")
    .attr("id","electricityPercentRect")
    .attr("class","Electricity percentRectangleVisible")
        .attr("x",percentRectsX)
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 1)*VERTICAL_OFFSET;})
        .attr("height", 2*RECT_HEIGHT)
    .attr("width",0)
    .attr("name",function(d, i){return d[labelAttributeName];})
    .attr("value",function(d, i){return d["Electricity (Percent)"];})
    .attr("product", "Electricity")
    .on('mousedown', function(d, i)
    {
      var product = "Electricity";
      d3.event.stopPropagation(); 
      productInterface.select(product);
      selectProduct(product);
    })
    .transition()
    .duration(animationDuration)
    .delay(animationDelay)
    .attr("width",function(d){return RECT_WIDTH * (d["Electricity (Percent)"]/max["Energy (Percent)"]);})

    theVIS.selectAll("#gasPercentText").data(dataArray).enter().append("text")
    .attr("id", "gasPercentText")
    .attr("class", "Gas productDimmed")
    .attr("x", function(d){return percentRectsX + RECT_WIDTH * (0.5 * d["Gas (Percent)"]/max["Energy (Percent)"] + d["Electricity (Percent)"]/max["Energy (Percent)"]);})
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 0.9)*VERTICAL_OFFSET;})
    .html(function(d){return formatNumber(d["Gas (Percent)"],1) + "%";})

        theVIS.selectAll("#gasPercentRect").data(dataArray).enter().append("rect")
    .attr("id","gasPercentRect")
    .attr("class","Gas percentRectangleVisible")
        .attr("x",function(d){return percentRectsX + RECT_WIDTH * (d["Electricity (Percent)"]/max["Energy (Percent)"]);})
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 1)*VERTICAL_OFFSET;})
    .attr("height", 2*RECT_HEIGHT)
    .attr("width",0)
    .attr("name",function(d, i){return d[labelAttributeName];})
    .attr("value",function(d, i){return d["Gas (Percent)"];})
    .attr("product", "Gas")
    .on('mousedown', function(d, i)
    {
      var product = "Gas";
      d3.event.stopPropagation();
      productInterface.select(product);

      selectProduct(product);
    })
    .transition()
    .duration(animationDuration)
    .delay(animationDelay)
    .attr("width",function(d){return RECT_WIDTH * (d["Gas (Percent)"]/max["Energy (Percent)"]);})

    theVIS.selectAll("#othersPercentText").data(dataArray).enter().append("text")
    .attr("id", "othersPercentText")
    .attr("class", "Others productDimmed")
    .attr("x", function(d){return percentRectsX + RECT_WIDTH * (0.5 * d["Others (Percent)"]/max["Energy (Percent)"] + d["Gas (Percent)"]/max["Energy (Percent)"] + d["Electricity (Percent)"]/max["Energy (Percent)"]);})
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 0.9)*VERTICAL_OFFSET;})
    .html(function(d){return formatNumber(d["Others (Percent)"],1) + "%";})

        theVIS.selectAll("#othersPercentRect").data(dataArray).enter().append("rect")
    .attr("id","othersPercentRect")
    .attr("class","Others percentRectangleVisible")
        .attr("x",function(d){return percentRectsX + RECT_WIDTH * (d["Electricity (Percent)"]/max["Energy (Percent)"] + d["Gas (Percent)"]/max["Energy (Percent)"]);})
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 1)*VERTICAL_OFFSET;})
    .attr("height", 2*RECT_HEIGHT)
    .attr("width",0)
    .attr("name",function(d, i){return d[labelAttributeName];})
    .attr("value",function(d, i){return d["Others (Percent)"];})
    .attr("product", "Others")
    .on('mousedown', function(d, i)
    {
      var product = "Others";
      d3.event.stopPropagation();
      productInterface.select(product);

      selectProduct(product);
    })
    .transition()
    .duration(animationDuration)
    .delay(animationDelay)
    .attr("width",function(d){return RECT_WIDTH * (d["Others (Percent)"]/max["Energy (Percent)"]);})

    theVIS.selectAll("#transportPercentText").data(dataArray).enter().append("text")
    .attr("id", "transportPercentText")
    .attr("class", "Transport productDimmed")
    .attr("x", function(d){return percentRectsX + RECT_WIDTH * (0.5 * d["Transport fuels (Percent)"]/max["Energy (Percent)"] + d["Others (Percent)"]/max["Energy (Percent)"] + d["Gas (Percent)"]/max["Energy (Percent)"] + d["Electricity (Percent)"]/max["Energy (Percent)"]);})
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 0.9)*VERTICAL_OFFSET;})
    .html(function(d){return formatNumber(d["Transport fuels (Percent)"],1) + "%";})

        theVIS.selectAll("#transportPercentRect").data(dataArray).enter().append("rect")
    .attr("id","transportPercentRect")
    .attr("class","Transport percentRectangleVisible")
        .attr("x",function(d){return percentRectsX + RECT_WIDTH * (d["Electricity (Percent)"]/max["Energy (Percent)"] + d["Gas (Percent)"]/max["Energy (Percent)"] + d["Others (Percent)"]/max["Energy (Percent)"]);})
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 1)*VERTICAL_OFFSET;})
    .attr("height", 2*RECT_HEIGHT)
    .attr("width",0)
    .attr("name",function(d, i){return d[labelAttributeName];})
    .attr("value",function(d, i){return d["Transport fuels (Percent)"];})
    .attr("product", "Transport fuels")
    .on('mousedown', function(d, i)
    {
      var product = "Transport fuels";
      d3.event.stopPropagation();
      productInterface.select(product);

      selectProduct(product);
    })
    .transition()
    .duration(animationDuration)
    .delay(animationDelay)
    .attr("width",function(d){return RECT_WIDTH * (d["Transport fuels (Percent)"]/max["Energy (Percent)"]);})
  }

  ///@function makeEnergyDivisionsRects
  ///Creates the rectangular charts corresponding to the product values for each quintile.
  ///@param {dataArray} The array containing the data and metadatas for each chart
  ///@param {labelAttributeName} The name of the attribute that identifies the data's quintile
  ///@param {valueAttributeName} The name of the attribute that identifies the sum of all products values
  ///@param {animationDelay} The time (in milliseconds) to be used as delay to start animations
  ///@param {animationDuration} The time (in milliseconds) to be used as the animation length
  function makeEnergyDivisionsRects(dataArray, labelAttributeName, valueAttributeName, animationDelay, animationDuration)
  {
    if(tooltip === undefined)
    {
        tooltip = d3.tip()
          .attr('class', 'd3-tip');

         tooltip.direction('n');
         theVIS.call(tooltip);
    }

    theVIS.selectAll("#electricityText").data(dataArray).enter().append("text")
    .attr("id", "electricityText")
    .attr("class", "Electricity productDimmed")
    .attr("x", function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName])/2;})
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 1.4)*VERTICAL_OFFSET;})
    .html(function(d){return "$" + formatNumber(d["Electricity"]);})

        theVIS.selectAll("#electricityRect").data(dataArray).enter().append("rect")
    .attr("id","electricityRect")
    .attr("class","Electricity energyRectVisible")
        .attr("x", energyRectsHorizontalBoundary)
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 1.5)*VERTICAL_OFFSET;})
        .attr("height", RECT_HEIGHT)
    .attr("width",0)
    .attr("product", "Electricity")
        .attr("name",function(d, i){return d[labelAttributeName];})
    .attr("value",function(d, i){return d["Electricity"];})
    .on('mousedown', function(d, i)
    {
      var product = "Electricity";
      d3.event.stopPropagation();
      productInterface.select(product);

      selectProduct(product);
    })
    .transition()
    .duration(animationDuration)
    .delay(animationDelay)
    .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName]);})
    .attr("width",function(d){return RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName]);})

    theVIS.selectAll("#gasText").data(dataArray).enter().append("text")
    .attr("id", "gasText")
    .attr("class", "Gas productDimmed")
    .attr("x", function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (0.5 * d["Gas"]/MAX[valueAttributeName] + d["Electricity"]/MAX[valueAttributeName]);})
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 1.4)*VERTICAL_OFFSET;})
    .html(function(d){return "$" + formatNumber(d["Gas"]);})

        theVIS.selectAll("#gasRect").data(dataArray).enter().append("rect")
    .attr("id","gasRect")
    .attr("class","Gas energyRectVisible")
        .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName]);})
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 1.5)*VERTICAL_OFFSET;})
    .attr("height", RECT_HEIGHT)
    .attr("width",0)
        .attr("name",function(d, i){return d[labelAttributeName];})
    .attr("value",function(d, i){return d["Gas"];})
    .attr("product", "Gas")
    .on('mousedown', function(d, i)
    {
      var product = "Gas";
      d3.event.stopPropagation();
      productInterface.select(product);

      selectProduct(product);
    })
    .transition()
    .duration(animationDuration)
    .delay(animationDelay)
    .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName] + d["Gas"]/MAX[valueAttributeName]);})
    .attr("width",function(d){return RECT_WIDTH * (d["Gas"]/MAX[valueAttributeName]);})


    theVIS.selectAll("#othersText").data(dataArray).enter().append("text")
    .attr("id", "othersText")
    .attr("class", "Others productDimmed")
    .attr("x", function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (0.5 * d["Others"]/MAX[valueAttributeName] + d["Gas"]/MAX[valueAttributeName] + d["Electricity"]/MAX[valueAttributeName]);})
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 1.4)*VERTICAL_OFFSET;})
    .html(function(d){return "$" + formatNumber(d["Others"]);})

        theVIS.selectAll("#othersRect").data(dataArray).enter().append("rect")
    .attr("id","othersRect")
    .attr("class","Others energyRectVisible")
        .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName] + d["Gas"]/MAX[valueAttributeName]);})
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 1.5)*VERTICAL_OFFSET;})
    .attr("height", RECT_HEIGHT)
    .attr("width",0)
        .attr("name",function(d, i){return d[labelAttributeName];})
    .attr("value",function(d, i){return d["Others"];})
    .attr("product", "Others")
    .on('mousedown', function(d, i)
    {
      var product = "Others";
      d3.event.stopPropagation();
      productInterface.select(product);

      selectProduct(product);
    })
    .transition()
    .duration(animationDuration)
    .delay(animationDelay)
    .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName] + d["Gas"]/MAX[valueAttributeName] + d["Others"]/MAX[valueAttributeName]);})
    .attr("width",function(d){return RECT_WIDTH * (d["Others"]/MAX[valueAttributeName]);})

    theVIS.selectAll("#transportText").data(dataArray).enter().append("text")
    .attr("id", "transportText")
    .attr("class", "Transport productDimmed")
    .attr("x", function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (0.5 *  d["Transport fuels"]/MAX[valueAttributeName] + d["Others"]/MAX[valueAttributeName] + d["Gas"]/MAX[valueAttributeName] + d["Electricity"]/MAX[valueAttributeName]);})
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 1.4)*VERTICAL_OFFSET;})
    .html(function(d){return "$" + formatNumber(d["Transport fuels"]);})

        theVIS.selectAll("#transportRect").data(dataArray).enter().append("rect")
    .attr("id","transportRect")
    .attr("class","Transport energyRectVisible")
        .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName] + d["Gas"]/MAX[valueAttributeName] + d["Others"]/MAX[valueAttributeName]);})
    .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 1.5)*VERTICAL_OFFSET;})
    .attr("height", RECT_HEIGHT)
    .attr("width",0)
        .attr("name",function(d, i){return d[labelAttributeName];})
    .attr("value",function(d, i){return d["Transport fuels"];})
    .attr("product", "Transport fuels")
    .on('mousedown', function(d, i)
    {
      var product = "Transport fuels";
      d3.event.stopPropagation();

      productInterface.select(product);

      selectProduct(product);
    })
    .transition()
    .duration(animationDuration)
    .delay(animationDelay)
    .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName] + d["Gas"]/MAX[valueAttributeName] + d["Others"]/MAX[valueAttributeName] + d["Transport fuels"]/MAX[valueAttributeName]);})
    .attr("width",function(d){return RECT_WIDTH * (d["Transport fuels"]/MAX[valueAttributeName]);})
  }

   function makeDropShadowURL()
   {
     theVIS
     .append("defs")
     .append("filter").attr("id","dropShadow").attr("x","0").attr("y","0").attr("width","200%").attr("height","200%");

     var filter = theVIS.select("filter");
     filter.append("feOffset").attr("result","offOut").attr("in","SourceAlpha").attr("dx","1").attr("dy","1");
     filter.append("feGaussianBlur").attr("result","blurOut").attr("in","offOut").attr("stdDeviation","5");
     filter.append("feBlend").attr("in","SourceGraphic").attr("in2","blurOut").attr("mode","normal");
   }

  ///@function updateAbstract
  ///makes sure that the correct contents of the menu selections appear
  /// at the bottom of the svg
  function updateAbstract() {
      energy.updateAbstract(
        TL(countryInterface.selectedData()[0]),
        TL(productInterface.selectedData()[0]),
        ""+periodInterface.selectedData()[0]);
  }

  ///@function init
  ///Creates the svg elements and calls the CSV reading function
  function init()
  {

    periodInterface.onChange=readCSVFile;
    readCSVFile();
  }

  ///@function readCSVFile
  ///Reads a CSV file (with a default name), makes the data for the charts and create the rectangular charts
  function readCSVFile()
  {
    theVIS.selectAll("*").remove();

    theVIS.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", h)
      .attr("width", w)
      .style("fill", "white");

    makeDropShadowURL();

    var year = periodInterface.selectedData()[0];
    d3.csv(DATA+"/"+year+".csv", function(data) {
        for(var i = 0; i < data.length; i++)
        {
          var d = data[i];

          if(d["Country"] != "Total") uniqueCountries.push(d["Country"]);
        }

    uniqueCountries = d3.set(uniqueCountries).values();
    countryInterface.active(uniqueCountries);
    countryInterface.onChange = countriesChange;

    country = uniqueCountries[0];
      csvDataArray = data;
      var chartData = makeChartData(csvDataArray);
      displayData(chartData);

      productInterface.onChange = productChange;

     d3.select("select.countries").selectAll("option").data(uniqueCountries).enter().append("option")
    .attr("value", function(d){return d;})
    .text(function(d){return TL(d);});
    });

    theVIS.on("mousedown", function () {
      productInterface.select("All Sources");
      selectProduct("All Sources");
    });

    updateAbstract();
  }

  ///@function makeChartData
  ///Transforms the raw data read from a CSV file into an array of objects containing the data of each rectangle of the chartData
  ///@param {data} The data read from the CSV file
  function makeChartData(data)
  {
    var poorest = {"Name": "Poorest", "Rank":0, "Energy": 0,  "Electricity": 0, "Gas": 0, "Others": 0, "Transport fuels": 0};
    var second = {"Name": "Second", "Rank":1, "Energy": 0,  "Electricity": 0, "Gas": 0, "Others": 0, "Transport fuels": 0};
    var third = {"Name": "Third", "Rank":2, "Energy": 0,  "Electricity": 0, "Gas": 0, "Others": 0, "Transport fuels": 0};
    var fourth = {"Name": "Fourth", "Rank":3, "Energy": 0,  "Electricity": 0, "Gas": 0, "Others": 0, "Transport fuels": 0};
    var richest = {"Name": "Richest", "Rank":4, "Energy": 0,  "Electricity": 0, "Gas": 0, "Others": 0, "Transport fuels": 0};

    var energyPercentsValues;
    var percentsValuesArray = [], valuesArray = [];

    for(var i = 0; i < data.length; i++)
    {
      var d = data[i];

      if(d["Country"] == country)
      {
          d["Poorest"] = Number(d["Poorest"]);
          d["Second"] = Number(d["Second"]);
          d["Third"] = Number(d["Third"]);
          d["Fourth"] = Number(d["Fourth"]);
          d["Richest"] = Number(d["Richest"]);

          if(d["Type"] == "US$" ) valuesArray.push(d);
          if(d["Type"] == "%" && d["Product"] == "Energy") energyPercentsValues = d;
          else if(d["Type"] == "%")
          {
              percentsValuesArray.push(d);
          }
      }
    }

    for(var i = 0; i < valuesArray.length; i++)
    {
      var product = valuesArray[i]["Product"];

      poorest[product] = valuesArray[i]["Poorest"];
      second[product] = valuesArray[i]["Second"];
      third[product] = valuesArray[i]["Third"];
      fourth[product] = valuesArray[i]["Fourth"];
      richest[product] = valuesArray[i]["Richest"];
    }

    for(var i = 0; i < percentsValuesArray.length; i++)
    {
      var product = percentsValuesArray[i]["Product"];

      poorest[product + " (Percent)"] = percentsValuesArray[i]["Poorest"];
      second[product + " (Percent)"] = percentsValuesArray[i]["Second"];
      third[product + " (Percent)"] = percentsValuesArray[i]["Third"];
      fourth[product + " (Percent)"] = percentsValuesArray[i]["Fourth"];
      richest[product + " (Percent)"] = percentsValuesArray[i]["Richest"];
    }

    poorest["Energy (Percent)"] = energyPercentsValues["Poorest"];
    second["Energy (Percent)"] = energyPercentsValues["Second"];
    third["Energy (Percent)"] = energyPercentsValues["Third"];
    fourth["Energy (Percent)"] = energyPercentsValues["Fourth"];
    richest["Energy (Percent)"] = energyPercentsValues["Richest"];

    poorest["Income"] = (poorest["Energy"] * 100)/poorest["Energy (Percent)"];
    second["Income"] = (second["Energy"] * 100)/second["Energy (Percent)"];
    third["Income"] = (third["Energy"] * 100)/third["Energy (Percent)"];
    fourth["Income"] = (fourth["Energy"] * 100)/fourth["Energy (Percent)"];
    richest["Income"] = (richest["Energy"] * 100)/richest["Energy (Percent)"];

   var chartData = [poorest, second, third, fourth, richest];

   data.sort(function(a,b){return a.Rank - b.Rank;});

   return chartData;
  }

  ///@function displayData
  ///Receives an array of objects containing the data for each rectangle of the chart and makes the data visualization
  ///@param {data} The array of objects containing the data
  function displayData(data)
  {
    var ANIMATION_DELAY = 2000, ANIMATION_DURATION = 1000;
    var labelAttributeName = "Name";

    //(2 * data.length) * VERTICAL_OFFSET + data.length * RECT_HEIGHT = h
    RECT_HEIGHT = h/(3 * data.length);
    RECT_WIDTH = 0.3*w;
    HORIZONTAL_OFFSET = 0.15*w;
    VERTICAL_OFFSET = h/(3 * data.length);

    data = data.sort(function(a,b){return b.Income - a.Income;});
    MAX = data[0];

    for(var i = 0; i < data.length; i++)
    {
      data[i]["Energy (Percent)"] = Math.round(1000*data[i]["Energy"]/data[i]["Income"])/10;
    }

    makeQuintilesRankRect(data);

    data = data.sort(function(a,b){return b.Energy - a.Energy;});
    valueAttributeName = "Energy";
    MAX = data[0];

    makeEnergyRank(data);
    makePercentRects(data, ANIMATION_DELAY, ANIMATION_DURATION);
    makeEnergyDivisionsRects(data, labelAttributeName, valueAttributeName, ANIMATION_DELAY, ANIMATION_DURATION);
    makePercentLines(data);
    makePercentTexts(data);
  }

  ///@function makeQuintilesRankRect
  ///Makes the blue rectangles on the right that relates each chart to its quintile name and its total Income
  ///@param {dataArray} The array containing the data to make the chart
  function makeQuintilesRankRect(dataArray)
  {
  var labelAttributeName = "Name";
  var valueAttributeName = "Income";
  var animationDelay = 1000, animationDuration = 2000;
  var offset = 0.01;
  var rectangleHeight = 18;
  var rankRectsX = (textFieldsProportion + rectFieldsProportion + offset)*w
  var rankRectsWidth = (textFieldsProportion - 2*offset)*w;
  var lastIndex = dataArray.length - 1;
  var richestExtremeRectangleY = VERTICAL_OFFSET - rectangleHeight - RECT_HEIGHT/2;
  var poorestExtremeRectangleY = (lastIndex + 2)*RECT_HEIGHT + (2*lastIndex + 1.5)*VERTICAL_OFFSET;

  theVIS.selectAll("#rankRect").data(dataArray).enter().append("rect")
     .attr("class","rankRect")
    .attr("x", rankRectsX-3)
    .attr("y", function(d, i){return i * RECT_HEIGHT + (2*i + 1)*VERTICAL_OFFSET - Math.abs(RECT_HEIGHT - rankRectsWidth)/16;})
    .attr("height", rankRectsWidth)
    .attr("width", rankRectsWidth+6)
    .style("opacity",0)
    .transition()
    .duration(animationDuration)
    .delay(animationDelay)
    .style("opacity",0.8);

  var legend = TL("Average expenditure by|quintile in US$");
  var labels = [TL("richest"), TL("poorest"), legend.split("|")[0], legend.split("|")[1]];
  var texts = [];
  var fontSize = 12;

  var textsX = w/2;
  var text1 = {"x":textsX, "y":VERTICAL_OFFSET - RECT_HEIGHT/2 - fontSize/2,"size":fontSize,"value":labels[0], "angle":0}; texts.push(text1);
  var text2 = {"x":textsX, "y":poorestExtremeRectangleY + fontSize,"size":fontSize,"value":labels[1], "angle":0}; texts.push(text2);
  var text3 = {"x":textsX, "y":text1.y-35,"size":fontSize,"value":labels[2], "angle":0}; texts.push(text3);
  var text4 = {"x":textsX, "y":text3.y+15,"size":fontSize,"value":labels[3], "angle":0}; texts.push(text4);

  theVIS.selectAll("#rankText").data(dataArray).enter().append("text")
  .attr("id","rankText")
  .attr("x",function(d, i)
        {
          return w/2;
        })
  .attr("y",function(d, i){return (i + 0.5) * RECT_HEIGHT + (2*i + 1.5)*VERTICAL_OFFSET;})
  .style("fill",'black')
  .attr("name",function(d, i){return d[labelAttributeName];})
  .attr("value",function(d, i){return d[valueAttributeName];})
  .html(function(d){return "$" + formatNumber(d[valueAttributeName]);})
  .style("opacity",0)
  .transition()
  .duration(animationDuration)
  .delay(animationDelay)
  .style("opacity",0.8);

  var extremesRectangles = [];
  var displaceFromText = 12;
  var rectRichest = {"x":rankRectsX, "y":richestExtremeRectangleY, "height":rectangleHeight, "width":rankRectsWidth};
  var rectPoorest = {"x":rankRectsX, "y":poorestExtremeRectangleY, "width":rankRectsWidth, "height":rectangleHeight};

  extremesRectangles.push(rectPoorest);
  extremesRectangles.push(rectRichest);

  theVIS.selectAll("#extremeRectangle").data(extremesRectangles).enter().append("rect")
  .attr("id","extremeRectangle")
  .attr("class","extremeRectangle")
  .attr("x",function(d){return d["x"];})
  .attr("y",function(d){return d["y"];})
  .attr("width",function(d){return d["width"];})
  .attr("height",function(d){return d["height"];})
  .style("opacity",0)
  .transition()
  .duration(animationDuration)
  .delay(animationDelay)
  .style("opacity",0.8);

  theVIS.selectAll("#guideText").data(texts).enter().append("text")
  .attr("id","guideText")
  .attr("x", function(d){return d["x"];})
  .attr("y", function(d){return d["y"];})
  .attr("name",function(d){return d["value"];})
  .attr("value",function(d){return d["value"];})
  .attr("transform",function(d){return "rotate(" + d["angle"] + " " + d["x"] + " " + d["y"] + ")";})
  .html(function(d){return d["value"];})
  .style("opacity",0)
  .transition()
  .duration(animationDuration)
  .delay(animationDelay)
  .style("opacity",0.8);
  }

  ///@function makeEnergyRank
  ///Makes the numbers strings and the guidelines relating each chart to its quintile's energy expenditure
  ///@param {dataArray} The array containing the data
  function makeEnergyRank(dataArray)
  {
 var labelAttributeName = "Name";
 var valueAttributeName = "Energy";
 var animationDelay = 1000, animationDuration = 2000;
 var lastIndex = dataArray.length - 1;

  theVIS.selectAll("#energyText").data(dataArray).enter().append("text")
  .attr("id","energyText")
  .attr("class","energyText")
  .attr("x", function(d, i){return energyRectsHorizontalBoundary -
                            RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName] +
                                          d["Gas"]/MAX[valueAttributeName] +
                                          d["Others"]/MAX[valueAttributeName] +
                                          d["Transport fuels"]/MAX[valueAttributeName]) - guideLinesOffset;})
  .attr("y",function(d, i){return i * RECT_HEIGHT + (2*i + 1.4)*VERTICAL_OFFSET + RECT_HEIGHT/2;})
  .attr("name",function(d, i){return d[labelAttributeName];})
  .attr("value",function(d, i){return d["Energy"];})
  .html(function(d){return "$" + formatNumber(d["Energy"]);})
  .style("opacity",0)
  .transition()
  .duration(animationDuration)
  .delay(animationDelay)
  .style("opacity",0.8);

  var lineX1 = 25, verticalAdjustment = 5;
  var y1 = 1.5*VERTICAL_OFFSET + RECT_HEIGHT/2;
  var y2 = lastIndex * RECT_HEIGHT + (2*lastIndex + 1.5)*VERTICAL_OFFSET + RECT_HEIGHT/2;
  var middleY = (y1+y2)/2;
  var lines = [];

  theVIS.append("line")
  .attr("x1", lineX1)
  .attr("x2", lineX1)
  .attr("y1", y1)
  .attr("y2", y2)
  .style("opacity",0)
  .style("stroke",'black')
  .style("stroke-width",'1')
  .transition()
  .duration(animationDuration)
  .delay(animationDelay)
  .style("opacity",0.8);

  for(var i = 0; i <= lastIndex; i++)
  {
    var d = dataArray[i];
    var x2 = energyRectsHorizontalBoundary - RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName] + d["Gas"]/MAX[valueAttributeName] + d["Others"]/MAX[valueAttributeName] + d["Transport fuels"]/MAX[valueAttributeName])
    var lineY1 = i * RECT_HEIGHT + (2*i + 1.5)*VERTICAL_OFFSET + RECT_HEIGHT/2;
    var line = {"x1":lineX1,"y1":lineY1, "x2":x2 - guideLinesOffset, "y2":lineY1};
    lines.push(line);
  }

  theVIS.selectAll("#energyLine").data(lines).enter().append("line")
  .attr("id","energyLine")
  .attr("x1", function(d){return d["x1"];})
  .attr("x2", function(d){return d["x2"];})
  .attr("y1", function(d){return d["y1"];})
  .attr("y2", function(d){return d["y2"];})
  .style("opacity",0)
  .style("stroke",'black')
  .style("stroke-width",'1')
  .transition()
  .duration(animationDuration)
  .delay(animationDelay)
  .style("opacity",0.8);

  var energyRankText = "Energy expenditure in dollars";

  theVIS.append("text")
  .attr("class", "rankText")
  .attr("x", lineX1 - 5)
  .attr("y", middleY)
  .attr("transform","rotate(270 " + (lineX1 - 5) + " " + middleY + ")")
  .html(TL(energyRankText))
  .style("opacity",0)
  .transition()
  .duration(animationDuration)
  .delay(animationDelay)
  .style("opacity",0.8);
  }

  ///@function makePercentLines
  ///Makes the horizontal lines boundaring the percent rects
  ///@param {data} The array containg the data used to determine the lines coordinates
  function makePercentLines(data)
  {
 var labelAttributeName = "Name";
 var valueAttributeName = "Energy";
 var animationDelay = 1000, animationDuration = 2000;
 var lastIndex = data.length - 1;
 var max = data[lastIndex];

  var linesHorizontalAdjustment = 5;

  var lineX1 = w, verticalAdjustment = 5;
  var y1 = RECT_HEIGHT/2 + 1.5*VERTICAL_OFFSET;
  var y2 = (lastIndex + 0.5) * RECT_HEIGHT + (2*lastIndex + 1.5)*VERTICAL_OFFSET;
  var middleY = (y1+y2)/2;
  var lines = [];

  theVIS.append("line")
  .attr("class","percentLine")
  .attr("x1", lineX1)
  .attr("x2", lineX1)
  .attr("y1", y1)
  .attr("y2", y2)
  .style("opacity",0)
  .transition()
  .duration(animationDuration)
  .delay(animationDelay)
  .style("opacity",0.8);

  for(var i = 0; i <= lastIndex; i++)
  {
    var d = data[i]
    var x = percentRectsX +
    RECT_WIDTH * (d["Electricity (Percent)"]/max["Energy (Percent)"] +
                  d["Gas (Percent)"]/max["Energy (Percent)"] +
                  d["Others (Percent)"]/max["Energy (Percent)"] +
                  d["Transport fuels (Percent)"]/max["Energy (Percent)"]) + guideLinesOffset;


    var y0 = (i + 0.5) * RECT_HEIGHT + (2*i + 1.5)*VERTICAL_OFFSET;

    var guideLine0 = {"x1":x,"y1":y0, "x2":lineX1, "y2":y0};

    lines.push(guideLine0);
  }

  theVIS.selectAll("#percentLine").data(lines).enter().append("line")
  .attr("id","percentLine")
  .attr("class","percentLine")
  .attr("x1", function(d){return d["x1"];})
  .attr("x2", function(d){return d["x2"];})
  .attr("y1", function(d){return d["y1"];})
  .attr("y2", function(d){return d["y2"];})
  .style("opacity",0)
  .transition()
  .duration(animationDuration)
  .delay(animationDelay)
  .style("opacity",0.8);

  var percentText = "Energy expenditure as share of total expenditure";

  theVIS.append("text")
   .attr("class","rankText")
  .attr("x", lineX1 + 15)
  .attr("y", middleY)
  .attr("transform","rotate(270 " + (lineX1 + 15) + " " + middleY + ")")
  .html(TL(percentText))
  .style("opacity",0)
  .transition()
  .duration(animationDuration)
  .delay(animationDelay)
  .style("opacity",0.8);
  }

  ///@function makePercentTexts
  ///Makes the total percent value text on top of each percent chart
  ///@param {dataArray} The array containg the data
  function makePercentTexts(dataArray)
  {
    var animationDelay = 1000, animationDuration = 2000;
    var percentPrecision = 1;
    var max = dataArray[dataArray.length - 1];
    var verticalAdjustment = 5;

        theVIS.selectAll("#percentText").data(dataArray).enter().append("text")
    .attr("id","percentText")
    .attr("class","percentText")
    .attr("x", function(d, i){return percentRectsX +
    RECT_WIDTH * (d["Electricity (Percent)"]/max["Energy (Percent)"] +
                  d["Gas (Percent)"]/max["Energy (Percent)"] +
                  d["Others (Percent)"]/max["Energy (Percent)"] +
                  d["Transport fuels (Percent)"]/max["Energy (Percent)"]) + guideLinesOffset;})
    .attr("y",function(d, i){return i * RECT_HEIGHT + 2*(i + 0.9)*VERTICAL_OFFSET;})
        .style("opacity",0)
    .html(function(d){return formatNumber(d["Energy (Percent)"], percentPrecision) + "%";})
    .transition()
    .duration(animationDuration)
    .delay(animationDelay)
    .style("opacity",1)
  }

  ///@function updateEnergyRects
  ///Updates each of the energy subdivisions rects when a new country is selected
  ///@param {data} The array containing the new data
  function updateEnergyRects(data)
  {
      var animationDelay = 0;
      var animationDuration = 1000;

      var labelAttributeName = "Name";
      var valueAttributeName = "Energy";

      MAX = data[0];

      theVIS.selectAll("#electricityText").data(data)
      .style("opacity", 0)
      .html(function(d){return "$" + formatNumber(d["Electricity"]);})
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
      .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (0.5 * d["Electricity"]/MAX[valueAttributeName]);})
      .style("opacity", 1);

      theVIS.selectAll("#electricityRect").data(data)
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
    .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName]);})
      .attr("width",function(d){return RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName]);})
      .attr("name",function(d, i){return d[labelAttributeName];})
      .attr("value",function(d, i){return d["Electricity"];});

      theVIS.selectAll("#gasText").data(data)
      .style("opacity", 0)
      .html(function(d){return "$" + formatNumber(d["Gas"]);})
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
      .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (0.5 * d["Gas"]/MAX[valueAttributeName] + d["Electricity"]/MAX[valueAttributeName]);})
      .style("opacity", 1);

    theVIS.selectAll("#gasRect").data(data)
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
    .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName] + d["Gas"]/MAX[valueAttributeName]);})
      .attr("width",function(d){return RECT_WIDTH * (d["Gas"]/MAX[valueAttributeName]);})
      .attr("name",function(d, i){return d[labelAttributeName];})
      .attr("value",function(d, i){return d["Gas"];});

      theVIS.selectAll("#othersText").data(data)
      .style("opacity", 0)
      .html(function(d){return "$" + formatNumber(d["Others"]);})
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
      .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (0.5 * d["Others"]/MAX[valueAttributeName] + d["Gas"]/MAX[valueAttributeName] + d["Electricity"]/MAX[valueAttributeName]);})
      .style("opacity", 1);

    theVIS.selectAll("#othersRect").data(data)
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
    .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName] + d["Gas"]/MAX[valueAttributeName] + d["Others"]/MAX[valueAttributeName]);})
      .attr("width",function(d){return RECT_WIDTH * (d["Others"]/MAX[valueAttributeName]);})
      .attr("name",function(d, i){return d[labelAttributeName];})
      .attr("value",function(d, i){return d["Others"];});

      theVIS.selectAll("#transportText").data(data)
      .style("opacity", 0)
      .html(function(d){return "$" + formatNumber(d["Transport fuels"]);})
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
      .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (0.5 * d["Transport fuels"]/MAX[valueAttributeName] + d["Others"]/MAX[valueAttributeName] + d["Gas"]/MAX[valueAttributeName] + d["Electricity"]/MAX[valueAttributeName]);})
      .style("opacity", 1);

    theVIS.selectAll("#transportRect").data(data)
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
    .attr("x",function(d){return energyRectsHorizontalBoundary - RECT_WIDTH * (d["Electricity"]/MAX[valueAttributeName] + d["Gas"]/MAX[valueAttributeName] + d["Others"]/MAX[valueAttributeName] + d["Transport fuels"]/MAX[valueAttributeName]);})
      .attr("width",function(d){return RECT_WIDTH * (d["Transport fuels"]/MAX[valueAttributeName]);})
      .attr("name",function(d, i){return d[labelAttributeName];})
      .attr("value",function(d, i){return d["Transport fuels"];})
  }

  ///@function updatePercentRects
  ///Updates each of the energy percent rects when a new country is selected
  ///@param {data} The array containing the new data
  function updatePercentRects(data)
  {
      var animationDelay = 0;
      var animationDuration = 1000;

      var labelAttributeName = "Name";
      var valueAttributeName = "Energy";

      var max = data[data.length - 1];

      theVIS.selectAll("#electricityPercentText").data(data)
      .style("opacity", 0)
      .attr("x", function (d){return percentRectsX + RECT_WIDTH * (0.5 * d["Electricity (Percent)"]/max["Energy (Percent)"]);})
      .html(function(d){return formatNumber(d["Electricity (Percent)"],1) + "%";})
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
      .style("opacity",1);

      theVIS.selectAll("#electricityPercentRect").data(data)
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
    .attr("x",percentRectsX)
      .attr("width",function(d){return RECT_WIDTH * (d["Electricity (Percent)"]/max["Energy (Percent)"]);})
      .attr("name",function(d, i){return d[labelAttributeName];})
      .attr("value",function(d, i){return d["Electricity (Percent)"];})

      theVIS.selectAll("#gasPercentText").data(data)
      .style("opacity", 0)
      .attr("x", function (d){return percentRectsX + RECT_WIDTH * (0.5 * d["Gas (Percent)"]/max["Energy (Percent)"] + d["Electricity (Percent)"]/max["Energy (Percent)"]);})
      .html(function(d){return formatNumber(d["Gas (Percent)"],1) + "%";})
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
      .style("opacity",1);

    theVIS.selectAll("#gasPercentRect").data(data)
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
    .attr("x",function(d){return percentRectsX + RECT_WIDTH * (d["Electricity (Percent)"]/max["Energy (Percent)"]);})
      .attr("width",function(d){return RECT_WIDTH * (d["Gas (Percent)"]/max["Energy (Percent)"]);})
      .attr("name",function(d, i){return d[labelAttributeName];})
      .attr("value",function(d, i){return d["Gas (Percent)"];})

    theVIS.selectAll("#othersPercentText").data(data)
    .style("opacity", 0)
    .attr("x", function (d){return percentRectsX + RECT_WIDTH * (0.5 * d["Others (Percent)"]/max["Energy (Percent)"] +  d["Gas (Percent)"]/max["Energy (Percent)"] + d["Electricity (Percent)"]/max["Energy (Percent)"]);})
    .html(function(d){return formatNumber(d["Others (Percent)"],1) + "%";})
    .transition()
    .duration(animationDuration)
    .delay(animationDelay)
    .style("opacity",1);

    theVIS.selectAll("#othersPercentRect").data(data)
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
    .attr("x",function(d){return percentRectsX + RECT_WIDTH * (d["Electricity (Percent)"]/max["Energy (Percent)"] + d["Gas (Percent)"]/max["Energy (Percent)"]);})
      .attr("width",function(d){return RECT_WIDTH * (d["Others (Percent)"]/max["Energy (Percent)"]);})
      .attr("name",function(d, i){return d[labelAttributeName];})
      .attr("value",function(d, i){return d["Others (Percent)"];})

    theVIS.selectAll("#transportPercentText").data(data)
    .style("opacity", 0)
    .attr("x", function (d){return percentRectsX + RECT_WIDTH * (0.5 * d["Transport fuels (Percent)"]/max["Energy (Percent)"] + d["Electricity (Percent)"]/max["Energy (Percent)"] + d["Gas (Percent)"]/max["Energy (Percent)"] + d["Others (Percent)"]/max["Energy (Percent)"]);})
    .html(function(d){return formatNumber(d["Transport fuels (Percent)"],1) + "%";})
    .transition()
    .duration(animationDuration)
    .delay(animationDelay)
    .style("opacity",1);

    theVIS.selectAll("#transportPercentRect").data(data)
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
    .attr("x",function(d){return percentRectsX + RECT_WIDTH * (d["Electricity (Percent)"]/max["Energy (Percent)"]) + RECT_WIDTH * (d["Gas (Percent)"]/max["Energy (Percent)"]) + RECT_WIDTH * (d["Others (Percent)"]/max["Energy (Percent)"]);})
      .attr("width",function(d){return RECT_WIDTH * (d["Transport fuels (Percent)"]/max["Energy (Percent)"]);})
      .attr("name",function(d, i){return d[labelAttributeName];})
      .attr("value",function(d, i){return d["Transport fuels (Percent)"];})
  }

  ///@function updatePercentLines
  ///Updates each of the energy percent guide lines when a new country is selected
  ///@param {dataArray} The array containing the new data
  function updatePercentLines(dataArray)
  {
    var animationDelay = 0;
    var animationDuration = 1000;
    var max = dataArray[dataArray.length - 1];
    var newsX1 = [];

    for(var i = 0; i < dataArray.length; i++)
    {
      var d = dataArray[i];
      var x = percentRectsX +
      RECT_WIDTH * (d["Electricity (Percent)"]/max["Energy (Percent)"] +
              d["Gas (Percent)"]/max["Energy (Percent)"] +
              d["Others (Percent)"]/max["Energy (Percent)"] +
              d["Transport fuels (Percent)"]/max["Energy (Percent)"]) + guideLinesOffset;

      newsX1.push(x);
    }

    theVIS.selectAll("#percentLine").data(newsX1)
    .transition()
    .duration(animationDuration)
    .delay(animationDelay)
    .attr("x1",function(d, i){return d;});

  }

  ///@function updatePercentTexts
  ///Updates each of the energy percent texts when a new country is selected
  ///@param {dataArray} The array containing the new data
  function updatePercentTexts(dataArray)
  {
      var labelAttributeName = "Name";
      var animationDelay = 0, animationDuration = 1000;
      var percentPrecision = 1;
      var max = dataArray[dataArray.length - 1];

    theVIS.selectAll("#percentText").data(dataArray)
      .style("opacity",0)
      .html(function(d,i){return formatNumber(d["Energy (Percent)"], percentPrecision) + "%";})
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
      .style("opacity",1)
      .attr("x", function(d, i){return percentRectsX +
      RECT_WIDTH * (d["Electricity (Percent)"]/max["Energy (Percent)"] +
              d["Gas (Percent)"]/max["Energy (Percent)"] +
              d["Others (Percent)"]/max["Energy (Percent)"] +
              d["Transport fuels (Percent)"]/max["Energy (Percent)"]) + guideLinesOffset;})
  }

  ///@function updateEnergyRankLines
  ///Updates each of the energy expenditure text and the corresponding guide lines when a new country is selected
  ///@param {dataArray} The array containing the new data
  function updateEnergyRankLines(dataArray)
  {
      var animationDelay = 0;
      var animationDuration = 1000;

      var labelAttributeName = "Name";
      var valueAttributeName = "Energy";

      var newsX2 = [];

      for(var i = 0; i < dataArray.length; i++)
      {
        var electricity = dataArray[i]["Electricity"], gas = dataArray[i]["Gas"], others = dataArray[i]["Others"], transport = dataArray[i]["Transport fuels"];

        var x2 = energyRectsHorizontalBoundary - RECT_WIDTH * (electricity/MAX[valueAttributeName] +
        gas/MAX[valueAttributeName] +
        others/MAX[valueAttributeName] +
        transport/MAX[valueAttributeName]) - guideLinesOffset

        newsX2.push(x2);
      }

      theVIS.selectAll("#energyText").data(dataArray)
      .attr("name",function(d, i){return d[labelAttributeName];})
      .attr("value",function(d, i){return d[valueAttributeName];})
      .attr("x", function(d, i){return newsX2[i];})
      .html(function(d){return "$" + formatNumber(d[valueAttributeName]);})
      .style("opacity",0)
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
      .style("opacity",0.8);

      theVIS.selectAll("#energyLine").data(newsX2)
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
      .attr("x2", function(d, i){return d;})
  }

  ///@function updateRankTexts
  ///Updates each of the quintile income text when a new country is selected
  ///@param {dataArray} The array containing the new data
  function updateRankTexts(dataArray)
  {
      var animationDelay = 0;
      var animationDuration = 1000;

      var labelAttributeName = "Name";
      var valueAttributeName = "Income";

      theVIS.selectAll("#rankText").data(dataArray)
      .attr("name",function(d, i){return d[labelAttributeName];})
      .attr("value",function(d, i){return d[valueAttributeName];})
      .html(function(d){return "$" + formatNumber(d[valueAttributeName]);})
      .style("opacity",0)
      .transition()
      .duration(animationDuration)
      .delay(animationDelay)
      .style("opacity",0.8);
  }

  ///@function updateVisualizationData
  ///Updates the visualization
  ///@param {data} The array containing the new data
  function updateVisualizationData(data)
  {
      data.sort(function(a,b){return b.Income - a.Income;});
      updateEnergyRects(data);
      updateEnergyRankLines(data);
      updateRankTexts(data);

      data.sort(function(a,b){return b.Energy - a.Energy;});
      updatePercentLines(data);
      updatePercentRects(data);
      updatePercentTexts(data);
  }

  createMenus();
  init();
  sourceLegends();
}

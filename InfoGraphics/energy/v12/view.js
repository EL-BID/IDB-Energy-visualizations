function chart(selector, data)
{
    /* Several constants that affect the design */
    var width = 950;     /* width of the visualization / svg */
    var height = 450;    /* height of the visualization */
    var svgheight = 650; /* height of the svg */
    var margin = [40,80,40,80]; /* Space of chart w.r.t top/right/bottom/left borders of svg */
    var squareSep = 4;  /* Separation between the squares of the chart */
    lcg.defaults['balloonR'] = 0; /* Radius of the balloon (callout) rectangle corners */
    lcg.defaults['balloonMargin'] = 3; /* Margin around balloon (callout) text */
    lcg.defaults['balloonDx'] = 4; /* Width of balloon (callout) arrow */
    lcg.defaults['balloonDy'] = 6; /* Width of balloon (callout) arrow */
    

    /* Format functions for numbers */
    var numberFormat = function(n) {
        return n.energyFormat();
    };

    var sel = d3.select(selector);

    /* Create the svg element */
    var theSVG = sel
        .append("svg:svg")
        .attr("class","datavis")        
        .attr("width", width)
        .attr("height", svgheight);   

    /* create the group for the visualization */ 
    var theVIS = theSVG
        .append ("svg:g")
        .attr("id", "squarechart")
        .attr ("transform", "translate(0,"+((svgheight-height)/2)+")");
        
    /* Create the menu bar and obtain the interfaces */
    var interfaces = idb.menuBar (theSVG, theVIS, [idb.latCountry, idb.period, idb.product, idb.units]);
    var countryInterface = interfaces[0];
    var productInterface = interfaces[2];
    var periodInterface = interfaces[1];
    var unitsInterface = interfaces[3];

    /* Obtain available periods and countries */
    var availableCountries = getDistinct (data, "country");
    var availablePeriods = getDistinct (data, "period");
    
    /* Add the units legend */
    theVIS.append("text")
        .attr("class", "UnitLegend")
        .attr("x", 20)
        .attr("y", 10);

    /* The chart */
    var chart = undefined;

    /* The countries */
    var countries = [];

    /* The selected countries */
    var selectedCountries = {};

    /* The currently selected units */ 
    var units = defaultUnits;

    /* Normalizing data for period normalizingPeriod*/
    var normalizingData = [];

    /* The current period */
    var period = "";

    /* The period for which normalizingData is currently loaded */
    var normalizingPeriod = "";

    /* The current product */
    var product = "";

    /* callback function for selecting a square */
    function select(d,i) {
        var sel = selectedCountries[d.country];
        sel = !sel;
        selectedCountries [d.country] = sel;
        chart.selectByIndex(i, sel);
        d3.event.stopPropagation();
    }

    /* Unselect all countries */
    function unselectAllCountries () {
        selectedCountries = {};
        chart.unselectAll();
    }

    /* Reselects all countries of data which are in selectedCountries */
    function reselectCountries (data) {
        for (var i in data) {
            var d = data[i];
            chart.selectByIndex (i, selectedCountries [d.country]>0);
        }
    }

    /* Select the units for the input data: either kboe, gdp or population.
     * Reloads the normalizing data tables if needed and pushes the right values
     * onto the chart */
    function selectUnits (data, newUnits) {

        /* Once the normalized data is loaded, convert the data */
        function normalize() {

            /* Only convert if needed */
            if (newUnits == "gdp" || newUnits == "population") {
                var mult = newUnits == "population" 
                                ? 1000 * 365 /* Barrels per person per year */
                        : (newUnits == "gdp"
                                ? 1000 * 365 * 10000 /* Barrels per gdp unit per year */ 
                                : 1.0);

                var newData = [];
                for (var i = 0; i < data.length; i++) {
                    var c = data[i].country;
                    var norm = normalizingData[c][newUnits];
                    if (norm == undefined) {
                        console.log ("No normalizing data for "+c);
                        continue;
                    }
                    if (data[i].originalValue == undefined) data[i].originalValue = data[i].value;
                    data[i].value = data[i].originalValue * mult / norm;
                    data[i][newUnits] = norm;
                    newData.push (data[i]);
                }
                data = newData;
            } else {
                /* change back to kboe if needed */
                for (var i = 0; i < data.length; i++) 
                    if (data[i].originalValue != undefined) data[i].value = data[i].originalValue;
            }

            /* Pump data into chart */
            chart.data(data);
            reselectCountries(chart.data());
            units = newUnits;

            /* Update the units legend */
            theVIS.select (".UnitLegend").text (TL("All units in "+units));
        }

        /* Try to load normalizingData if needed */
        if (normalizingPeriod != period && newUnits != undefined && newUnits != "kboe") {
            d3.json (normalizingDataFolder + '/normalization ' + period + ".json", function (normData) {
                if (normData == undefined) {
                    console.log ("loading of period" + period + "failed")
                }
                else {
                    /* Build a dictionary from country to the normData */
                    normalizingData = {};
                    for (var i = 0; i < normData.length; i++) {
                        normalizingData[normData[i].country] = normData[i];
                    }
                    /* Remember the loaded data */
                    normalizingPeriod = period;

                    normalize ();
                }
            });
        } 
        else {
            normalize();
        } 
    }

    /* Loads the chart for a given period/product */
    loadPeriodProduct = function () {

        /* The current period and product */
        period = periodInterface.selectedData()[0];
        var prodname = productInterface.selectedData()[0];
        product = shortname[prodname];

        if (chart == undefined) {
            chart = lcg.square() 
                .parent (theVIS)
                .size([width,height])
                .value (function (d) { return d.value })
                .label (function (d) { return d.country })
                .set ('shortLabel', function(d,i,w) { 
                    if (w > 20) return threeLetter[d.country];
                    return "";
                })
                .squareSep (squareSep)
                .set ("dataKey", function (d) { return d.country;})
                .onClick (select)
                .category (function (d) { return d })
                .color (function (d) { return d.color || null })
                .tooltip (function(d) { return d.country+": "+numberFormat(d.value); });
        }
        

        /* Load the JSON and render the visualization */
        var filename = dataFolder + '/' + period + ' ' + product + ".json";
        d3.json (filename, function (data) {

            context.country = null;
            context.period = period;
            context.source = prodname;
            context.units = units;

            context.dataFolder = dataFolder;
            context.csvDataFolder = csvDataFolder;
            context.fileName = period + ' ' + product + ".zip";
            context.fileList = [ period + ' ' + product + ".json" ];
            context.csvFileList = [ period + ' ' + product + ".csv" ];
        
            energy.updateAbstract(period,TL(prodname),TL(units));

            var selCountries = countryInterface.selectedData();
            var selColors = countryInterface.selectedColors();
            data = getFiltered(data, function (d) {
                var i = selCountries.indexOf(d.country);
                if (i >= 0) d.color = selColors[i];
                return i>=0;
            });
            data = getFiltered(data,"flow","Production"); 
            /* Finish by transforming the units and reloading the chart data */
            selectUnits (data, units);  
        });

    }; /* End of LoadPeriodProduct */


    /* Configure the period interface */
    periodInterface.active (availablePeriods);
    periodInterface.select (defaultPeriod);
    periodInterface.onChange = loadPeriodProduct;

    /* configure the country interface */
    countryInterface.select (availableCountries);
    countryInterface.onChange = loadPeriodProduct;

    /* configure the product interface */ 
    productInterface.select (defaultProduct);
    productInterface.onChange = loadPeriodProduct;

    /* set up callbacks for the units menu */
    unitsInterface.select (defaultUnits);
    unitsInterface.onChange = function (d,i) {
        selectUnits (chart.data(), unitsInterface.selectedData()[0]);
    };

    /* Load the first country */
    loadPeriodProduct ();

} /* END OF CHART FUNCTION */

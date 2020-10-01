function chart(selector)
{

    /* MAIN PROGRAM */

    /* Several constants that affect the design */
    var width = 950;     /* width of the visualization / svg */
    var height = 500;    /* height of the visualization */
    var svgheight = 650; /* height of the svg */
    var margin = [50,100,90,80]; /* Space of chart w.r.t top/right/bottom/left borders of svg */
    var maxCountries = 6; 
    var periodLegendY = 40;
    var energyLegendX = 20;
    var xgridlines = true; /* Make vertical gridlines? */
    var ygridlines = true; /* Make horizontal gridlines? */

    var sel = d3.select(selector);

    /* Create the svg element */
    var theSVG = sel
        .append("svg:svg")
        .attr("width", width)
        .attr("height", svgheight);   

    /* Create a group for holding the whole visualization */
    var theVIS = theSVG.append ("g")
        .attr("id", "areachart")
        .attr("class","datavis")
        .attr ("transform", "translate(0,"+((svgheight-height)/2)+")");     

    /* Create the menu bar and obtain the interfaces */
    idb.country.multiSel = true;        
    idb.country.multiSelLimit = maxCountries;   
    idb.country.manageColors = true;
    idb.product.all = "All Primary";
    var interfaces = idb.menuBar (theSVG, theVIS, [idb.country, idb.product, idb.flow, idb.units]);
    var countryInterface = interfaces[0];
    var productInterface = interfaces[1];
    var flowInterface = interfaces[2];
    var unitsInterface = interfaces[3];

    /* Add the axes legends */
    var xAxisLegend = 
        theVIS.append("text")
            .attr("class", "axisLegend")
            .style("text-anchor", "end")
            .attr("x", width - margin[1])
            .attr("y", height - margin[2]+periodLegendY)
            .text (TL("Period"));
    var yAxisLegend = 
        theVIS.append("text")
            .attr("class", "axisLegend")
            .style("text-anchor", "end")
            .attr("transform", "translate ("+ (margin[3]-50) + ","
                                    + margin[0] + ") rotate(-90)")
            .text (TL("kBOE/day"));

    /* Load the file containing a list of all available countries and products */
    d3.json (dataFolder + "/countryproduct.json", function (data) {

        /* Get all countries in the data */
        var countries = getDistinct(data, "country");
        countries.sort();

        /* The chart */
        var chart = undefined;

        /* The periods */
        var periods = [];

        /* The normalizing data for each country */
        var normalizing = {};

        /* Function to make sure that normalizing has all the energy unit normalizing data
           for the current countries. When done, calls callback */
        var loadNormalizing = function (callback) {
            /* The currently selected countries */
            var countries = countryInterface.selectedData();

            /* Figure out what to load */
            var files = [];
            for (var i = 0; i < countries.length; i++) {
                var country = countries[i];
                if (normalizing[country] == undefined) {
                    files.push ({
                        'filename': normalizingDataFolder + '/normalization ' + shortname[country] + ".json",
                        'country': country,
                    });
                }
            }

            /* Load needed files */ 
            var loadCount = files.length;
            if (loadCount == 0) callback();
            else {
                for (var ifile in files) {
                    var filename = files[ifile].filename; 
                    var country = files[ifile].country;

                    d3.json (filename, (function (country) { 
                        return function (ndata) {
                            var norm = {};
                            for (var iperiod in ndata) {
                                var period = ndata[iperiod].period;
                                norm [period] = ndata[iperiod];
                            }
                            normalizing[country] = norm;
                            loadCount--;
                            if (loadCount == 0) callback();
                        }
                    })(country));
                }
            }
        };

        /* Loads the data for a given product/destination for all selected countries. */
        /* When finished, calls callback with the corresponding data */
        var loadProductDestination = function (callback) {

            /* The currently selected countries */
            var countries = countryInterface.selectedData();

            /* The currently selected product */
            var product = shortname[productInterface.selectedData()];

            /* The currently selected destination */
            var destination = shortname[flowInterface.selectedData()];

            /* The currently selected units */
            var units = unitsInterface.selectedData()[0];

            context.source = productInterface.selectedData();
            context.country = countries;
            context.flow = flowInterface.selectedData();
            context.units = units;

            context.dataFolder = dataFolder;
            context.csvDataFolder = csvDataFolder;

            context.fileName = product + " " + destination + ".zip";
            context.fileList = [ ];
            context.csvFileList = [ ];

            var countryShortNames = [];
            for(var i in countries)
            {
                countryShortNames[i] = twoLetter[countries[i]];
            }

            energy.updateAbstract(countryShortNames,TL(context.source),TL(destination));

            /* The resulting data structure */
            var cdata = {};

            /* Figure out files to read */
            var files = [];
            for (var icountry in countries) {

                /* The country */
                var country = countries[icountry]/*.country*/;

                /* Available products for that country */
                var countryProducts = getDistinct(getFiltered(data, 'country', country), 'product');
                countryProducts = getMapped (countryProducts, function (d) { return shortname[d] });

                /* See if this product exists for that country */
                if (countryProducts.indexOf(product) >= 0) {
                    files.push({
                        'filename': dataFolder + '/' + shortname[country] + ' ' + product + ".json",
                        'country': country,
                    });
                    context.fileList.push(shortname[country] + ' ' + product + ".json");
                    context.csvFileList.push(shortname[country] + ' ' + product + ".csv");
                }
            }

            /* Load each file and after the last one, call callback */
            var loadCount = files.length;
            if (loadCount == 0) callback(cdata);
            for (var ifile in files) {
                var filename = files[ifile].filename; 
                var country = files[ifile].country;

                var processFile = d3.json (filename, (function (country) { 
                    return function (pdata) {
                        var dic = {};
                        /* Accumulate values per period */
                        if (destination == 'Transformation')
                            pdata.forEach (function (d) {
                                if (d.period.length <= 4 &&  
                                    (shortname[d.flow] == 'Electricity' ||
                                    shortname[d.flow] == 'Oil_Products')) {
                                    dic[d.period] = (dic[d.period] || 0) + Math.abs(d.value)
                                }
                            });

                        else if (destination == 'Supply') {
                            pdata.forEach (function (d) {
                                if (d.period.length <= 4 && 
                                    (shortname[d.flow] == 'Production' ||
                                     shortname[d.flow] == 'Exports' ||
                                     shortname[d.flow] == 'Imports')) {
                                    dic[d.period] = (dic[d.period] || 0) + Math.abs(d.value)
                                }
                            });
                        }
                        else 
                            pdata.forEach (function (d) {
                                if (d.period.length <= 4 && 
                                    (shortname[d.flow] == destination)) {
                                    dic[d.period] = (dic[d.period] || 0) + Math.abs(d.value)
                                }
                            });
                        /* Compute a units conversion function */
                        var convertUnits = function (period,val) { return val; };
                        if (units == "gdp") {
                            convertUnits = function (period,val) {
                                /* Barrels per gdp unit per year */ 
                                if (normalizing[country] && normalizing[country][period])
                                    return val * 1000 * 365 * 10000 / normalizing[country][period][units];
                                return 0;
                            }
                        }
                        else if (units == "population") {
                            convertUnits = function (period,val) {
                                /* Barrels per person per year */
                                if (normalizing[country] && normalizing[country][period])
                                    return val * 1000 * 365 / normalizing[country][period][units]; 
                                return 0;
                            }
                        }
                        /* Set the correct axis units */
                        yAxisLegend.text (TL (units));
                        /* Create an array from dic */
                        var res = [];
                        for (var p in dic) {
                            res.push ({'period' : p, 'value' : convertUnits(p,dic[p])});
                        }
                        /* sort by period */
                        res.sort (function (a,b) {
                            var x = a.period; var y = b.period;
                            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                        });
                        if (res.length > 0) cdata [country] = res;
                        loadCount --;
                        if (loadCount == 0) callback (cdata);
                    };

                })(country));
            }

        }; /* End of loadProductDestination */

        /* Called by the menus */
        var menuChangeCallback = function () {

            /* Called when all countries are loaded */
            function allLoaded (data) {
                if (chart == undefined) {
                    chart = lcg.area() 
                        .parent ('#areachart')
                        .size([width,height])
                        .margin(margin)
                        .set ('xtickformat', function (d) { return d })
                        .set ("ytickformat", function (d) { return parseFloat(d).energyFormat(); })
                        .set ('xgridlines', xgridlines)
                        .set ('ygridlines', ygridlines)
                        .series (function (d) { return d.data; })
                        .category (function (d,i) { return d.period })
                        .value (function (d) { return d.value });
                }

                // Find a union of all periods in all series
                var allPeriods = {};
                for (var country in data) {
                    var periods = getDistinct(data[country], "period");
                    for (var i = 0; i < periods.length; i++) { allPeriods [periods[i]] = 1; }
                }
                // Put a zero value at all missing data points
                for (var country in data) {
                    var cdata = data [country];
                    var periods = getDistinct(data[country], "period");
                    for (var period in allPeriods) {
                        if (periods.indexOf(period) < 0) {
                            cdata.push ({'period' : period, 'value' : 0 })
                        }
                    }
                    /* sort by period */
                    cdata.sort (function (a,b) {
                            var x = a.period; var y = b.period;
                            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                    });
                    data [country] = cdata;
                }

                
                var chartData = [];
                var countryName = [];
                for (var country in data) {
                    chartData.push({"data" : data[country], "country": country });
                    countryName.push(TL(country));
                }
                chart
                   .label(function(d,i) { 
                        return countryName[i].toUpperCase();
                    })
                   .data (chartData, function (d) { return d.country; });

                /* Set up colors */
                var colors = countryInterface.selectedColors();
                var countries = countryInterface.selectedData();
                chart._group.selectAll ("g.series").each (function (d) {
                    var i = countries.indexOf(d.country);
                    var g = d3.select(this);
                    g.style("fill",colors[i]);
                    g.select("path.area").attr("fill",colors[i]);
                    g.select("path.line").attr("stroke",colors[i]).attr("fill",colors[i]);
                    g.select("g.symbols").attr("fill",colors[i]);
                });

                /* Adjust the labels after the have been placed by the chart (which takes some time due to the animation) */
                setTimeout (function () {
                    /* Separate the labels from the lines */
                    var trans = [];
                    var order = [];
                    var dy = [];
                    var labels = d3.selectAll ("#areachart .label");
                    /* obtain positions for the labels */
                    labels.each (function (d,i) { 
                        var sel = d3.select(this);
                        order[i] = i;
                        dy[i] = 0;
                        trans[i] = lcg.getTranslation(sel); 
                    });
                    /* Obtain order by y */
                    order.sort (function (a,b) { return trans[a][1]-trans[b][1];});
                    for (var j = order.length-2; j >= 0; j--) {
                        var i = order[j];
                        var prev = order [j+1];
                        var prevy = trans [prev][1]+dy[prev]-10;
                        if (trans [i][1] > prevy) dy[i] = prevy - trans [i][1] ;
                    }
                    labels.transition().duration (500).attr("dx", "10px").attr("dy", function (d,i) { return dy[i]+5});
                }, 1000);

            }

            loadNormalizing (function () {
                loadProductDestination (allLoaded);
            });
        };

        /* configure the country interface */
        countryInterface.select (defaultCountries);
        countryInterface.onChange = menuChangeCallback;

        /* configure the product interface */ 
        productInterface.select (defaultProduct);
        productInterface.onChange = menuChangeCallback;

        /* set up callbacks for the flow menu */
        flowInterface.select (defaultFlow);
        flowInterface.onChange = menuChangeCallback;

        /* set up callbacks for the units menu */
        unitsInterface.select (defaultUnits);
        unitsInterface.onChange = menuChangeCallback;

        /* process the first data set */
        menuChangeCallback ();
    });

} /* END OF CHART FUNCTION */

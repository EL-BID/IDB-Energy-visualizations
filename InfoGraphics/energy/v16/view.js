function chart(selector)
{

    /* Several constants that affect the design */
    var width = 950; /* width of the design */
    var svgheight = 650; /* height of the svg */
    var height = 500; /* height of the chart */
    var margin = [50,120,90,80]; /* Space of chart w.r.t top/right/bottom/left borders of svg */
    var periodLegendY = 40; /* Vertical position of period legend w.r.t. axis */
    var energyLegendX = 20; /* Horizontal position of energy legend w.r.t. axis */
    var consumptionLabelSepX = 32; /* X separation of consumption label */
    var consumptionLabelSepY = 5; /* X separation of consumption label */
    var consumptionIconSize = 32; /* Size of consumption sector icon */
    var consumptionIconX = 4; /* Relative x position of consumption sector icon */
    var consumptionIconY = -16; /* Relative y position of consumption sector icon */
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


    /* Add the axes legends */
    var xAxisLegend = theVIS.append("text")
        .attr("class", "axisLegend")
        .style("text-anchor", "end")
        .attr("x", width - margin[1])
        .attr("y", height - margin[2]+periodLegendY)
        .text (TL("Period"));

    var yAxisLegend = theVIS.append("text")
        .attr("class", "axisLegend")
        .style("text-anchor", "end")
        .attr("transform", "translate ("+ (margin[3]-50) + ","
                                    + margin[0] + ") rotate(-90)")
        .text (TL("kBOE/day"));

    /* Create the menu bar and obtain the interfaces */
    idb.units.percent = true;
    var interfaces = idb.menuBar (theSVG, theVIS, [idb.country, idb.units]);
    var countryInterface = interfaces[0];
    var unitsInterface = interfaces[1];


    /* Load the file containing a list of all available countries and products */
    d3.json ( dataFolder + "/countryproduct.json", function (data) {

        /* Get all countries in the data */
        var countries = getDistinct(data, "country");
        countries.sort();

        /* The chart */
        var chart = undefined;

        /* Names of consumption sectors */
        var sectors = [ "Industry", "Transport",  "Residential",  "Commercial",  "Other"];

        /* The periods */
        var periods = [];

        /* The normalizing data for each period of the current country */
        var normalizing = {};
        var normCountry = ""; /* Which country normalizing belongs to */ 

        /* Function to make sure that normalizing has all the energy unit normalizing data
           for the periods of the current country. When done, calls callback */
        var loadNormalizing = function (callback) {

            /* The current country */
            var country = countryInterface.selectedData()[0];

            /* See if loading is needed */
            if (normCountry == country) {
                callback();
                return;
            }
            normCountry = country;
            normalizing = {};

            var filename = normalizingDataFolder + '/normalization ' + shortname[country] + ".json";

            d3.json (filename, function (ndata) {
                for (var iperiod in ndata) {
                    var period = ndata[iperiod].period;
                    normalizing [period] = ndata[iperiod];
                }
                callback();
            });
        };


        /* Loads the consumption data for a given country and all periods */
        /* When finished, calls callback with the corresponding data */
        var loadCountry = function (callback) {

             /* The current country */
            var country = countryInterface.selectedData()[0];
            var units = unitsInterface.selectedData()[0];

            /* The resulting data structure */
            var cdata = {};

            var filename = dataFolder + "/" + shortname[country] + ' All_Products.json';

            context.country = country;
            context.units = units;
            context.dataFolder = dataFolder;
            context.csvDataFolder = csvDataFolder;                  
            context.fileName = shortname[country] + ' All_Products.zip';
            context.fileList = [ shortname[country] + ' All_Products.json' ];
            context.csvFileList = [ shortname[country] + ' All_Products.csv' ];

            energy.updateAbstract(TL(country),TL(units));

            /* Load the file */
            d3.json (filename, function (pdata) {
                /* res is a dictionary with sectors as keys */
                var res = {};
                sectors.forEach(function(d) { res[d] = [];});

                /* pdict is used to collect all distinct periods */
                var pdict = {};

                /* Obtain data for all periods */
                pdata.forEach (function (d) {
                    if (d.period.length <= 4 && 
                        sectors.indexOf(shortname[d.flow]) >= 0) {
                        res[d.flow].push ({
                            'period' : d.period, 
                            'value' : d.value}
                            );
                        pdict [d.period] = (pdict[d.period] || []).concat(d.flow);
                    }
                });


                /* sort by period */
                for (var s in res) {

                    /* Fill non-existing flows with 0, since stacked area charts */
                    /* require data for all abcissas */
                    for (var period in pdict) {
                        if (pdict[period].indexOf(s) < 0) {
                            res[s].push ({
                                'period' : period, 
                                'value' : 0
                            });
                        }
                    }

                    res[s].sort (function (a,b) {
                        var x = a.period; var y = b.period;
                        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                    })
                };

                callback (res);
            });

        }; /* End of loadCountry */

        /* Called by the menus */
        var menuChangeCallback = function () {

            /* Called when all countries are loaded */
            function allLoaded (data) {

                if (chart == undefined) {
                    chart = lcg.stackedArea() 
                    .parent ('#areachart')
                    .size([width,height])
                    .margin(margin)
                    .set ('xtickformat', function (d) { 
                        /* make sure not a fractional year */
                        if (d-Math.floor(d) > 0.001) return "";
                        return d 
                    })
                    .set ('ytickformat', function (d) { return d.energyFormat();})
                    .category (function (d,i) { return d.period })
                    .set ('xgridlines', xgridlines)
                    .set ('ygridlines', ygridlines)
                    .value (function (d) { return d.value });
                }


                /* Compute a units conversion function */
                var units = unitsInterface.selectedData()[0];
                var convertUnits = 
                    units == "gdp" ? function (period,val) {
                        /* Barrels per gdp unit per year */
                        return normalizing[period] && normalizing[period][units] ? 
                             val * 1000 * 365 * 10000 / normalizing[period][units] :
                             0;

                    }
                    : units == "population" ? function (period,val) {
                        /* Barrels per person per year */
                        return normalizing[period] && normalizing[period][units] ? 
                            val * 1000 * 365 / normalizing[period][units] :
                            0; 
                    }
                    : function (period,val) {
                        return val;
                    };

                /* Set the correct y axis legend */
                yAxisLegend.text (TL(units));

                /* Normalize data */
                if (units == "percent") {
                    var periodTotal = {};
                    for (sector in data) {
                        data [sector].forEach(function (d) {
                            periodTotal [d.period] = (periodTotal [d.period] || 0) + d.value;
                        });
                    }
                    for (sector in data) {
                        data [sector].forEach(function (d) {
                            d.value = d.value * 100 / periodTotal [d.period];
                        });
                    }
                }

                var chartData = [];
                for (sector in data) {

                    var sectorData = data [sector];
                    sectorData.forEach(function (d) {
                        d.value = convertUnits(d.period,d.value);
                    });

                    chartData.push ({
                        name: sector,
                        values: sectorData
                    });
                }

                /* If percentage, compute fractions */
                if (units == "percent") {
                    /* Collect totals by period */
                    for (var j in periods) {
                        var total = 0;
                        for (var i in products) {
                            total += pdata[i][j];
                        }
                        if (total == 0) {
                            for (var i in products) {
                                pdata[i][j] = 100;
                            }
                        } else {
                            for (var i in products) {
                                pdata[i][j] *= 100 / total;
                            }
                        }
                    }
                }

                chart
                   .series (function(d,i) { return d.values })
                   .label(function(d,i) { 
                        return TL(d.name).toUpperCase();
                    })
                   .data (chartData, function (d,i) {
                        return d.name;
                   });

                /* Separate the labels from the lines */
                chart._group.selectAll (".label")
                    .attr("dx", consumptionLabelSepX + "px")
                    .attr("dy", consumptionLabelSepY + "px");

                /* Add consumption icons */
                chart._group.selectAll (".labelpos").each(function (d,i) {
                    var g = d3.select(this);
                    // if (g.select("image").empty()) {
                    //     var filename = P + "/energy/lib/img/menu-sector/"+d.name+".png";
                    //     g.append("image") 
                    //         .attr("xlink:href", filename)
                    //         .attr("x", consumptionIconX)
                    //         .attr("y", consumptionIconY)
                    //         .attr("width", consumptionIconSize)
                    //         .attr("height", consumptionIconSize);
                    // }
                    if (g.select("g.icon").empty()) {
                        var gicon = g.append("g")
                            .classed("icon", true)
                            .attr("transform", 
                                "translate("+consumptionIconX+","+consumptionIconY+")"+
                                "scale("+(consumptionIconSize/160)+")"
                                );
                        gicon.append ("path")
                            .attr("d", iconpath["Ring"]);
                        gicon.append ("path")
                            .style ("fill", "#B0B0B0")
                            .attr("d", iconpath[d.name]);
                    }

                });

                /* Adjust the labels after the have been placed by the chart (which takes some time due to the animation) */
                setTimeout (function () {
                    /* Separate the labels from the lines */
                    var trans = [];
                    var order = [];
                    var dy = [];
                    var labels = chart._group.selectAll (".labelpos");
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
                        var prevy = trans [prev][1]+dy[prev]-20;
                        if (trans [i][1] > prevy) dy[i] = prevy - trans [i][1] ;
                    }
                    labels.transition().duration (500).attr("transform", function (d,i) { 
                        return "translate("+trans[i][0]+","+(trans[i][1]+dy[i])+")";
                    });
                }, 1000);

            }

            /* Load the current country data and then call allLoaded */
            /* to load the visualization */
            loadCountry (allLoaded);
        };

        /* Set up the country interface */
        countryInterface.select([defaultCountry]);
        countryInterface.onChange = function () {
            loadNormalizing(menuChangeCallback);
        };

         /* Set up the units interface */
        unitsInterface.select(defaultUnits);
        unitsInterface.onChange = menuChangeCallback;

        /* process the first data set */
        loadNormalizing(menuChangeCallback);
    });

} /* END OF CHART FUNCTION */

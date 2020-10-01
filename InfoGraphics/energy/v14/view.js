    function chart(selector)
    {

        /* MAIN PROGRAM */

        /* Several constants that affect the design */
        var width = 950;     /* width of the visualization / svg */
        var height = 500;    /* height of the visualization */
        var svgheight = 650; /* height of the svg */
        var groupsep = 0.1; /* Separation between periods */
        var barsep = 0.02;  /* Separation between bars of the same period */
        var triangleSize = 8; /* Overall size of the triangle decoration */
        var triangleSep = 3; /* Separation between triangle and bar */
        var rectBorder = 2; /* Border of rectangle (Consumption) */
        var maxXticks = 10; /* Max number of period labels to use in the x axis */
        var maxPeriodsTriangle = 10; /* If there are more periods than this number, import/export triangles are not plotted */
        var margin = [40,80,80,80]; /* Space of chart w.r.t top/right/bottom/left borders of svg */
        var legendOffset = [40,40]; /* Position (x,y) of the legend box w.r.t. the visualization */

        var sel = d3.select(selector);


        /* Create the svg element */
        var theSVG = sel
            .append("svg:svg")
            .attr("width", width)
            .attr("height", svgheight);   
        
  
        /* Create a group for holding the whole visualization */
        var theVIS = theSVG.append ("g")
            .attr("id", "barchart")
            .attr("class","datavis")
            .attr ("transform", "translate(0,"+((svgheight-height)/2)+")");     
        

        /* Add the units legend */
        theVIS.append("text")
        .attr("class", "UnitLegend")
        .attr("x", 20)
        .attr("y", 10)
        .text (TL("All figures in kBOE/day"));

        /* Create the menu bar and obtain the interfaces */
        idb.product.all = "All Primary";
        idb.units.percent = true;
        idb.tabSpacing = [170,155,190,170];
        var interfaces = idb.menuBar (theSVG, theVIS, [idb.country, idb.periodType, idb.product, idb.flow, idb.units]);
        var countryInterface = interfaces[0];
        var productInterface = interfaces[2];
        var periodTypeInterface = interfaces[1];
        var flowInterface = interfaces[3];
        var unitsInterface = interfaces[4];

        /* Load the file containing a list of all available countries and periods */
        d3.json (dataFolder + "/countryproduct.json", function (data) {

            var countries = getDistinct(data, "country");
            countries.sort();

            /* The chart */
            var chart = undefined;

            /* The periods for the current country */
            var periods = [];

            /* The normalizing data for each period of the current country */
            var normalizing = {};
            var normCountry = ""; /* Which country normalizing belongs to */ 

            /* Names of primary products */
            var primaryProducts = ["Coal", "Crude", "Gas", "Nuclear", "Hydro", "Solar", "Geothermal", "CRW"];

            /* Disable products that cannot be selected */
            var filterProducts = function () {
                /* The current country */
                var country = countryInterface.selectedData()[0];

                /* Obtain products of this country */
                var products = getDistinct (getFiltered (data, "country", country), "product");

                productInterface.active (function (d) { 
                    for (i in products) {
                        if (shortname [d] == shortname[products[i]]) return true;
                    }
                    return false;
                });
            };

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

            /* Contains the product Data for the current country */
            var productData = {};
            var productCountry = ""; /* The country productData belongs to */

            /* Loads data for the requested products for the current country and calls callback when done */
            var loadProductData = function (products, callback) {

                /* The current country */
                var country = countryInterface.selectedData()[0];

                /* See if loading is needed */
                if (productCountry != country) {
                    productCountry = country;
                    productData = {};
                }

                /* Figure out what to load */
                var files = [];
                for (var i = 0; i < products.length; i++) {
                    var product = products[i];
                    if (productData[product] == undefined) {
                        files.push ({
                            'filename': dataFolder + "/" + shortname[country] + ' ' + product + ".json",
                            'product': product,
                        });
                    }
                }

                /* Load needed files */ 
                var loadCount = files.length;
                if (loadCount == 0) callback();
                else {
                    for (var ifile in files) {
                        var filename = files[ifile].filename; 
                        var product = files[ifile].product;

                        d3.json (filename, (function (product) { 
                            return function (error,pdata) {
                                if (error) console.log (product,"error");
                                if (pdata == undefined) {
                                    console.log (product,"Not loaded");
                                    productData[product] = [];
                                }
                                else {
                                    productData [product] = pdata;
                                }
                                loadCount--;
                                if (loadCount == 0) callback();
                            }
                        })(product));
                    }
                }
            }

            /* THis must be here! */
            var products = [];
            var periods = [];

            /* Loads the chart for a given country and product */
            loadCountryProduct = function () {

                /* The current country and period */ 
                var country = countryInterface.selectedData()[0];

                /* The currently selected product */
                var product = shortname[productInterface.selectedData()[0]];

                /* 'All' means all primary products */ 
                products = (product == 'All_Primary') ? primaryProducts : [product]; 

                /* The currently selected flow */ 
                var flow = shortname[flowInterface.selectedData()[0]];

                energy.updateAbstract(TL(country),TL(productInterface.selectedData()[0]),TL(flow));
                
                /* The currently selected units */ 
                var units = unitsInterface.selectedData()[0];

                /* Update the units legend */
                theVIS.select (".UnitLegend").text (TL("All units in "+units));

                /* Load and process JSONs for that country and those products */
                loadProductData (products, function () {
                    
                    var data = productData [product];

                    context.country = country;
                    context.source = productInterface.selectedData()[0];
                    context.units = units;
                    context.flow = flowInterface.selectedData()[0];
                    context.dataFolder = dataFolder;
                    context.csvDataFolder = csvDataFolder;                  
                    context.fileName = shortname[country] + ' ' + product + ".zip";
                    context.fileList = [ shortname[country] + ' ' + product + ".json" ];
                    context.csvFileList = [ shortname[country] + ' ' + product + ".csv" ];

                    /* Filter data to obtain only periods of the given country */
                    /* Obtain a union with all periods of all products */ 
                    var availPeriods = [];
                    var dic = {};
                    for (var i in products) {
                        var prod = products[i];
                        for (var j in productData[prod]) {
                            var info = productData[prod][j];
                            if (!dic [info.period]) {
                                dic [info.period] = 1;
                                availPeriods.push(info.period);
                            }
                        }
                    }

                    /* Remove Averages / Annual data depending on the periodicity */
                    var periodicity = periodTypeInterface.selectedData()[0];
                    context.period = periodicity;

                    periods = [];
                    if (periodicity == "Years") {
                        /* Annual -> remove averages */
                        periods = getFiltered (availPeriods, function (d) { return d.length <= 4})
                    } 
                    else {
                        /* Averages -> remove annual */
                        periods = getFiltered (availPeriods, function (d) { return d.length > 4})
                    } 
                    periods.sort();

                    /* Function to obtain the right flow energy value */ 
                    var getValue = 
                          flow == "Consumption" ? function (info) { return info['consumed']}
                        : flow == "Production" ? function (info) { return info['produced']}
                        : flow == "Transformation" ? function (info) { return Math.abs(info['transformed'])}
                        : flow == "Imports" ? function (info) { return info['imports']}
                        : flow == "Exports" ? function (info) { return Math.abs(info['exports'])}
                        : flow == "Supply" ? function (info) { return info['produced'] + info['imports'] + info ['exports'] }
                        : function (info) { return 0 };

                    /* Compute a units conversion function */
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
                    

                    /* This is where the actual country/product data for the chart will be stored */
                    var pdata = [];
                    for (var i in products) {
                        pdata.push([]);
                        var product = products[i];
                        var data = productData[product];
                        for (var iperiod in periods) {
                            var period = periods [iperiod];
                            var info = productInfo (getFiltered (data, 'period', period), product);
                            pdata[i].push(convertUnits(period,getValue(info)));
                        }
                    }

                    /* If percentage, compute fractions */
                    if (units == "percent") {
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

                    /* function for adjusting the number of years shown in the x axis */
                    function xtickformat(d) {
                        var n = ~~(periods.length / maxXticks) + 1; /* Integer division! */
                        var halfn = ~~(n/2);
                        if (periods.indexOf(d) % n == halfn) return d;
                        return "";
                    }
                    var prodClass = ["Imported", "Produced", "Consumed", "Transformed", "Exported"];
                    if (chart == undefined) {
                        chart = lcg.bar()
                            .parent ("#barchart")
                            .size([width,height])
                            .margin(margin)
                            .seriesClassName (function (s) { 
                                s = parseInt(s); 
                                return products[s];
                            })
                            .x(function (d,i) { return periods[i]})
                            .cluster(function (s) { return 0 /* return s < 2 ? 0 : 1;*/ } )
                            .barSep (barsep)
                            .groupSep (groupsep)
                            .yorient("right")
                            .set('ygridlines', true)
                        chart._xtickformat = xtickformat;
                        chart._ytickformat = function (d) { return parseFloat(d).energyFormat(); }
                    }
                    chart.data(pdata);

                    /* Set the correct colors */
                    chart._group.select (".plotArea").selectAll("g").each (
                        function (d,i) {
                            var c = d3.select(this).attr("class");
                            var color = productInterface.productColor(c); 
                            d3.select(this).selectAll("path").attr("fill",color);
                        });

                });
                
                

            }; /* End of loadCountryProduct */

            countryInterface.select([defaultCountry]);
            countryInterface.onChange = function () {
                filterProducts();
                loadNormalizing(loadCountryProduct);
            };

            periodTypeInterface.select (defaultPeriod);
            periodTypeInterface.onChange = loadCountryProduct;

            productInterface.select (defaultProduct);
            productInterface.onChange = loadCountryProduct;

            flowInterface.select (defaultFlow);
            flowInterface.onChange = loadCountryProduct;

            unitsInterface.select(defaultUnits);
            unitsInterface.onChange = loadCountryProduct;

            /* Load the first country */
            filterProducts();
            loadNormalizing(loadCountryProduct);

        });

    } /* END OF CHART FUNCTION */

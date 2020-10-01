function chart(selector, data)
{
    var svgheight = 512; /* height of the svg */
    var width = 950; /* width of the svg canvas */
    var height = 362; /* Height of visualization canvas */

    /* MAIN PROGRAM */

    /* Create the svg element */
    var theSVG = d3.select(selector)
        .append("svg:svg")
        .attr("class","datavis")
        .attr("width", width)
        .attr("height", svgheight)
    ;

    var theVIS = theSVG
        .append("svg:g")
        .attr("id","sankeychart")
        .attr ("transform", "translate(0,"+((svgheight-height)/2)+")");    
    ;

    /* Append the defs and the diagonal hatch pattern */
    theSVG.append("defs").append("pattern")
        .attr("width", 4)
        .attr("height", 4)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("id", "diagonalHatch")
        .append("path")
        .attr("stroke", "white")
        .attr("d","M-1,1 l2,-2  M0,4 l4,-4 M3,5 l2,-2")
    ;

    /* Add the units legend */
    theVIS.append("text")
        .attr("class", "UnitLegend")
        .attr("x", 20)
        .attr("y", 10)
        .text (TL("All figures in kBOE/day"))
    ;

    idb.product.all = "All Products";            
    var interfaces = idb.menuBar (theSVG, theVIS, [idb.country, idb.product, idb.period]);
    var countryInterface = interfaces[0];
    var productInterface = interfaces[1];
    var periodTypeInterface = interfaces[2];


    /* Get all countries in the data */
    var countries = getDistinct(data, "country");

    /* Get all periods in the data */
    var periods = getDistinct (data, "period");

    /* Loads the chart for a given country/period */
    load = function () {

        /* The current country and period */
        var country = countryInterface.selectedData()[0];
        var period = periodTypeInterface.selectedData()[0];

        /* Load the JSON and render the visualization */ 
        d3.json (dataFolder + '/' + shortname[country] + ' ' + period + ".json", function (data) {

            context.country = country;
            context.period = period;
            context.dataFolder = dataFolder;
            context.csvDataFolder = csvDataFolder;
            context.fileName = shortname[country] + ' ' + period + ".zip";
            context.fileList = [ shortname[country] + ' ' + period + ".json" ];
            context.csvFileList = [ shortname[country] + ' ' + period + ".csv" ];
            context.source = productInterface.selectedData()[0];

            if(data == null)
            {
                return;
            }

            /* Create the Sankey visualization */

            IDBSankey (theVIS, data);            
            energy.updateAbstract(TL(country),period,TL(context.source));

            /* Gather products appearing in this json */
            var countryProducts = getMapped(data, function (d) { return shortname[d.product]; });
            var uniqueCountryProducts = getUnique(countryProducts);

            productInterface.active (function (d) { return uniqueCountryProducts.indexOf(shortname[d]) >= 0 });

            /* Enable/disables the product menu entries based
               on the products available for a given country */

            var productNameMap = { };
            var productMenuData = ["Coal","Crude Oil","Gas","Nuclear","Hydro","Geothermal","Solar & Wind","Biocomb. & Waste","Oil Products","Electricity"];
            for(var i in productMenuData)
            {
                productNameMap[shortname[productMenuData[i]]] = productMenuData[i];
            }

            onProductChange = function () 
            {
                var onChange = productInterface.onChange;
                if (selectedProd == "") 
                {
                    productInterface.select ("All Products");
                }
                else 
                {
                    productInterface.select (productNameMap[selectedProd]);
                }
                context.source = productInterface.selectedData()[0];
                energy.updateAbstract(TL(country),period,TL(context.source));
            };

            productInterface.onChange();
        });

    } /* Load Function */

    countryInterface.select([defaultCountry]);

    countryInterface.onChange = function () {
        var country = countryInterface.selectedData()[0];
        filterPeriods (country);
        load ();
    };

    periodTypeInterface.select (defaultPeriod);
    periodTypeInterface.onChange = load;

    /* Function to make sure only defined periods are active and that the
       selected period is also an active period */
    var filterPeriods = function (country) {
        var periods = getDistinct (getFiltered (data, "country", country), "period");
        periodTypeInterface.active(periods);
        var period = periodTypeInterface.selectedData()[0];
        if (periods.indexOf (""+period) < 0) periodTypeInterface.select(periods[0]);
    };

    filterPeriods(defaultCountry);

    productInterface.select (defaultProduct);
    productInterface.onChange = function(d) 
    {
        var prod = shortname[productInterface.selectedData()[0]];
        if(prod && prod != "All Products")
        {
            selectProduct(prod);
        }
        else
        {
            deSelectProduct();
        }
    };

    /* Load the first country/period */
    load ();


}; /* END OF CHART FUNCTION */

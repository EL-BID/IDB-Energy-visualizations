function chart (selector, data)
{
    var sel = d3.select(selector);

    var theSVG = sel
        .append("svg:svg")
        .attr("class","datavis")		
        .attr ("id", "theSVG")
        .attr("width", width)
        .attr("height", svgheight);   

    /* Create a group for holding the whole visualization */
    var theVIS = theSVG.append ("g")
        .attr("id", "electricitysankey")
        .attr("class","datavis")        
        .attr ("transform", "translate(0,"+((svgheight-height)/2)+")");    

    /* Append the defs and the diagonal hatch pattern */
    theVIS.append("defs").append("pattern")
        .attr("width", 4)
        .attr("height", 4)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("id", "diagonalHatch")
        .append("path")
        .attr("stroke", "white")
        .attr("d","M-1,1 l2,-2  M0,4 l4,-4 M3,5 l2,-2");

    /* Units legends */
    theVIS.append ("text")
        .attr ("id", "leftUnitsLegend")
        .attr ("class", "unitsLegend")
        .attr ("text-anchor", "end")
        .attr ("transform", "translate("+leftUnitsPos+")")
        .text (TL(leftUnitsLegend));

    theVIS.append ("text")
        .attr ("id", "rightUnitsLegend")
        .attr ("class", "unitsLegend")
        .attr ("text-anchor", "start")
        .attr ("transform", "translate("+rightUnitsPos+")")
        .text (TL(rightUnitsLegend));

    theVIS.append ("text")
        .attr ("id", "middleUnitsLegend")
        .attr ("class", "unitsLegend")
        .attr ("text-anchor", "middle")
        .attr ("transform", "translate("+middleUnitsPos+")")
        .text (TL(middleUnitsLegend));


    /* Create a menu bar */ 
    var interfaces = idb.menuBar (theSVG, theVIS, [idb.country, idb.period, idb.rightSide]);
    var countryInterface = interfaces[0];
    var periodInterface = interfaces[1];
    var rightSideInterface = interfaces[2];

    var countries = getDistinct(data, "country");
    countryInterface.active(countries);
    countryInterface.select([defaultCountry]);

    periodInterface.select (defaultPeriod);

    /* Function to make sure only defined periods are active and that the
       selected period is also an active period */
    var filterPeriods = function (country) {
        var periods = getDistinct (getFiltered (data, "country", country), "period");
        periodInterface.active(periods);
        var period = periodInterface.selectedData()[0];
        if (periods.indexOf (""+period) < 0) periodInterface.select(periods[0]);
    }

    filterPeriods(defaultCountry);

    /* Create a group to put the sankey in */
    var sankey = theVIS.append("g");

    /* Loads the chart for a given country/period */
    load = function () {

        /* The currently selected country */
        var country = countryInterface.selectedData()[0];

        /* The currently selected period */
        var period = periodInterface.selectedData()[0];

        /* The meaning of the right side */
        var rightSide = rightSideInterface.selectedData()[0];

        /* Load the JSON and render the visualization */

        d3.json (dataFolder + "/" + shortname[country] + ' ' + period + ".json", function (data) {

            context.dataFolder = dataFolder;
            context.csvDataFolder = csvDataFolder;		        	
            context.fileName = shortname[country] + ' ' + period + ".zip";
            context.fileList = [ shortname[country] + ' ' + period + ".json" ];
            context.csvFileList = [ shortname[country] + ' ' + period + ".csv" ];

            context.country = country;
            context.period = period;

            energy.updateAbstract(TL(country),context.period);

            electricitySankey (sankey, data, rightSide == "Generation by source");

        });

    };

    /* Set the  menu change functions */
    countryInterface.onChange = function () {
        var country = countryInterface.selectedData()[0];
        filterPeriods (country);
        load ();
    };
    periodInterface.onChange = load;
    rightSideInterface.onChange = load;

    /* Load the first country/period */
    load ();

} /* END OF CHART FUNCTION */

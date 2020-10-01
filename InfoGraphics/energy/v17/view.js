var menuClassMap = 
{
    "Coal" : "Coal",
    "Crude Oil" : "Crude",
    "Gas" : "Gas",
    "Nuclear" : "Nuclear",
    "Hydro" : "Hydro",
    "Geothermal" : "Geothermal",
    "Solar & Wind" : "Solar",
    "Biocomb. & Waste": "CRW",
    "Oil Products" : "Oil_Products",
    "Electricity" : "Electricity"
};

var productClassMap = 
{
    "Crude, NGL and feedstocks" : "Crude",
    "Coal and coal products" : "Coal",
    "Oil Products": "Oil_Products",
    "Gas": "Gas",
    "Combustible renewables and waste": "CRW",
    "Electricity": "Electricity",
    "Solar/Wind/Other": "Solar",
    "Geothermal": "Geothermal"
};

var productMenuMap =
{
    "Crude, NGL and feedstocks" : "Crude Oil",
    "Coal and coal products" : "Coal",
    "Oil Products": "Oil Products",
    "Gas": "Gas",
    "Combustible renewables and waste": "Biocomb. & Waste",
    "Electricity": "Electricity",
    "Solar/Wind/Other": "Solar & Wind"
};

function chart(selector,countryPeriodData)
{
    var svgheight = 600; /* height of the svg */            
    var width = 950;
    var height = 550;
    var margin = 40;
    var labelAngle = Math.PI / 3;
    var labelSpc = 15;
    var labelImageWidth = 64;
    var labelMargin = 6;
    var minRadius = 40;
    var circleSpc = 15;

    var theSVG = d3.select(selector)
        .append("svg")
        .attr("class","datavis")
        .attr("width",width)
        .attr("height",svgheight)
    ;

    var theVIS = theSVG
        .append("svg:g")
        .attr ("transform", "translate(0,"+((svgheight-height)/2)+")")
        .on("click",function(){productInterface.select("All Products");productInterface.onChange()})
    ;

    theVIS.append("rect")
        .attr("width",width)
        .attr("height",height)
        .style("fill","white")
    ;

    idb.product.all = "All Products";            
    var interfaces = idb.menuBar (theSVG, theVIS, [idb.country, idb.period, idb.product]);
    var countryInterface = interfaces[0];
    var productInterface = interfaces[2];
    var periodTypeInterface = interfaces[1];

    var svg = theVIS;

    /* Add the units legend */
    svg.append("text")
        .attr("class", "UnitLegend")
        .attr("x", 20)
        .attr("y", 30)
        .text(TL("All figures in kBOE/day"))
    ;

    function drawSector()
    {
        var data = this.data();

        var cosLabelAngle = Math.cos(labelAngle);
        var sinLabelAngle = Math.sin(labelAngle);

        /* Calculate total energy per sector */

        var sum = 0;
        var energyPerSector = [];
        for(var i in data)
        {
            var sector = data[i];
            energyPerSector[i] = 0;
            for(var j in sector.consumption)
            {
                energyPerSector[i] += sector.consumption[j].amount;
            }
            sum += energyPerSector[i];
        }

        var sum2 = 0;
        var energyPerSectorPercentile = [];
        for(var i in energyPerSector)
        {
            energyPerSectorPercentile[i] = ~~Math.round(100*energyPerSector[i]/sum);
            sum2 += energyPerSectorPercentile[i];
        }

        /* Calculate the radius of each circle */

        var radius = [];

        var width2 = width - (2*margin) - ( energyPerSector.length * minRadius * 2 );

        for(var i in energyPerSector)
        {
            radius[i] = minRadius + ( width2/2 * ( energyPerSector[i] / sum ) );
            if(radius[i]+margin > height/2)
            {
                radius[i] = (height/2)-margin;
            }

        }

        /* Calculate the center of circles */

        var cxArray = [];
        var x = 0;
        for(var i in radius)
        {
            cxArray.push(x+radius[i]);
            x += radius[i]*2;
        }

        var cx = function(_,i) { return margin + cxArray[i]; } ;
        var cy = function(_,i) { return (height/2) - margin + 20; } ;
        var rd = function(_,i) { return radius[i] - circleSpc; } ;

        var textTopSectorY = function(_,i) { return (height/2) - margin + 12 - radius[i]; } ;
        var textTopSectorPercentileY = function(_,i) { return (height/2) - margin + 26 - radius[i]; } ;

        this.append("text")
            .attr("class","sectorTopText")
            .text("")
            .attr("x",cx)
            .attr("y",textTopSectorY)
            .style("text-anchor","middle");
        ;

        this.append("text")
            .attr("class","sectorTopTextPercentile")
            .text("")
            .attr("x",cx)
            .attr("y",textTopSectorPercentileY)
            .style("text-anchor","middle");
        ;

        this.append("circle")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("fill", "white")
            .attr("class", function(d) { return d.sector } )
            .attr("stroke-width", 6)
            .attr("r", rd)
        ;

        function xImageLabel(d,i)
        {
            var labelRadius = (labelImageWidth/2) - labelMargin;
            return cx(d,i) + cosLabelAngle * (rd(d,i) + labelSpc + labelRadius) - labelRadius - labelMargin;
        }

        function yImageLabel(d,i)
        {
            var labelRadius = (labelImageWidth/2) - labelMargin;
            return cy(d,i) + sinLabelAngle * (rd(d,i) + labelSpc + labelRadius) - labelRadius - labelMargin;
        }

        this.append("image")
            .attr("x", xImageLabel)
            .attr("y", yImageLabel)
            .attr("width", labelImageWidth)
            .attr("height", labelImageWidth)
            .attr("xlink:href", function(d) { return P + "/energy/v17/img/" + d.sector + ".png" } )
        ; 

        var pathFunction = function(d,i)
        {
            var x0 = cx(d,i) + cosLabelAngle * rd(d,i);
            var y0 = cy(d,i) + sinLabelAngle * rd(d,i);
            var xf = cx(d,i) + cosLabelAngle * (rd(d,i)+labelSpc+1);
            var yf = cy(d,i) + sinLabelAngle * (rd(d,i)+labelSpc+1);
            return "M" + x0 + "," + y0 + "L" + xf + "," + yf;
        };

        this.append("path")
            .attr("d", pathFunction)
            .attr("class", function(d) { return d.sector } )
            .attr("stroke-width", 6)
        ;

        function xSectorNameText(d,i)
        {
            return xImageLabel(d,i) + labelImageWidth/2;
        }

        function ySectorNameText(d,i)
        {
            return yImageLabel(d,i) + labelImageWidth + labelMargin;
        }

        this.append("text")
            .attr("class", "sectorName")
            .text(function(d) { return TL(d.sector) } )
            .attr("text-anchor", "middle")
            .attr("x", xSectorNameText)
            .attr("y", ySectorNameText)
        ;

        function xSectorValueText(d,i)
        {
            return xSectorNameText(d,i);
        }

        function ySectorValueText(d,i)
        {
            return ySectorNameText(d,i) + 18;
        }

        function ySectorPercentileText(d,i)
        {
            return ySectorNameText(d,i) + 34;
        }

        function textSectorValue(d,i)
        {
            var n = ~~Math.round(energyPerSector[i]);
            if(n == 0)
            {
                n = "< 1";
            }
            else
            {
                n = n.energyFormat()
            }
            return n;        
        }

        function textSectorPercentile(d,i)
        {
            return "(" + energyPerSectorPercentile[i] + "%)";        
        }

        this.append("text")
            .attr("class", "sectorValue")
            .text(textSectorValue)
            .attr("text-anchor", "middle")
            .attr("x", xSectorValueText)
            .attr("y", ySectorValueText)
        ;

        this.append("text")
            .attr("class", "sectorPercentile")
            .text(textSectorPercentile)
            .attr("text-anchor", "middle")
            .attr("x", xSectorValueText)
            .attr("y", ySectorPercentileText)
        ;



        function pieOuterRadius(_,i,j)
        {
            return 	rd(_,j) - 7;
        }

        function pieInnerRadius(_,i,j)
        {
            return 0.5 * pieOuterRadius(_,i,j);
        }

        var arc = d3.svg.arc()
            .outerRadius(pieOuterRadius)
            .innerRadius(pieInnerRadius)
        ;

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) { return d.amount; })
        ;

        function getConsumptionData(d)
        {
            return pie(d.consumption);
        }

        function translatePieChart(_,_,j)
        {
            return "translate( " + cx(_,j) + "," + cy(_,j) + ")";
        }

        var g = this.selectAll(".piechart")
            .data(getConsumptionData)
            .enter()
            .append("g")
            .attr("class", "piechart")
            .attr("transform", translatePieChart)
        ;

        paths = g.append("path")
            .attr("d", arc)
            .attr("class", function(d) { return "product " + productClassMap[d.data.product] })		
        ;

    }

    function onload(jsonData)
    {

        var data = [

            { sector: "Industry", consumption: [ ] } ,
            { sector: "Transport", consumption: [ ] } ,
            { sector: "Residential", consumption: [ ] },
            { sector: "Commercial", consumption: [ ] },
            { sector: "Other", consumption: [ ] }

        ];

        for(var i in jsonData)
        {
            var row = jsonData[i];

            for(var j in data)
            {
                var row2 = data[j];
                if(row2.sector == row.flow)
                {
                    if(row.product != "All products" && row.product != "Heat")
                    {
                        row2.consumption.push( { product: row.product, amount: row.value } );
                        break;
                    }
                } 
            }
        }

        for(var i=data.length-1; i >= 0; i--)
        {
            var row = data[i];
            if(row.consumption.length == 0)
            {
                data.splice(i,1);
            }
        }

        svg.selectAll(".sectors").remove();

        svg.selectAll(".sectors")
            .data(data)
            .enter()
            .append("g")
            .classed("sectors", true)
            .call(drawSector)
        ;

        d3.selectAll(".product").on("click",function(d){
            productInterface.select(productMenuMap[d.data.product]);
            d3.event.stopPropagation();
            productInterface.onChange();
        });

        selectProductFromMenu();
    }

    function load()
    {
        /* The current country and period */
        var country = countryInterface.selectedData()[0];
        var period = periodTypeInterface.selectedData()[0];
        var product = productInterface.selectedData()[0];

        /* Load the JSON and call onload to render the visualization  */
        d3.json ( dataFolder + '/' + shortname[country]  + ' ' + period + ".json", onload );
        context.source = product;
        context.period = period;
        context.dataFolder = dataFolder;
        context.csvDataFolder = csvDataFolder;		        	
        context.fileName = shortname[country]  + ' ' + period + ".zip";
        context.fileList = [ shortname[country]  + ' ' + period + ".json" ];
        context.csvFileList = [ shortname[country]  + ' ' + period + ".csv" ];
        context.data = dataFolder + '/' + shortname[country]  + ' ' + period + ".json";
        context.csvData = csvDataFolder + '/' + shortname[country]  + ' ' + period + ".csv";
        context.country = country;
        energy.updateAbstract(TL(country),period,TL(context.source)); 
    }

    countryInterface.select([defaultCountry]);

    countryInterface.onChange = function () {
        var country = countryInterface.selectedData()[0];
        filterPeriods (country);
        load ();
    }

    periodTypeInterface.select (defaultPeriod);
    periodTypeInterface.onChange = load;

    /* Function to make sure only defined periods are active and that the
       selected period is also an active period */

    var filterPeriods = function (country) {
        var periods = getDistinct (getFiltered (countryPeriodData, "country", country), "period");
        periodTypeInterface.active(periods);
        var period = periodTypeInterface.selectedData()[0];
        if (periods.indexOf (""+period) < 0) periodTypeInterface.select(periods[0]);
    };

    filterPeriods(defaultCountry);


    function selectProductFromMenu()
    {
        var country = countryInterface.selectedData()[0];
        var period = periodTypeInterface.selectedData()[0];
        var product = productInterface.selectedData()[0];
        
        context.source = product;
        energy.updateAbstract(TL(country),period,TL(context.source)); 

        d3.selectAll(selector)
            .selectAll("path.product")
            .style("opacity",function(d){ return product == "All Products" || menuClassMap[product] == productClassMap[d.data.product] ? 1 : 0.3; })
        ;


        function textTop(d)
        {
            for(var i in d.consumption)
            {
                var c = d.consumption[i];
                if(productClassMap[c.product] == menuClassMap[product])
                {
                    var n = ~~Math.round(c.amount);
                    if(n == 0)
                    {
                        return "< 1";
                    }
                    else
                    {
                        return n.energyFormat();
                    }
                }
            }
            return "";
        }

        function textTopPercentile(d)
        {
            var value = null;
            var sum = 0;
            for(var i in d.consumption)
            {
                var c = d.consumption[i];
                sum += c.amount;
                if(productClassMap[c.product] == menuClassMap[product])
                {
                    value = c.amount;
                }
            }
            if(value !== null && sum > 0)
            {
                return "("+~~Math.round(100*value/sum) + "%)";
            }
            else
            {
                return "";
            }
        }

        d3.selectAll(selector)
            .selectAll("text.sectorTopText")
            .attr("class",function(d){ return "sectorTopText " + menuClassMap[product]})
            .text(textTop)
        ;

        d3.selectAll(selector)
            .selectAll("text.sectorTopTextPercentile")
            .attr("class",function(d){ return "sectorTopTextPercentile " + menuClassMap[product]})
            .text(textTopPercentile)
        ;

        
    }

    productInterface.select (defaultProduct);
    productInterface.onChange = selectProductFromMenu; 

    /* Load the first country / period */
    load ();

} /* END OF CHART FUNCTION */

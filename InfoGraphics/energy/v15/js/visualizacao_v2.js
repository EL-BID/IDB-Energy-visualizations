var variationNoIcons = true;
var variationSameRadius = true;


/* ------------------------------------------------------------------------
 *
 *  Functions to replace d3's chord svg path functions
 */ 

//
// Processes an arc specification taking into account the center coordinates
// 
function arcParams(arcSpec) {

  var a = arcSpec || {};
  a.cx = arcSpec.cx || 0;
  a.cy = arcSpec.cy || 0;
  a.r = arcSpec.r || arcSpec.innerRadius || 100;
  a.innerRadius = a.r;
  a.outerRadius = arcSpec.outerRadius || a.r;
  a.startAngle = arcSpec.startAngle || 0;
  a.endAngle = arcSpec.endAngle || 0;
  a.sx = a.cx + a.r*Math.cos(a.startAngle-Math.PI/2);
  a.sy = a.cy + a.r*Math.sin(a.startAngle-Math.PI/2);
  a.ex = a.cx + a.r*Math.cos(a.endAngle-Math.PI/2);
  a.ey = a.cy + a.r*Math.sin(a.endAngle-Math.PI/2);
  return a;
}

//
// Generates the part of an arc corresponding to a clockwise
// turn from startAngle to endAngle
//
function positiveArc(arcSpec) {
  var a = arcParams(arcSpec);
  var dangle = a.endAngle-a.startAngle;
  var result =
         "M" + a.sx + "," + a.sy + " " +
         "A" + a.r + "," + a.r + " " +
               a.startAngle + " " +
               (dangle > Math.PI ? "1" : "0") + "," +
               "1 " + 
               a.ex + "," + a.ey;
  return result;
}

//
// Generates the part of an arc corresponding to a counterclockwise
// turn from endAngle to startAngle 
//
function negativeArc(arcSpec) {
  var a = arcParams(arcSpec);
  var dangle = a.endAngle-a.startAngle;
  var result =
         "M" + a.ex + "," + a.ey + " " +
         "A" + a.r + "," + a.r + " " +
               a.endAngle + " " +
               (dangle > Math.PI ? "1" : "0") + "," +
               "0 " + 
               a.sx + "," + a.sy;
  return result;
}

// 
// Replacement for the arc path
//
function myArc (arcSpec) {
  arcSpec.r = arcSpec.innerRadius;
  var a = positiveArc(arcSpec);
  arcSpec.r = arcSpec.outerRadius;
  var b = negativeArc(arcSpec);
  return a + "L" + b.substring(1) + "z";
}

// Replacement for the chord path generator
function myChord (chordSpec, ratio) {
  ratio = ratio || 0.8;
  var lerp = function (a,b) {
    return b*(1-ratio)+a*ratio;
  };
  var arc1 = chordSpec.source;
  var arc2 = chordSpec.target;
  var a = positiveArc (arc1);
  var b = positiveArc (arc2);
  var ab = [[lerp(arc1.cx,arc1.ex) , lerp(arc1.cy,arc1.ey)],
            [lerp(arc2.cx,arc2.sx) , lerp(arc2.cy,arc2.sy)]];
  var ba = [[lerp(arc2.cx,arc2.ex) , lerp(arc2.cy,arc2.ey)],
            [lerp(arc1.cx,arc1.sx) , lerp(arc1.cy,arc1.sy)]];
  return a + 
         "C " + ab[0][0] +","+ ab[0][1] + " "
              + ab[1][0] +","+ ab[1][1] + " " +
         b.substring(1) +
         "C " + ba[0][0] +","+ ba[0][1] + " "
              + ba[1][0] +","+ ba[1][1] + " " +
         arc1.sx + "," + arc1.sy + "z"; 

}

/*
 * -----------------------------------------------------------------------
 */ 

/* This is an utility function to spread consecutive angles if they are closer together than
 * minSep radians.  */
function spreadAngles (angles,minSep,constrain) {
    var order = [];
    for (var i = 0; i < angles.length; i++) {
        order.push(i);
    }
    order.sort (function (a,b) { 
        if (angles[a] < angles[b]) return -1;
        if (angles[a] == angles[b]) return 0;
        return 1; }
    );
    for (var k = 0; k < 200; k++) {
        var change = false;
        for (var i = 0; i < angles.length; i++) {
            var j = (i+1) % angles.length;
            var a = angles[order[i]];
            var b = angles[order[j]];
            if (b<a) b+= Math.PI*2;
            var sep = Math.abs(a-b);
            if (sep < minSep) {
                change = true;
                var c = (a+b)/2;
                var factor = (((minSep - sep) * 0.5 + sep) / sep);
                var ii = (i+angles.length-1) % angles.length;
                var aa = angles[order[ii]];
                if (aa>a) aa -= Math.PI*2;
                var jj = (j+1) % angles.length;
                var bb = angles[order[jj]];
                if (bb<b) bb+= Math.PI*2;
                var newA = Math.max((a-c) * factor + c,aa+0.00001);
                var newB = Math.min((b-c) * factor + c,bb-0.00001);
                angles [order[i]] = newA;
                if (newB <= Math.PI*2) angles [order[j]] = newB;
            }
        }
        if (!change) break;
    };

}

/*
 * -----------------------------------------------------------------------
 */ 

function chart (selector, data, country, period, product) {

    /* Several constants that affect the design */
    var width = 950;     /* width of the visualization / svg */
    var height = 420;    /* height of the visualization */
    var svgheight = 750; /* height of the svg */

    /* Create the svg element */
    var theSVG = d3.select (selector)
        .append("svg:svg")
        .attr("class","datavis")        
        .attr("width", width)
        .attr("height", svgheight);   

    /* Create a background rectangle to serve as a target for clicking
     * outside any other element of the visualization */
    var backdrop = theSVG.append ("rect")
        .attr ("class", "backdrop")
        .attr ("width", width)
        .attr ("height", svgheight+100)
        .attr ("fill", "white");

    /* create the group for the visualization */ 
    var theVIS = theSVG
        .append ("svg:g")
        .attr("id", "chordchart")
        .attr ("transform", "translate(0,"+((svgheight-height)/2)+")");


    /* The product colors */ 
    var productColor = {};
    productColor["Coal and coal products"] = d3.rgb(60,60,73);  
    productColor["Crude Oil"] = d3.rgb(50,82,163);
    productColor["Gas"] = d3.rgb(244,81,37);
    productColor["Nuclear"] = d3.rgb(166,106,171);
    productColor["Hydro"] = d3.rgb(71,142,204); 
    productColor["Geothermal"] = d3.rgb(181,6,39);
    productColor["Solar/Wind/Other"] = d3.rgb(252,210,0);
    productColor["Combustible renewables and waste"] = d3.rgb(128,194,80); 
    productColor["Oil Products"] = d3.rgb(13,102,110); 
    productColor["Electricity"] = d3.rgb(204,153,0);

    /* Add a striped mask */
    var defs = theVIS.append ("defs"); 

    var pattern = defs.append ("pattern")
        .attr ("id", "pattern-stripe")
        .attr ("width", 4)
        .attr ("height", 4)
        .attr ("patternUnits", "userSpaceOnUse") 
        .append("rect")
        .attr ("width", 4)
        .attr ("height", 2.5)
        .style ("fill", productColor["Electricity"]);

    var mask = defs.append ("mask")
        .attr ("id", "mask-stripe")
        .append ("rect")
        .attr ("width", "100%")
        .attr ("height", "100%")
        .attr ("fill", "url(#pattern-stripe)");

    /* Add the units legend */
    var unitsLegendSep = 18;
    theVIS.append("text")
        .attr("class", "UnitLegend")
        .attr("x", 20)
        .attr("y", height/2 - unitsLegendSep+3)
        .text (TL("kBOE/day"))
    ;
    theVIS.append("text")
        .attr("class", "UnitLegend")
        .attr("x", 20)
        .attr("y", height/2 - 2*unitsLegendSep+3)
        .text (TL("Inputs to Generation"))
    ;

    theVIS.append("text")
        .attr("class", "UnitLegend")
        .attr("x", 20)
        .attr("y", height/2 + unitsLegendSep+3)
        .attr("text-anchor", "start")
        .text (TL("Generation and Losses"))
    ;

    theVIS.append("text")
        .attr("class", "UnitLegend")
        .attr("x", 20)
        .attr("y", height/2 + 2*unitsLegendSep+3)
        .attr("text-anchor", "start")
        .text (TL("GWh/year"))
    ;

    var rsl = 5; // Radius for separation lines

    theVIS.append("path")
        .attr("d", /* "M 10 -20 V " + (height/2-rsl) + "A " + rsl + " " + rsl + " 0 0 0 " + (rsl+10) + " " + (height/2) + " H 180" */ 
                   "M 20 " + (height/2) + " H 250")
        .attr("stroke", "lightGray")
        .attr("fill", "none")
        .attr("stroke-width", "2px")
    ;



    /* Create a menu bar */ 
    idb.product.showLosses = true;
    idb.product.title = "Source";
    var interfaces = idb.menuBar (theSVG, theVIS, [idb.country, idb.period, idb.product]);
    var countryInterface = interfaces[0];
    var productInterface = interfaces[2];
    var periodInterface = interfaces[1];

    /* Disable countries with no data */
    var countries = getDistinct(data, "country");
    countryInterface.active(countries);

    /* Select default country */
    countryInterface.select([country]);

    /* Select default product */
    productInterface.select (product);

    /* select default period */
    periodInterface.select (period);

    /* Function to make sure only defined periods are active and that the
       selected period is also an active period */
    var filterPeriods = function (country) {
        var periods = getDistinct (getFiltered (data, "country", country), "period");
        periodInterface.active(periods);
        var period = periodInterface.selectedData()[0];
        if (periods.indexOf (""+period) < 0) periodInterface.select(periods[0]);
    }

    function toTW (kboe) {
        return kboe / (1000 / (365 * 1628.2));
    }

    /* Loads the chart for a given country/period */
    load = function () {

        /* The currently selected country */
        var country = countryInterface.selectedData()[0];

        /* The currently selected period */
        var period = periodInterface.selectedData()[0];

        /* The currently selected product */
        var product = productInterface.selectedData()[0];

        /* Load the JSON and render the visualization */
        d3.json (dataFolder + "/" + shortname[country] + ' ' + period + ".json", function (error, data) {

            context.country = country;
            context.period = period;
            context.dataFolder = dataFolder;
            context.csvDataFolder = csvDataFolder;
            context.fileName = shortname[country] + ' ' + period + ".zip";
            context.fileList = [ shortname[country] + ' ' + period + ".json" ];
            context.csvFileList = [ shortname[country] + ' ' + period + ".csv" ];
            context.source = product;
                    
            if (error) {
                console.warn(error);
            }

            /* Get all product data, their electricity output and loss */
            var productData = getFiltered (data, function (d) {
                return d.flow === "Electricity" 
                && d.product !== "All primary" 
                && d.product !== "Crude, NGL and feedstocks"
                && d.product !== "Peat";
            });

            var electricityData = getFiltered (data, function (d) { 
                return d.flow === "Electricity output in GWh";
            });

            /* See if selected product is in the data */
            var validProduct = getFiltered(productData, function (d) { 
                return shortname[d.product] == shortname [product];
            });

            /* If not, set selected product to all products */
            if (validProduct.length == 0) productInterface.select("All Products");
            

            var totalInput = 0, totalOutput = 0, totalLoss = 0;
            productData.forEach(function (d) {
                    d.inputKboe = Math.abs(d.value);
                    d.color = productColor[d.product];
                    d.outputKboe = 0;
                    d.loss = d.inputKboe;
                    electricityData.forEach(function (e) {
                        if (e.product === d.product) {
                            var GWh = e.value;
                            d.outputKboe = GWh / ((365 * 1628.2) / 1000);
                            d.loss = d.inputKboe - d.outputKboe;
                        }
                    });
                    totalInput += d.inputKboe;
                    totalOutput += d.outputKboe;
                    totalLoss += d.loss;
            });

            productData.sort (function (a,b) { 
                if (a.inputKboe > b.inputKboe) return -1;
                if (a.inputKboe ==  b.inputKboe) return 0;
                return 1; 
            });

            /* Deactivate undefined products from the menu */
            productInterface.active (function (d) {
                if (d == "Electricity" || d == "All Products" || d == "Losses") return true;
                for (var i = 0; i < productData.length; i++) {
                    if (shortname[d] == shortname[productData[i].product]) return true;
                }
                return false;
            });

            /* Compute a matrix for the chord graph */
            var matrix = [];
            var n = productData.length + 2;
            for (var i = 0; i < n; i++) {
                matrix.push ([]);
                for (var j = 0; j < n; j++) {
                    matrix [i][j] = 0;
                }
            }
            for (var i = 0; i < productData.length; i++) {
                matrix [i+2][0] = 
                matrix [0][i+2] = 
                productData[i].outputKboe;
                matrix [i+2][1] = 
                matrix [1][i+2] = 
                productData[i].loss;                
            }

            /* The chord layout generator */
            var chord = d3.layout.chord()
                .padding(.015)
                .sortSubgroups(d3.descending)
                .matrix(matrix);

            /* Some geometric variables */
            var innerRadius = Math.min(width, height) * .38,
                dRadius = innerRadius * 0.2,
                electricityRadius = innerRadius + (variationSameRadius ? 0 : dRadius/2),
                inputRadius = innerRadius,
                lossesRadius = innerRadius - (variationSameRadius ? 0 : dRadius/2);

            /* Map the chart to the center of the svg */
            theVIS.select ("g #theChart").remove();
            var theChart = theVIS.append ("g")
                .attr ("id", "theChart")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            /* Define the arcs */
            var arcAngleOffset = 90;
            var iosep = 20; // vertical separation between input and output

            var arcs = theChart.selectAll("path .arc")
                .data(chord.groups)
                .enter().append("path")
                .attr("class", "arc")
                .attr("d", 
                    function (d,i) {
                        var r = i == 1 ? lossesRadius : (i == 0 ? electricityRadius : inputRadius);
                        d.innerRadius = r;
                        d.outerRadius = r+dRadius;
                        var delta = i <= 1 ? iosep : -iosep;
                        d.cx = delta;
                        return myArc (d);
                    }
                )
                .attr ("fill", function (d,i) {
                    if (i >= 2) {
                        return productData[i-2].color;
                    }
                    else if (i == 0) {
                        return productColor["Electricity"];
                    }
                    else {
                        return "url(#pattern-stripe)";
                    }
                })
                .attr('transform', 'rotate(' + arcAngleOffset + ')')
                .on("click", function (d,i) { 
                    highlightProduct(i);
                    selectMenuProduct(i);
                });

                   

            /* Define the paths */
            var pathCounter = 0;
            var paths = theChart.selectAll ("path .chord")
                .data(chord.chords);
            
            var chords = paths.enter().append("path")
                .attr("d", 
                    function (d,i) {
                        var radius;
                        d.target.r = inputRadius;
                        d.target.cx = -iosep;
                        d.source.r = d.target.subindex == 1 ? lossesRadius : electricityRadius;
                        d.source.cx = iosep;
                        return myChord (d);
                    }
                )
                .attr("index", function(d,i){
                    return i;
                })
                .attr("class", "chord")
                .attr("id", function(d){
                    var i = (d.source.subindex -2);
                    if(i < n - 2){
                        return productData[i].product;
                    }
                })
                .style("opacity", function(d){
                    if (d.source.index == 0 || d.source.subindex == 0) 
                        return 0.6;
                    else 
                        return 0.4;
                })
                .attr ("fill", function (d,i) {
                    var i = d.source.index;
                    if (i < 2) {
                        i = d.source.subindex;
                    }
                    return productData[i-2].color;
                })
                .attr('transform', 'rotate(' + arcAngleOffset + ')');


            /* Compute proper angles for the chord labels */
            var chordData = chord.chords();
            var chordAngles = [];
            for (var i = 0; i < chordData.length; i++) {
                var d = chordData[i];
                chordAngles.push((d.source.startAngle+d.source.endAngle)/2);
            }

            /* Do some relaxation to separate the angles */
            spreadAngles (chordAngles, 5.5 * Math.PI / 180);     

            /* Define electricity/waste value labels for each chord */
            var valueLabelOffset = 20;
            var valueLabels = theChart.selectAll ("g .valueLabel")
                .data (chord.chords)
                .enter ()
                .append ("g")
                .classed ("valueLabel", true)
                .attr ("transform", function (d,i) {
                    var r = (d.source.index == 0) ? electricityRadius : lossesRadius;
                    r -= valueLabelOffset;
                    var a = chordAngles[i];
                    var x = r * Math.cos(a);
                    var y = iosep + r * Math.sin(a);
                    return "translate("+x+","+y+")";
                })
                .append ("text")
                .attr ("text-anchor", "middle")
                .style ("font-size", "9px")
                .style ("opacity", "0")
                .text (function (d,i) {
                    var v = d.source.value;
                    v = toTW(v);
                    return v.energyFormat();
                });

            /* Compute proper angles for the icons */
            var chordGroups = chord.groups();
            var angles = [];
            for (var i = 0; i < chordGroups.length; i++) {
                var d = chordGroups[i];
                angles.push((d.startAngle + d.endAngle) / 2);
            }

            /* Do some relaxation to separate the angles */
            spreadAngles (angles, (variationNoIcons ? 3 : 9) * Math.PI / 180);        

            /* Adding label and icon containers */
            var iconOffset = variationNoIcons ? 0 : 35;
            var baseOffset = 35;
            var labelsAndIcons = theChart.append("g")
                .selectAll ("g .labelAndIconContainers")
                .data(chord.groups)
                .enter()
                .append("g")
                .attr('id', function(d){
                    return "cont" + d.index;
                })
                .attr("class", "labelAndIconContainers")
                .attr("transform", function(d,j) {
                    var i = d.index;
                    var m = n / 2;
                    var midAngle = angles[j];
                    var r = (i == 0) ? electricityRadius :
                            (i == 1) ? lossesRadius :
                            inputRadius;
                    var cy = i<2 ? iosep : -iosep;
                    r += baseOffset+dRadius;
                    var x = r * Math.cos(midAngle);
                    var y = cy + r * Math.sin(midAngle);
                    return "translate("+x+","+y+")";
                })
                .on ("click", function (d,i) { 
                    highlightProduct (i);
                    selectMenuProduct(i);
                });

            /* Adding value labels */
            theChart.selectAll ("g .labelAndIconContainers")
                .append("text")
                .attr("text-anchor", 
                    function (d,i) {
                        var midAngle = angles[i];
                        if (midAngle < Math.PI/3 || midAngle > Math.PI * 1.6) return "start";
                        if (midAngle > Math.PI*0.6 && midAngle < Math.PI*1.3) return "end";
                        return "middle";
                    })
                .attr("font-weight", "bold")
                .attr("font-family", "Verdana")
                .attr("font-size", "12px")
                .attr("class", "label")
                .attr("transform", function(d,j) {
                    var midAngle = angles[j];
                    var r = iconOffset;
                    var x = r * Math.cos(midAngle);
                    var y = r * Math.sin(midAngle);
                    return "translate("+x+","+y+")";        
                })
                .attr("fill", function(d){
                    var i = d.index;
                    if (i >= 2){
                        return productData[i-2].color;
                    }
                    if (i == 0 || i == 1){
                        return productColor["Electricity"];
                    } 
                })
                .text(function(d) {
                    var val = 0;
                    var frac = 0;
                    if (d.index >=2) {
                        val = parseFloat(d.value);
                        frac = val / totalInput * 100;
                    }
                    else {
                        val = toTW(d.value);
                        frac = d.value / (totalLoss+totalOutput) * 100;
                    }
                    return  val.energyFormat()+" ("+frac.energyFormat()+"%)";
            });

            if (!variationNoIcons) {
                /* Adding the icons */
                var productIcons = theChart.selectAll ("g .labelAndIconContainers")
                    .append("g")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "translate (-17.5,-17.5) scale(0.07,0.07)");

                /* Create backdrops for the icons */
                productIcons
                    .append ("circle")
                    .attr ({"fill": "white",
                            "cx": 250,
                            "cy": 250,
                            "r": 250 });

                /* Create the icons themselves */ 
                productIcons
                    .append("path")
                    .attr("d", function(d){
                        var i = d.index-2;

                        if(d.index == 0){
                            return iconpath["Electricity"];
                        }
                        if(d.index ==  1){
                            return iconpath["Losses"];
                        }
                        else{
                            switch (productData[i].product){
                                case "Coal and coal products":
                                    return iconpath["Coal"];
                                    break;
                                case "Gas":
                                    return iconpath["Gas"];
                                    break;
                                case "Nuclear":
                                    return iconpath["Nuclear"];
                                    break;
                                case "Hydro":
                                    return iconpath["Hydro"];
                                    break;
                                case "Solar/Wind/Other":
                                    return iconpath["Solar & Wind"];
                                    break;
                                case "Combustible renewables and waste":
                                    return iconpath["Biocomb. & Waste"];
                                    break;
                                case "Oil Products":
                                    return iconpath["Oil Products"];
                                    break;
                                case "Geothermal":
                                    return iconpath["Geothermal"]
                                    break;
                                default:
                                    return "";
                                    break;
                            }
                        }
                    })
                    .attr("width", 35)
                    .attr("height", 35)
                    .attr("class", "icons")
                    .style("fill", function(d){
                        var i = d.index;
                        if (i >= 2){
                            return productData[i-2].color;
                        }
                        if (i == 0 || i == 1){
                            return productColor["Electricity"];
                        } 
                    });
            }


            /* Add a callback for clicking on the background */
            backdrop.on("click", function () {
                highlightProduct();
                selectMenuProduct();
            });

            /* Highlights the chords of product iproduct. If
             * iproduct is not defined, highlights all products */
            function highlightProduct (iproduct) {
                chords.each (function (d,i) {
                    if (iproduct == undefined || d.target.index == iproduct || d.source.index == iproduct) {
                        d3.select(this).style("opacity",
                            d.source.index == 0 || d.source.subindex == 0 ? 0.6 : 0.4);
                    }
                    else {
                        d3.select(this).style("opacity",0.1)   
                    }
                })
                arcs.each (function (d,i) {
                    if (iproduct == undefined || i == iproduct) {
                        d3.select(this).style ("opacity", 1)
                    }
                    else {
                        d3.select(this).style ("opacity", 0.4)
                    }
                })
                labelsAndIcons.each (function (d,i) {
                    if (iproduct == undefined || i == iproduct) {
                        d3.select(this).style ("opacity", 1)
                    }
                    else {
                        d3.select(this).style ("opacity", 0.4)
                    }

                });

                theChart.selectAll ("g .valueLabel text")
                    .style("opacity", 
                        function (d,i) {
                            if (iproduct < 2) return "0";
                            if (iproduct < 2 && d.source.index == iproduct || 
                                iproduct >= 2 && d.source.subindex == iproduct) return "1";
                            return "0";
                        });
            }

            /* Returns a product name based on iproduct and which is compatible with
             * the labels used in the menu */
            var menuProductNames = ["Coal", "Crude Oil", "Gas", "Nuclear", "Hydro", "Geothermal", "Solar & Wind", 
                                    "Biocomb. & Waste", "Oil Products", "Electricity", "Losses"];
            function productName (iproduct) {
                if (iproduct == undefined) return "All Products";
                if (iproduct == 1) return "Losses";
                if (iproduct == 0) return "Electricity";
                var thisProduct = shortname[productData[iproduct-2].product];
                for (var i = 0; i < menuProductNames.length; i++) {
                    if (shortname [menuProductNames[i]] == thisProduct) return menuProductNames[i];
                }
            }

            /* Selects product iproduct in the product menu */
            function selectMenuProduct (iproduct) {
                var pname = productName (iproduct);
                productInterface.select (pname);
                if(pname == "Losses")
                {
                    pname = "Heat, Waste & Losses";
                }
                context.source = pname;
                energy.updateAbstract(TL(country),period,TL(pname));          
            }

            productInterface.onChange = function(){
                var product = productInterface.selectedData()[0];
                if(product == "Losses")
                {
                    context.source = "Heat, Waste & Losses";
                }
                else
                {
                    context.source = "Product";
                }
                energy.updateAbstract(TL(country),period,TL(context.source));            
                if (product == "Electricity") {
                    highlightProduct(0);
                    return;
                }
                if (product == "Losses") {
                    highlightProduct(1);
                    return;
                }
                for (var i = 0; i < productData.length; i++) {
                    if (shortname [productData[i].product] == shortname[product]) {
                        highlightProduct(i+2);
                        return;
                    }
                }
                highlightProduct();
            }

            productInterface.onChange();
        });
    }

    /* Set the  menu change functions */
    countryInterface.onChange = function () {
        var country = countryInterface.selectedData()[0];
        filterPeriods (country);
        load ();
    }

    periodInterface.onChange = load;

    /* Filter the periods of the default country */
    filterPeriods(country);
  
    /* Load the first country/period */
    load ();

}

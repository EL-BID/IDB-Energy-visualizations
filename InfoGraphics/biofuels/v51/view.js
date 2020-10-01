function visualization () {


    
    // Variables for the various labels
    var waste = 'Waste';
    var gases = 'Biogases';
    var firewood = "Firewood";
    var awaste =  "Animal waste";
    var vwaste = "Vegetal waste";
    var bagasse =  "Bagasse";
    var charcoal = "Charcoal";
    var othersolid = "Other solid biofuels"; 
    var biogasoline = "Biogasoline";
    var biodiesel =  "Biodiesel";
    var total = 'Total';
    var industry = 'Industry';
    var transport = 'Transport';
    var other = 'Other';
    var residential = 'Residential';
    var commercial = 'Commercial';
    var supply = 'Supply';
    var production = 'Production';
    var imports = 'Imports';
    var exports = 'Exports';
    var consumption = 'Consumption';
    var generation = 'Generation';
    var others = 'Others';

    // Returns a css class name for a given label
    var className = function (label) {
        return label.replace(/ /g, "_");
    };

    // Names of product classes
    var prodClasses = [className(waste), className(gases), className(firewood), className(awaste), className(vwaste), 
                       className(charcoal), className(bagasse), className(othersolid), className(biogasoline), className(biodiesel)];

    // The path data for the small triangle used to denote import/export
    var triangleSize = 5;
    var trianglePath = 
        "M" + (Math.cos(0)*triangleSize) + "," + (Math.sin(0)*triangleSize) +
        "L" + (Math.cos(Math.PI*2/3)*triangleSize) + "," + (Math.sin(Math.PI*2/3)*triangleSize) +
        "L" + (Math.cos(Math.PI*4/3)*triangleSize) + "," + (Math.sin(Math.PI*4/3)*triangleSize) +
        "z";

    // Generates the svg path data for a callout balloon with size
    // and position given by box, with an arrow protruding down 
    // from the middle. The box is initially expanded by margin. 
    // r is the radius size for the rounded corners.
    // dx is the arrow thickness and dy is the downward size of the arrow.
    function balloonSvgPath (box, margin, r, dx, dy) {
        var x = box.x - margin*2;
        var y = box.y - margin;
        var w = box.width + margin*4;
        var h = box.height + margin*2;
        var cx = x+w/2.0;
        var cy = y+h;
        return "M "+ (cx - dx/2.0) + "," + cy + 
               " L "+ (x + r) + "," + cy +
               " a "+ r + " " + r + " 0 0 1 " + (-r) + " " + (-r) +
               " l "+ 0 + " " + (-h + r + r) +
               " a "+ r + " " + r + " 0 0 1 " + (+r) + " " + (-r) +
               " l "+ (w - r - r) + " " + 0 +
               " a "+ r + " " + r + " 0 0 1 " + (+r) + " " + (+r) +
               " l "+ 0 + " " + (h - r - r) +
               " a "+ r + " " + r + " 0 0 1 " + (-r) + " " + (+r) +
               " L "+ (cx + dx/2.0) + "," + cy + 
               " l "+ (-dx/2) + " " + dy + "z";
    }

    // Builds menus and other interface elements
    var countryInterface, periodTypeInterface;
    function buildInterface (countries,years) {

        // Remove the average timeline
        idb.period.periodType.active = false;
        idb.period.dropDownHeight -= idb.period.periodType.size[1];
        idb.period.timeline.position[1] -= idb.period.periodType.size[1];
        idb.period.play.position[1] -= idb.period.periodType.size[1];

        var interfaces = idb.menuBar (theSVG, theVIS, [idb.country, idb.bioproduct, idb.period]);

        countryInterface = interfaces[0];
        periodTypeInterface = interfaces[2];
        productInterface = interfaces[1];

        /* Set active countries */ 
        countryInterface.active(countries);

        /* Set default country */
        countryInterface.select([defaultCountry]);

        /* Set active periods */
        var periods = [];
        for (var i = 0; i < years.length; i++) {
          periods.push(years[i]+"");
        }
        periodTypeInterface.active(periods);

        /* Set default year */
        periodTypeInterface.select([defaultPeriod]);

        /* Set default product */
        productInterface.select(defaultProduct);

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
            i = maxchars;
            while (i+1< txt.length && txt[i] != " ") i++;
            lines.push (txt.substr(0,i));
            txt = txt.substr(i+1);
          }
        }
        lines.push(txt);
        return lines;
    }


    // Given an array of objects, return an array of distinct values of a field
    function getDistinct (array, field) {
        var distinct = [];
        for (var i = 0; i < array.length; i++) {
            d = array[i];
            if (d[field] != undefined) {
                v = d[field];
                if (distinct.indexOf(v) == -1) distinct.push(v);
            }
        }
        return distinct;
    }

    // Draws the chart
    function chart (svg, data) {
        var s = sankey()
            .width(width)
            .height(height)
            .vratio(0.4)
            .blockwidth(70)
            .data(data);
        s.computeLayout();

        // The energy value formatter
        var energyFmt = function (x) {
            // var r = d3.format(".1f")(x);
            // return r;
            return x.energyFormat();
        }

        // Erase eventual earlier elements
        svg.selectAll ("rect,text,path,g").remove();

        /* Add the units legend */
        theVIS.append("text")
            .attr("class", "UnitLegend")
            .attr("x", 20)
            .attr("y", 10)
            .text (TL("All figures in kBOE/day"))
        ;

        // Function to select/deselect product
        var selectedClass = "";
        var selectProdCallback = function () {
            var sel = d3.select(this);
            var selClasses = sel.attr("class").split(" ");
            var thisClass = (selClasses.length == 0) ? "" : selClasses[selClasses.length-1];
            if (prodClasses.indexOf(thisClass) < 0 || selectedClass == thisClass) thisClass = "";

            selectProdClass(thisClass);

            var activeProds = productInterface.active();
            for (var i = 0; i < activeProds.length; i++) {
                var a = activeProds[i];
                if (className(a) == thisClass) {
                    productInterface.select(a);
                    return;
                }
            }
            productInterface.select("All Sources");

        }
        var selectProdClass = function (prodClass) {
            if (selectedClass != "") {
                d3.selectAll(".linkGroup.selected").classed("selected", false);  
                d3.selectAll("g.block.selected").classed("selected",false);
                selectedClass = "";
            }
            if (prodClass != "") {
                selectedClass = prodClass;
                d3.selectAll(".linkGroup."+selectedClass).classed("selected", true);
                d3.select("g.block."+selectedClass).classed("selected", true);
            }
        }

        // Draw blocks
        svg.selectAll("g.block").data(s.layout.blocks).enter().append("g")
            .attr ("class", function(d) { return "block "+d.node.className })
            .on("mousedown", selectProdCallback)
            .each (function (d) {
                var sel = d3.select (this);
                sel.append("rect")
                    .attr({
                        width: d.width,
                        height: d.height,
                        x: d.x,
                        y: d.y,
                    });
                if (d.node.imports) {
                    var h = Math.max(s.layout.valueToHeight(d.node.imports),2);
                    sel.append("path")
                        .attr({
                            class: "importPath",
                            d: trianglePath,
                            transform: "translate("+(d.x-triangleSize)+","+(d.y+d.height-h/2)+")",
                        });
                    var y = d.y+d.height-h;
                    sel.append("line")
                        .attr ({
                            class: "importBlockLine",
                            x1:d.x,
                            x2:d.x+d.width,
                            y1:y,
                            y2:y,
                        });
                    var amt = sel.append("text").attr({
                        class : "MXText",
                        "text-anchor": "middle",
                        x : d.x+d.width/2,
                        y : d.y+d.height+10, 
                    });
                    amt.append("tspan").attr("class","legend").text("IMP.: ");
                    amt.append("tspan").attr("class","amount").text(energyFmt(d.node.imports));
                }
                if (d.node.exports) {
                    var h = Math.max(s.layout.valueToHeight(Math.abs(d.node.exports)),2);
                    sel.append("path")
                        .attr({
                            class: "exportPath",
                            d: trianglePath,
                            transform: "translate("+(d.x+d.width+triangleSize)+","+(d.y+h/2)+")",
                        });
                    var y = d.y+h;
                    sel.append("line")
                        .attr ({
                            class: "exportBlockLine",
                            x1:d.x,
                            x2:d.x+d.width,
                            y1:y,
                            y2:y,
                        });
                    var amt = sel.append("text").attr({
                        class : "MXText",
                        "text-anchor": "middle",
                        x : d.x+d.width/2,
                        y : d.y-4, 
                    });
                    amt.append("tspan").attr("class","legend").text("EXP.: ");
                    amt.append("tspan").attr("class","amount").text(energyFmt(-d.node.exports));

                }
                var amountText = energyFmt (d.value);
                if (d.node.total) {
                    amountText += " ("+energyFmt(d.value/d.node.total*100)+"%)";
                }
                var amount = sel.append ("text")
                    .attr ({
                        class: "blockAmount",                        
                    })
                    .text (amountText);
                var title = sel.append ("text").attr ("class", "blockTitle");
                var sep = 12;
                var lines = splitText (TL(d.node.title), 14);
                if (d.x <= width/4) {
                    amount.attr ({
                        x : d.x-sep,
                        y : d.y+d.height/2+sep*lines.length,
                        "text-anchor": "end"
                    })
                    title.attr({
                        "text-anchor": "end",
                        "transform" : "translate("+(d.x - sep)+","+(d.y + d.height/2 - sep*0.2)+")",
                    })
                }
                else if (d.x >= width * 0.7) {
                    amount.attr ({
                        x : d.x+d.width+sep,
                        y : d.y+d.height/2+sep*lines.length,
                        "text-anchor": "start"
                    })
                    title.attr({
                        "text-anchor": "start",
                        "transform" : "translate("+(d.x + d.width + sep)+","+(d.y + d.height/2- sep*0.2)+")",
                    })
                }
                else if (d.node.className == "Electricity" || d.node.className === "Others") {
                    amount.attr ({
                        x : d.x+d.width/2,
                        y : d.y-sep*0.5,
                        "text-anchor": "middle"
                    })
                    title.attr({
                        "text-anchor": "middle",
                        "transform" : "translate("+(d.x + d.width / 2)+","+(d.y-sep*2)+")",
                    })   
                }
                else {
                    amount.attr ({
                        x : d.x+d.width/2,
                        y : d.y+d.height/2,
                        "text-anchor": "middle"
                    })
                    var dy = (lines.length > 1) ? -2*sep : -sep;
                    title.attr({
                        "text-anchor": "middle",
                        "transform" : "translate (0,"+dy+ ") translate("+(d.x + d.width / 2)+","+(d.y)+")",
                    })   
                }
                title.selectAll("tspan").data (lines)
                .enter()
                .append ("tspan")
                .attr("x", 0)
                .attr("dy", function(d,i) { return i == 0 ? 0 : "1.1em" })
                .text(function (d) { return d });
            });
                
        // Adjust path smoothness
        smoothFactor = 0.9;


        // Draw paths and values
        svg.selectAll("g.pathGroup").data(s.layout.paths).enter().append("g")
            .attr("class", "pathGroup")
            .each (function (d) {

                var sel = d3.select(this);

                var offset = 0;

                // Draw all links of this path
                for (var ilink = 0; ilink < d.links.length; ilink++) {

                    var link = d.links [ilink];
                    var linkGroup = sel.append("g").attr("class", "linkGroup "+link.className);

                    var h = s.layout.valueToHeight (link.value);
                    //h = Math.max(h,1);

                    var ret = "";

                    for (var i = 1; i < d.vtx.length; i++) {
                        var x0 = d.vtx[i-1][0];
                        var y0 = d.vtx[i-1][1];
                        var x1 = d.vtx[i][0];
                        var y1 = d.vtx[i][1];
                        var path = offsetFlow(x0,y0,x1,y1,offset,h);
                        if (i>1) {
                            ret = stitchPathData (ret, path);
                        }
                        else {
                            ret = path;
                        }
                    }

                    offset += h;

                    linkGroup.append ("path")
                        .on("mousedown", selectProdCallback)
                        .attr({class: "path "+link.className, d: ret });
                    var center = pathCenter(ret);

                    var pathBalloon = linkGroup.append("path").attr("class","balloon");

                    var pathAmount = linkGroup.append ("text")
                        .attr ({
                            x : center[0], 
                            y : center[1]-12,
                            dy: "0.4em",
                            class: "pathAmount "+link.className,
                            "text-anchor": "middle"
                        })
                        .text(energyFmt(link.value));

                    var bbox = pathAmount[0][0].getBBox();

                    pathBalloon.attr({
                        d:balloonSvgPath(bbox,3,3,5,5),
                    })
                }

            });

        // Callback for products
        var productOnChange = function () {
            updateAbstract();
            var currProd = productInterface.selectedData()[0];
            if (currProd == "All Sources") {
                selectProdClass ("");
            }
            else {
                selectProdClass (className(currProd));
            }
        }

        //productInterface.active (products);
        productOnChange();

        productInterface.onChange = productOnChange;
    }

    //
    // Updates the abstract contents. Called whenever a menu changes
    //
    function updateAbstract () {
        energy.updateAbstract(
            TL(countryInterface.selectedData()[0]),
            TL(productInterface.selectedData()[0]),
            periodTypeInterface.selectedData()[0]);
    }

    // Reads the raw data from the csv file for the country and year selected
    // in the menus and creates the visualization
    function loadCountryYear() {

        updateAbstract();

        var country = countryInterface.selectedData()[0];
        var year = periodTypeInterface.selectedData()[0];

        var csvfile = DATA + "/"+country+" "+year+".csv";

        d3.csv (csvfile, function (error,csv) {

            // Prepare a dictionary for the data
            var dic = {};
            for (var i = 0; i < csv.length; i++) {
                var prod = csv[i].product, flow = csv[i].flow_sector, value = csv[i].value;
                dic[prod+flow] = parseFloat(value);
            }

            var data = {
                nodes : [],
                links : [],
            };

            // Build nodes
            var prodNodes = [waste,gases,firewood,awaste,vwaste,bagasse,charcoal,othersolid,biogasoline,biodiesel,total];
            prodNodes.forEach(function (prod) {
                var node = {
                    product: prod, 
                    flow: supply, 
                    title: prod == total ? "Total Supply" : prod,
                    className: className(prod),
                    value: dic[prod+supply]+(prod == total ? 0 :Math.abs(dic[prod+exports])), 
                    imports: prod != total ? dic[prod+imports] : 0.0, 
                    exports: prod != total ? dic[prod+exports] : 0.0,
                }
                if (prod != total) node.total = dic[total+supply];
                if (node.value > 0) data.nodes.push(node);
            });

            var sectorNodes = [industry,transport,other,residential,commercial,consumption];
            sectorNodes.forEach(function (flow) {
                var node = {
                    product: total, 
                    flow: flow, 
                    className: className(flow),
                    title: flow == consumption ? "Final Consumption" : flow,
                    value: dic[total+flow]
                }
                if (flow == consumption) node.column = 3; // Kludge to shift Total Consumption block to the right
                if (flow != consumption) node.total = dic[total+consumption];
                if (node.value > 0) data.nodes.push(node);
            });

            if (dic[total+generation] != 0) {
                data.nodes.push ({
                    product: total, 
                    flow: generation,
                    className: "Electricity", 
                    title: "Electricity",
                    value: Math.abs(dic[total+generation])
                });
            }

            if (dic[total+others] != 0) {
                data.nodes.push ({
                    product: total, 
                    flow: others,
                    className: "Others", 
                    title: "Other Uses",
                    value: Math.abs(dic[total+others])
                });
            }

            // Build links
            var findNode = function (prod,flow) {
                for (var i = 0; i < data.nodes.length; i++) {
                    var node = data.nodes[i];
                    if (node.product == prod && node.flow == flow) return i;
                }
                return -1;
            };

            var supplyLinks = [waste,gases,firewood,awaste,vwaste,bagasse,charcoal,othersolid,biogasoline,biodiesel];
            supplyLinks.forEach(function (prod) {
                var link = {
                    source: findNode(prod,supply),
                    target: findNode(total,supply),
                    value: dic[prod+supply],
                    className: className(prod),
                };
                if (link.source >= 0 && link.value > 0) data.links.push (link);
            });

            var consumptionSectors = [industry,transport,other,residential,commercial];
            supplyLinks.forEach(function (prod) {
                consumptionSectors.forEach(function (flow) {
                    var link = {
                        source: findNode(total,consumption),
                        target: findNode(total,flow),
                        value: dic[prod+flow],
                        className: className(prod)
                    };
                    if (link.source >= 0 && link.target >= 0 && link.value > 0) {
                        data.links.push (link);
                    }
                });
                var link = {
                    source: findNode(total,supply),
                    target: findNode(total,consumption),
                    value: dic[prod+consumption],
                    className: className (prod)
                };
                if (link.value > 0) data.links.push (link);
            });

            supplyLinks.forEach(function(prod) {
                var link = {
                    source: findNode(total,supply),
                    target: findNode(total,generation),
                    value: Math.abs(dic[prod+generation]),
                    className: className (prod)
                };
                console.assert(link.target>=0, link);
                if (link.value > 0) data.links.push (link);
            });

            supplyLinks.forEach(function(prod) {
                var link = {
                    source: findNode(total,supply),
                    target: findNode(total,others),
                    value: Math.abs(dic[prod+others]),
                    className: className (prod)
                };
                if (link.value > 0) data.links.push (link);
            });

            // var newGroup = theVIS.append("g")
            //     .attr({transform:"translate(30,0)"});
            // width-=60;
            // theVIS = newGroup;
            chart(theVIS,data);

        });
    }

    // Read the directory of countries and years and starts the visualization
    d3.csv (DATA+"/countryyear.csv", function (error, csv) {

        var countries = getDistinct(csv,"country");
        var years = getDistinct(csv,"year");
        buildInterface(countries,years);

        // Attach the menu callbacks
        countryInterface.onChange = loadCountryYear;
        periodTypeInterface.onChange = loadCountryYear;

        var newGroup = theVIS.append("g")
                .attr({transform:"translate(30,0)"});
        width-=60;
        theVIS = newGroup;

        loadCountryYear();
            
    });
}
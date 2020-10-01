//
// A Sankey diagram for the IDB Energy flow database
//
// Requires:
// d3.js
// flowpath.js
// shortnames.js
// flowjsonutil.js
//

//
// These are geometry parameters for the layout
//

var width = 930; // width of the svg canvas
var height = 362; // Height of the svg canvas
var blockWidth = 69; // Width of an energyBlock
var maxBlockHeight = 180; // Maximum height of a block
var leftMargin = 97; // empty space to the left of leftmost box
var rightMargin = 90; // empty space to the right of rightmost box
var topMargin = 35; // Empty space at top of drawing
var bottomMargin = 0;  // Empty space at bottom of drawing
var blockSep = 25; // Minimum vertical separation between blocks in pixels
var minBlockHeight = 2; // Minimum height of a block
var minPathThickness = 1; // Minimum path thickness
var maxPathThickness = 80; // Maximum path thickness
var amtToY = 1.0; // Scales amounts to give y units
var importExportGap = 1.5; // Separation between the import/export and main rectangles
var triangleSize = 5; // Radius of circle enclosing the triangle shape used for imports/exports 
var opacityNodeDeselected = 0.6; // Opacity of the other blocks when a given node block is selected
var opacityFlowSelected = 0.7;  // Opacity of the flow lines leaving a block when this block is selected
var opacityFlowDeselected = 0.1; // Opacity of the other flow lines when a given block is selected
var opacityFlowNormal = 0.25; // Opacity of a regular flow line

// Claudio: THese were modified / added for Barbara
var textSepTop = 10; // Separation between the text label of a block placed on top of a block rectangle  
var textSepLeft = 22; // Separation between the text label of a block placed to the left of a block rectangle  
var textSepRight = 7; // Separation between the text label of a block placed to the right of a block rectangle 
var triangleTextSepBottom = 12; // Separation between a text label and a triangle pointing down
var triangleTextSepLeft = 1; // Separation between a text label and a triangle placed to the left of the block
var triangleTextSepRight = 2; // Separation between a text label and a triangle placed to the right of the block
var blockLabelYDisplace = -14; // How much to displace the block label in the Y direction when block is selected 
var colorFlowDeselected = "gray"; // Color of non selected flow lines when a given block is selected
var blocksWithAmountLegends = ['Consumption', 'Primary', 'Residential', 'Transport',
            'Industry', 'Commercial', 'Other']; // Only blocks with these classnames will have amount legends
var consumedLegendOffset = 8; // How much to offset the amount legend and the text legend for consumed blocks
var flowLabelMargin = 3; // Number of pixels around the flow label balloon help text
var flowLabelRadius = 0; // Radius of the flow label balloon rounded corner
var flowLabelDx = 7; // Thickness of the triangular arrow protruding from the flow label balloon 
var flowLabelDy = 4; // Height of the triangular arrow protruding from the flow label balloon 


// The path data for the small triangle used to denote import/export
var trianglePath = 
    "M" + (Math.cos(0)*triangleSize) + "," + (Math.sin(0)*triangleSize) +
    "L" + (Math.cos(Math.PI*2/3)*triangleSize) + "," + (Math.sin(Math.PI*2/3)*triangleSize) +
    "L" + (Math.cos(Math.PI*4/3)*triangleSize) + "," + (Math.sin(Math.PI*4/3)*triangleSize) +
    "z";

// Format functions for numbers
var wholeNumberFormat = d3.format("0,000");
var fracNumberFormat = d3.format("0.00");
var numberFormat = function(n) {
    if (Math.abs(n) < 1) return fracNumberFormat(n.toFixed(2));
    return wholeNumberFormat(n.toFixed(0));
}

// Controls the amount of arcs used for drawing paths: 1 is max and 0 is minimal
smoothFactor = 0.7;
// The layout is an array of columns, where each column is an array of blocks
var layout = []; 

// Constructor for an energy block object
var Block = function (amt,imp,exp,waste,text,className) {
    var obj = {};
    obj.mainAmt = amt || 0;
    obj.importAmt = imp || 0;
    obj.exportAmt = exp || 0;
    obj.wasteAmt = waste || 0;
    obj.text = TL(text) || "";
    obj.className = className || "Block";
    obj.x = 0;
    obj.y = 0;
    obj.width = blockWidth;
    obj.height = 20;
    obj.inHeight = 0;
    obj.outHeight = 0;

    // Total amount of energy of this block
    obj.totalAmt = function () { 
        return obj.mainAmt + obj.importAmt; 
    }

    // Supply represented by this block
    obj.supply = function () {
        return obj.totalAmt() - obj.exportAmt - obj.wasteAmt;
    }

    // Changes the geometric properties of the block
    obj.geometry = function (x, y, width, height) {
        obj.x = x || obj.x;
        obj.y = y || obj.y;
        obj.width = width || obj.width;
        obj.height = height || obj.height;
    }

    // Adjust the height of the blocks so that they necessarily 
    // have enough room for the incoming and outgoing paths
    obj.adjustHeight = function() {
        if (obj.height < minBlockHeight) obj.height = minBlockHeight;
        // Make sure the height accomodates incoming and outgoing paths
        var minHeight1 = obj.exportAmt*amtToY + obj.outHeight;
        var minHeight2 = obj.inHeight + obj.importAmt*amtToY;
        var minHeight = minHeight1 < minHeight2 ? minHeight2 : minHeight1;
        if (obj.height < minHeight) obj.height = minHeight;
    }

    // Top edge endpoint where flow incoming from the left should enter the block
    obj.flowLeftEdge = function () { 
        var ret = { 
            x: 0, 
            y: obj.exportY(),
        }; 
        if (obj.exportHeight() == 0) ret.y = obj.mainY();
        return ret;
    }

    // Top edge endpoint where flow outgoing to the right should leave the block 
    obj.flowRightEdge = function () { 
        return { 
            x: obj.width, 
            y: obj.mainAmt == 0 ? obj.importY() : obj.mainY(),
        }; 
    }

    // Where the anchor for the legend should be placed
    obj.textAnchor = function () {
        if (obj.x + obj.width/2 < width / 4) return "end";
        if (obj.x + obj.width/2 > width * 0.75) return "start";
        return "middle";
    }

    // X coordinate of the text legend
    obj.textX = function () {
        if (obj.textAnchor() == "end") return - textSepLeft;
        if (obj.textAnchor() == "start") return obj.width + textSepRight;
        return obj.width/2;
    }

    // Y displacement w.r.t. the text legend anchor
    obj.textDy = function () {
        if (obj.textAnchor() != "middle") return 5;
        return 0;
    }

    // Y coordinate of the text legend
    obj.textY = function () {
        if (obj.textAnchor() == "middle") return -textSepTop;
        if (obj.textAnchor() == "start") return obj.height/2-consumedLegendOffset;
        return obj.height/2
    }

    //
    // Functions for the total amount legend
    // 
    // Where the anchor for amount legend should be placed
    obj.amountAnchor = function () {
        if (obj.textAnchor() == "start") return "start";
        return "middle";
    }

    // X coordinate of the amount legend
    obj.amountX = function () {
        if (obj.textAnchor() == "start") return obj.textX();
        return obj.width/2;
    }

    // Y coordinate of the amount legend
    obj.amountY = function () {
        if (obj.textAnchor() == "start") return obj.textY()+2*consumedLegendOffset;
        return obj.height/2;
    }

    // Y displacement w.r.t. the amount legend anchor
    obj.amountDy = function () {
        return "0.4em";
    }

    // String representing the energy amount
    obj.amountText = function () {
        if (/*obj.height>12*/ blocksWithAmountLegends.indexOf(className)>=0)
            return numberFormat(obj.totalAmt());
        return "";
    }

    //
    // Functions for the produced amount legend
    // 
    // Where the anchor for amount legend should be placed
    obj.producedAmountAnchor = function () {
        return "middle";
    }

    // X coordinate of the amount legend
    obj.producedAmountX = function () {
        return obj.width/2;
    }

    // Y coordinate of the amount legend
    obj.producedAmountY = function () {
        //return 0;
        return "-6";
    }

    // Y displacement w.r.t. the amount legend anchor
    obj.producedAmountDy = function () {
        //return "-0.5em";
        return "0";
    }

    // String representing the energy amount
    obj.producedAmountText = function () {
        return numberFormat(obj.mainAmt);
    }

    //
    // Functions for the exported amount legend
    // 
    // Where the anchor for amount legend should be placed
    obj.exportAmountAnchor = function () {
        return "start";
    }

    // X coordinate of the amount legend
    obj.exportAmountX = function () {
        var pos = obj.exportTrianglePosition();
        return pos.x+triangleSize+triangleTextSepRight;
    }

    // Y coordinate of the amount legend
    obj.exportAmountY = function () {
        var pos = obj.exportTrianglePosition();
        return pos.y+2;
    }

    // Y displacement w.r.t. the amount legend anchor
    obj.exportAmountDy = function () {
        //return "0.2em";
        return "0";
    }

    // String representing the energy amount
    obj.exportAmountText = function () {
        return numberFormat(obj.exportAmt);
//         if (obj.exportAmt < 1 && obj.exportAmt > 0)
//            return obj.exportAmt.toFixed(2);
//        return obj.exportAmt.toFixed(0);
    }

    //
    // Functions for the imported amount legend
    // 
    // Where the anchor for amount legend should be placed
    obj.importAmountAnchor = function () {
        return "end";
    }

    // X coordinate of the amount legend
    obj.importAmountX = function () {
        var pos = obj.importTrianglePosition();
        return pos.x - triangleSize - triangleTextSepLeft;
    }

    // Y coordinate of the amount legend
    obj.importAmountY = function () {
        var pos = obj.importTrianglePosition();
        return pos.y+3;
    }

    // Y displacement w.r.t. the amount legend anchor
    obj.importAmountDy = function () {
        //return 3;
        return "0";
    }

    // String representing the energy amount
    obj.importAmountText = function () {
        return numberFormat(obj.importAmt);
        // if (obj.importAmt < 1 && obj.importAmt > 0)
        //     return obj.importAmt.toFixed(2);
        // return obj.importAmt.toFixed(0);

    }

    //
    // Functions for the waste amount legend
    // 
    // Where the anchor for amount legend should be placed
    obj.wasteAmountAnchor = function () {
        return "middle";
    }

    // X coordinate of the amount legend
    obj.wasteAmountX = function () {
        var pos = obj.wasteTrianglePosition();
        return pos.x;
    }

    // Y coordinate of the amount legend
    obj.wasteAmountY = function () {
        var pos = obj.wasteTrianglePosition();
        return pos.y+triangleSize+triangleTextSepBottom;
    }

    // Y displacement w.r.t. the amount legend anchor
    obj.wasteAmountDy = function () {
        return 0;
    }

    // String representing the energy amount
    obj.wasteAmountText = function () {
        return numberFormat(obj.wasteAmt);
        // if (obj.wasteAmt < 1 && obj.wasteAmt > 0)
        //     return obj.wasteAmt.toFixed(2);
        // return obj.wasteAmt.toFixed(0);

    }

    //
    // Properties of the rectangles
    //

    // Vertical size of the import rectangle
    obj.importHeight = function () { 
        var h = (obj.height) * obj.importAmt / obj.totalAmt();
        if (h > 0 && h < 1) return 1;
        return h;
    }

    // Vertical size of the main block rectangle
    obj.mainHeight = function () { 
        var h =  (obj.height) * (1 - (obj.importAmt+obj.exportAmt+obj.wasteAmt) / obj.totalAmt());
        if (h > 0 && h < 1) return 1;
        if (obj.importAmt > 0) h -= importExportGap;
        //if (obj.exportAmt > 0) h -= importExportGap;
        if (obj.wasteAmt > 0) h -= importExportGap;
        if (h < 0) return 0;
        return h;
    }

    // Vertical size of the export rectangle
    obj.exportHeight = function () {
        var h = (obj.height) * obj.exportAmt / obj.totalAmt();  
        if (h > 0 && h < 1) return 1;
        return h; 
    }

     // Vertical size of the waste rectangle
    obj.wasteHeight = function () {
        var h = (obj.height) * obj.wasteAmt / obj.totalAmt();  
        if (h > 0 && h < 1) return 1;
        return h; 
    }

    // Y position of the export rectangle
    obj.exportY = function () { 
        return -importExportGap;
    }

    // Y position of the main rectangle
    obj.mainY = function () { 
        return obj.exportHeight();
    }

    // Y position of the import rectangle
    obj.importY = function () {
        return importExportGap + obj.exportHeight() + obj.mainHeight(); 
    }

    // Y position of the waste rectangle
    obj.wasteY = function () {
        var y = obj.importY();
        if (obj.importAmt == 0) return y;
        return y + importExportGap + obj.importHeight();
    }

    // Position the triangle decoration of the import rect
    obj.importTrianglePosition = function () {
        return {x: (-triangleSize-importExportGap), 
                y: (obj.importY() +obj.importHeight() / 2)};
    }

    // A translation to be applied to the triangle decoration of the import rect
    obj.importTriangleTransform = function () {
        var pos = obj.importTrianglePosition();
        return "translate ("+pos.x+","+pos.y+")";
    }

    // Position triangle decoration of the export rect
    obj.exportTrianglePosition = function () {
        if (obj.exportHeight() < triangleSize) 
            return {x: (triangleSize+importExportGap*0.5+obj.width),
                    y: (obj.mainY()- importExportGap - triangleSize)};
        else
            return {x: (triangleSize+importExportGap*0.5+obj.width), 
                    y: (obj.exportY() + triangleSize) };
    }

    // A translation to be applied to the triangle decoration of the export rect
    obj.exportTriangleTransform = function () {
        var pos = obj.exportTrianglePosition();
        return "translate ("+pos.x+","+pos.y+")";
    }

    // Position the triangle decoration of the waste rect
    obj.wasteTrianglePosition = function () {
        return {x: (obj.width/2),
                y: (obj.wasteY() + obj.wasteHeight() + importExportGap)}
    }

    // A transformation to be applied to the triangle decoration of the waste rect
    obj.wasteTriangleTransform = function () {
        return "translate ("+ (obj.width/2)+","+ 
                              (obj.wasteY() + obj.wasteHeight() + importExportGap)+")" +
               "rotate (-30)";
    }

    // Path geometry of the triangle decoration of the import rectangle
    obj.importTrianglePath = function () {
        if (obj.importAmt == 0) return "M 0,0";
        return trianglePath;
    }


    // Path geometry of the triangle decoration of the export rectangle
    obj.exportTrianglePath = function () {
        if (obj.exportAmt == 0) return "M 0,0";
        return trianglePath;
    }

    // Path geometry of the triangle decoration of the waste rectangle
    obj.wasteTrianglePath = function () {
        if (obj.wasteAmt == 0) return "M 0,0";
        return trianglePath;
    }
    
    return obj;
} 

// An empty block is a block which serves only as a layout helper. It takes space
// on the layout but is not rendered. It can also be used as a passthrough 
// hole where flow paths can span through two non-consecutive columns
function EmptyBlock (amt) {
    var obj = Block (amt);
    obj.className = "EmptyBlock";

    // Changes the geometric properties of the block
    obj.geometry = function (x, y, width, height) {
        obj.x = x+width/2;
        obj.y = y;
        obj.width = 0;
        obj.height = height;
    }

    // String representing the energy amounts: null string for empty blocks
    obj.amountText = obj.producedAmountText = function () {
        return "";
    }

    return obj;
}

// Creates the svg drawing of a block. Sel is the svg group 
// where the drawing elements are placed
function blockSvg (sel) {
    // Transform the group
    sel.attr ("transform", function (d) { return "translate ("+d.x+","+d.y+")" } )
        .attr ("class", function(d) { return d.className; });
    // The import rectangle
    sel.append("rect")
        .attr ("y", function (d) { return d.importY(); }) 
        .attr ("width", function (d) { return d.width; }) 
        .attr ("height", function (d) { return d.importHeight(); });
    // The import triangle decoration
    sel.append ("path")
        .attr ("transform", function (d) { return d.importTriangleTransform(); }) 
        .attr ("d", function (d) { return d.importTrianglePath(); });
    // Thel little "M"
    sel.append ("text")
        .attr ("class", "TriangleLegend")
        .attr ("x", function (d) { return d.importAmountX(); } )
        .attr ("y", function (d) { return d.importAmountY(); } )
        .attr ("dy", function (d) { return d.importAmountDy(); } )
        .style ("text-anchor", function (d) { return d.importAmountAnchor(); })
        .text (function (d) { return d.importAmt > 0 ? "M" : ""} );


    // The waste/losses rectangle: Use a path with a rectangle and an attached triangle
    sel.append ("path")
        .attr ("d", function (d) {
            var h = d.wasteHeight();
            if (h == 0) return "M 0 0"; 
            return balloonSvgPath ({ 
                x: 0,
                y: d.wasteY(),
                width: d.width,
                height: h
            },
            0, 
            0,
            triangleSize*2, triangleSize*1.7
            )
        });
    sel.append ("path")
        .attr ("d", function (d) {
            var h = d.wasteHeight();
            if (h == 0) return "M 0 0"; 
            return balloonSvgPath ({ 
                x: 0,
                y: d.wasteY(),
                width: d.width,
                height: h
            },
            0, 
            0,
            triangleSize*2, triangleSize*1.7
            )
        })
        .attr ("fill", "url(#diagonalHatch)");

    // The little "W" legend, or rather, the "L" (losses)
    sel.append ("text")
        .attr ("class", "TriangleLegend")
        .attr ("x", function (d) { return d.wasteAmountX(); } )
        .attr ("y", function (d) { return d.wasteAmountY(); } )
        .attr ("dy", function (d) { return d.wasteAmountDy()-3; } )
        .style ("text-anchor", function (d) { return d.wasteAmountAnchor(); })
        .text (function (d) { return d.wasteAmt > 0 ? TL("L") : ""} );

    // The main rectangle
    sel.append("rect")
        .attr ("y", function (d) { return d.mainY(); }) 
        .attr ("width", function (d) { return d.width; }) 
        .attr ("height", function (d) { return d.mainHeight(); });
    // The export rectangle
    sel.append("rect")
        .attr ("y", function (d) { return d.exportY(); }) 
        .attr ("width", function (d) { return d.width; }) 
        .attr ("height", function (d) { return d.exportHeight(); });  
    // The export rectangle decoration
    sel.append ("path")
        .attr ("transform", function (d) { return d.exportTriangleTransform(); }) 
        .attr ("d", function (d) { return d.exportTrianglePath(); });

    // The little "X" legend
    sel.append ("text")
        .attr ("class", "TriangleLegend")
        .attr ("x", function (d) { return d.exportAmountX(); } )
        .attr ("y", function (d) { return d.exportAmountY(); } )
        .attr ("dy", function (d) { return d.exportAmountDy(); } )
        .style ("text-anchor", function (d) { return d.exportAmountAnchor(); })
        .text (function (d) { return d.exportAmt > 0 ? "X" : ""} );

    // The block (total) amount 
    sel.append ("text")
        .attr ("class", "BlockAmount")
        .attr ("x", function (d) { return d.amountX(); } )
        .attr ("y", function (d) { return d.amountY(); } )
        .attr ("dy", function (d) { return d.amountDy(); } )
        .style ("text-anchor", function (d) { return d.amountAnchor(); })
        .text (function (d) { return d.amountText (); } );

    // The block (produced)  amount
    var prodtext = sel.append ("text")
        .attr ("class", "SelectedBlockAmount")
        .attr ("x", function (d) { return d.producedAmountX(); } )
        .attr ("y", function (d) { return d.producedAmountY(); } )
        .attr ("dy", function (d) { return d.producedAmountDy(); } )
        .attr ("opacity", 0)
        .style ("text-anchor", function (d) { return d.producedAmountAnchor(); });

    prodtext.append("svg:tspan").style("font-size", "60%").text(TL("PROD.")+" ");
    prodtext.append("svg:tspan").text (function (d) { return d.producedAmountText (); } );

    // The block (import)  amount
    var imptext = sel.append ("text")
        .attr ("class", "SelectedBlockAmount")
        .attr ("x", function (d) { return d.importAmountX(); } )
        .attr ("y", function (d) { return d.importAmountY(); } )
        .attr ("dy", function (d) { return d.importAmountDy(); } )
        .attr ("opacity", 0)
        .style ("text-anchor", function (d) { return d.importAmountAnchor(); });

    imptext.append("svg:tspan")
        .style("font-size", "60%")
        .text(function (d) { return d.importAmt > 0 ? TL("IMP.")+" " : ""});
    imptext.append("svg:tspan")
        .text (function (d) { return d.importAmt > 0 ? d.importAmountText () : ""; } );

    // The block (export)  amount
    var exptext = sel.append ("text")
        .attr ("class", "SelectedBlockAmount")
        .attr ("x", function (d) { return d.exportAmountX(); } )
        .attr ("y", function (d) { return d.exportAmountY(); } )
        .attr ("dy", function (d) { return d.exportAmountDy(); } )
        .attr ("opacity", 0)
        .style ("text-anchor", function (d) { return d.exportAmountAnchor(); });

    exptext.append("svg:tspan")
        .style("font-size", "60%")
        .text(function (d) { return d.exportAmt > 0 ? TL("EXP.")+" " : ""});
    exptext.append("svg:tspan")
        .text (function (d) { return d.exportAmt > 0 ? d.exportAmountText () : ""; } );

    // The block (waste) amount
    var wastetext = sel.append ("text")
        .attr ("class", "SelectedBlockAmount")
        .attr ("x", function (d) { return d.wasteAmountX(); } )
        .attr ("y", function (d) { return d.wasteAmountY(); } )
        .attr ("dy", function (d) { return d.wasteAmountDy(); } )
        .attr ("opacity", 0)
        .style ("text-anchor", function (d) { return d.wasteAmountAnchor(); });

    wastetext.append("svg:tspan")
        .style("font-size", "60%")
        .text(function (d) {return d.wasteAmt>0 ? TL("LOSSES")+" " : "" } );
    wastetext.append("svg:tspan")
        .text (function (d) { return d.wasteAmt>0 ? d.wasteAmountText () : "" } );


    // The block label (use 2 text boxes to support labels with 2 words)
    var label = sel.append("g")
        .attr ("class", "BlockLabelContainer");

    label.append ("text")
        .attr ("class", "BlockLabel")
        .attr ("x", function (d) { return d.textX(); })
        .attr ("y", function (d) { return d.textY(); })
        .attr ("dy", function (d) { 
            var s = d.text.split(" ");
            if (s.length > 1) return d.textDy()+6;
            return d.textDy(); 
        })
        .text (function (d) { var s = d.text.split(" ");
                              return s[s.length-1]; })
        .style ("text-anchor", function (d) { return d.textAnchor(); });
    label.append ("text")
        .attr ("class", "BlockLabel")
        .attr ("x", function (d) { return d.textX(); })
        .attr ("y", function (d) { return d.textY(); })
        .attr ("dy", function (d) { return d.textDy()-6; })
        .text (function (d) { var s = d.text.split(" ");
                              if (s.length>1) return s[0]; else return ""; })
        .style ("text-anchor", function (d) { return d.textAnchor(); });

}

// Implements a data structure to keep track of the total thickness of
// energy flow paths between each pair of blocks. This is necessary 
// so that several paths between the same pair of blocks can be 
// drawn nicely with parallel arcs
var pathReg = {

    // Where all pairs are stored
    pair: [],

    // Clears the data structure
    clear: function () {
        pathReg.pair = [];
    },

    // Finds a pair and returns its index or -1 if not found
    find: function (a, b) {
        for (var i = 0; i < pathReg.pair.length; i++) {
            var obj = pathReg.pair [i];
            if (obj.from == a && obj.to == b) { return i }
        }
        return -1;
    },

    // Registers another amount between between a and b.
    // Returns the index in the list of amounts where the amt was registered.
    add: function (a, b, amt) {
        var i = pathReg.find(a,b);
        if (i == -1) {
            pathReg.pair.push ({from: a, to:b, amts: [amt]});
            return 0;
        }
        else {
            var lastAmt = pathReg.pair[i].amts[pathReg.pair[i].amts.length-1];
            pathReg.pair[i].amts.push (amt+lastAmt);
            return pathReg.pair[i].amts.length - 1;
        }
    },

    // Adjusts the amounts for the paths so as to ensure that paths have
    // at least minPathThickness pixels. Also informs the blocks of the
    // sizes of the total thickness of incoming and outgoing paths.
    // This function must be called
    // only when amtToY is known (i.e., after the computeLayout is called).
    adjustThickness : function () {
        var minAmt = minPathThickness / amtToY;
        var p = pathReg.pair;
        for (var ip in p) {
            var prevAmt = 0.0; // In the old array
            var lastAmt = 0.0; // In the new array
            
            for (var ia in p[ip].amts) {
                var thisAmt = p[ip].amts[ia];
                var amt = thisAmt - prevAmt;
                if (amt < minAmt) amt = minAmt;
                p[ip].amts[ia] = lastAmt+amt;
                lastAmt = lastAmt+amt;
                prevAmt = thisAmt;
            }
            p[ip].from.outHeight += lastAmt*amtToY;
            p[ip].to.inHeight += lastAmt*amtToY;
        }
    },

    // Returns the largest energy flow path between a pair of blocks
    maxFlowPathAmt: function () {
        var maxAmt = 0;
        var p = pathReg.pair;
        for (var ip in p) {
            var amt = p[ip].amts[p[ip].amts.length-1];
            if (amt > maxAmt) maxAmt = amt;
        }
        return maxAmt;
    },

    // Prints useful information about the paths of a block b
    debugBlock : function (b) {
        return;
        function sum(x) {
            s = 0;
            for (i in x) {
                s += x[i];
            }
            return s;
        };

        console.log (b.className);
        var p = pathReg.pair;
        var d = { input: [], output: [] };
        for (var ip in pathReg.pair) {
            var prevAmt = 0;
            for (var ia in p[ip].amts) {
                var thisAmt = p[ip].amts[ia];
                var amt = thisAmt - prevAmt;
                if (p[ip].from == b) d.output.push(amt);
                if (p[ip].to == b) d.input.push(amt);
                prevAmt = thisAmt;
            }
        }
        console.log ("import="+b.importAmt+" / "+b.importHeight());
        console.log ("export="+b.exportAmt+" / "+b.exportHeight());
        console.log ("produced="+b.mainAmt+" / "+b.mainHeight());
        console.log ("wasted="+b.wasteAmt+" / "+b.wasteHeight());
        console.log ("Input="+d.input+"="+sum(d.input));
        console.log ("Output="+d.output+"="+sum(d.output));
    },

    // Given two blocks a,b and i, the index of the flow amount registered
    // between them by add, returns an object with five fields: 'above' is 
    // the sum of all amounts leaving 'a' to other nodes above all paths to b; 
    // 'below' is the analog of 'above', but sums paths below all paths to b; 
    // 'total' is the sum of all amounts from a to b; 'before' is the 
    // sum of all amounts before i, and 'after' is the sum of all amounts
    // including i.
    rightPos : function (a, b, i) {
        var ret = { above: 0, below: 0, total: 0, before: 0, after: 0};
        for (var j = 0; j < pathReg.pair.length; j++) {
            var obj = pathReg.pair[j];
            if (obj.from == a) {
                if (obj.to == b) {
                    ret.total = obj.amts[obj.amts.length-1];
                    if (i == 0) {
                        ret.before = 0;
                    }
                    else {
                        ret.before = obj.amts[i-1];
                    }
                    ret.after = obj.amts[i];
                    break;
                }
                else {
                    ret.above += obj.amts[obj.amts.length-1];
                }
            }
        }
        for (++j; j < pathReg.pair.length; j++) {
            var obj = pathReg.pair[j];
            if (obj.from == a) { 
                ret.below += obj.amts[obj.amts.length-1];
            }
        }
        return ret;
    },

    // Similar to rightPos, but return values for the left (incoming in b)
    leftPos : function (a, b, i) {
        var ret = { above: 0, below: 0, total: 0, before: 0, after: 0};
        for (var j = 0; j < pathReg.pair.length; j++) {
            var obj = pathReg.pair[j];
            if (obj.to == b) {
                if (obj.from == a) {
                    ret.total = obj.amts[obj.amts.length-1];
                    if (i == 0) {
                        ret.before = 0;
                    }
                    else {
                        ret.before = obj.amts[i-1];
                    }
                    ret.after = obj.amts[i];
                    break;
                }
                else {
                    ret.above += obj.amts[obj.amts.length-1];
                }
            }
        }
        for (++j; j < pathReg.pair.length; j++) {
            var obj = pathReg.pair[j];
            if (obj.to == b) { 
                ret.below += obj.amts[obj.amts.length-1];
            }
        }
        return ret;
    },

    
}

// Represents a flow line linking two blocks with the given amount. 
// Additional stops along the way may be defined by specifyin passBlock1 and
// passBlock2 (optional arguments).
function FlowLine (blockFrom, blockTo, amt, className, passBlock1, passBlock2) {
    var obj = {};
    obj.blockFrom = blockFrom;
    obj.blockTo = blockTo;
    obj.amt = amt;
    if (passBlock1 == undefined) {
        obj.pathIdx = pathReg.add (blockFrom, blockTo, amt);
    } 
    else {
        obj.passBlock1 = passBlock1;
        obj.pathIdx = pathReg.add (blockFrom, passBlock1, amt); 
        if (passBlock2 == undefined) {
            obj.pathIdx1 = pathReg.add (passBlock1, blockTo, amt); 
        } 
        else {
            obj.passBlock2 = passBlock2;
            obj.pathIdx1 = pathReg.add (passBlock1, passBlock2, amt); 
            obj.pathIdx2 = pathReg.add (passBlock2, blockTo, amt); 
        }
    }
    obj.className = className || "Flow"; 

    // Returns the path geometry for a flow line between block *a* and block *b*
    // registered with index idx
    function computePath (a,b,idx) {
        var right = pathReg.rightPos (a, b, idx);
        var left = pathReg.leftPos (a, b, idx);
        var re = a.flowRightEdge();
        var le = b.flowLeftEdge();
        var x0 = a.x + re.x;
        var y0 = a.y + re.y;
        var x1 = b.x + le.x;
        var y1 = b.y + le.y ;
        var outgoing = right.above+right.total+right.below;
        var incoming = left.above+left.total+left.below;
        var longest = outgoing > incoming ? outgoing : incoming;
        var dyr0 = right.above+right.before;
        var dyr1 = right.above+right.after;
        var dyl0 = left.above+left.before;
        var dyl1 = left.above+left.after;
        var delta = (left.above-right.above)*amtToY;
        var higherDst = y0 - delta > y1;
        var args = [];
        // Test some exceptions to the flow path layout algorithm
        if (a.className == 'Oil_Products') { 
            // Don't try to separate the paths 
            args = [
                x0, y0 + dyr0*amtToY,
                x1, y1 + dyl0*amtToY,
                (dyr1-dyr0) * amtToY, 0, (dyr1-dyr0)*amtToY
            ];
        }
        // More flow outgoing from blockFrom or incoming to blockTo?
        else if (outgoing>incoming) 
            if (higherDst) {
                args =  [x0, y0,
                         x1, y1 + delta,
                         (right.above+right.total)*amtToY, 
                         (right.above+right.before)*amtToY, 
                         (right.above+right.after)*amtToY];
            }
            else {
                args =  [x0, y0 + right.above*amtToY,
                         x1, y1 + left.above*amtToY,
                         (right.total+right.below)*amtToY, 
                         (right.before)*amtToY, 
                         (right.after)*amtToY];
            }
        else
            if (!higherDst) {  
                args = [x0, y0 - delta,
                        x1, y1,
                        (left.above+left.total)*amtToY, 
                        (left.above+left.before)*amtToY, 
                        (left.above+left.after)*amtToY];
            } 
            else {
                args = [x0, y0 + right.above*amtToY,
                                        x1, y1 + left.above*amtToY,
                                        (left.total+left.below)*amtToY, 
                                        (left.before)*amtToY, 
                                        (left.after)*amtToY];
            } 
        // Make sure arcs are at least minMathThickness pixels wide
        if (args [6] - args [5] < minPathThickness) args[6] = args[5] + minPathThickness;

        return flowStrip (args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
    }


    // Computes the path for this flow line
    obj.path = function () {
        if (obj.passBlock1 == undefined) return computePath (obj.blockFrom, obj.blockTo, obj.pathIdx);
        if (obj.passBlock2 == undefined) {
            return stitchPathData (computePath (obj.blockFrom, obj.passBlock1, obj.pathIdx),
                                   computePath (obj.passBlock1, obj.blockTo, obj.pathIdx1));
        }
        return stitchPathData (computePath (obj.blockFrom, obj.passBlock1, obj.pathIdx),
                               stitchPathData(computePath (obj.passBlock1, obj.passBlock2, obj.pathIdx1),
                                              computePath (obj.passBlock2, obj.blockTo, obj.pathIdx2)));
    }

    // Returns the center point for path registered as idx going from block a to block b
    function computePathCenter (a, b, idx) {
        var right = pathReg.rightPos (a, b, idx);
        var left = pathReg.leftPos (a, b, idx);
        var re = a.flowRightEdge();
        var le = b.flowLeftEdge();
        var x0 = a.x + re.x;
        var y0 = a.y + re.y;
        var x1 = b.x + le.x;
        var y1 = b.y + le.y;
        var dyr0 = right.above+right.before;
        var dyr1 = right.above+right.after;
        var dyl0 = left.above+left.before;
        var r = (dyr1-dyr0) * amtToY;
        return { "x": (x0+x1)/2.0, "y": (y0 + dyr0*amtToY+y1+dyl0*amtToY+r) / 2 };
    }



    // Returns a position for a label annotation of this path 
    obj.labelPos = function () {
        if (obj.passBlock1 == undefined) 
            return computePathCenter (obj.blockFrom, obj.blockTo, obj.pathIdx);
        if (obj.passBlock2 == undefined) 
            return computePathCenter (obj.passBlock1, obj.blockTo, obj.pathIdx1);
        return computePathCenter (obj.passBlock1, obj.passBlock2, obj.pathIdx1);
    }

    // A proper amount to show as an annotation
    obj.labelText = function () {
        return numberFormat(obj.amt);
        // if (obj.amt < 1) return obj.amt.toFixed(2);
        // else return obj.amt.toFixed(0)
    }

    // The object
    return obj;
}

// Creates the svg drawing of a flow line. Sel is the svg group 
// where the drawing elements are placed
function flowLineSvg (sel) {
    sel.attr ("class", function (d) { return d.className })
        .append("path")
        .attr ("class", "FlowPath")
        .attr ("d", function (d) { return d.path (); })
}

// Generates the svg path data for a callout balloon with size
// and position given by box, with an arrow protruding down 
// from the middle. The box is initially expanded by margin. 
// r is the radius size for the rounded corners.
// dx is the arrow thickness and dy is the downward size of the arrow.
function balloonSvgPath (box, margin, r, dx, dy) {
    var x = box.x - margin;
    var y = box.y - margin;
    var w = box.width + margin*2;
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

// Adds an svg representation of an amount label for 
// sel, a selection of flow line paths.
function flowLineLabelSvg (sel) {
    // Add text elements for the labels
    var text = sel.append ("text")
        .attr ("class", "FlowLabel")
        .attr ("x", function (d) { return d.labelPos().x; })
        .attr ("y", function (d) { return d.labelPos().y-flowLabelDy-flowLabelMargin; })
        .style ("text-anchor", "middle")
        .text (function(d) { return d.labelText();});
    // Take note of their bounding boxes
    text.each(function (d) { 
        d.bbox = this.getBBox(); 
    });
    // ... and remove them. We need to redraw them later on top of the
    // callout boxes
    text.remove();
    // Draw the callout boxes
    var label = sel.append ("g")
        .attr ("class", "FlowLabelCallout")
    label.append ("path")
         .attr ("d", function (d) { 
            return balloonSvgPath (d.bbox, 
                flowLabelMargin, 
                flowLabelRadius, 
                flowLabelDx, 
                flowLabelDy); 
        });
// Drop shadow
//         .style ("-webkit-svg-shadow", "0 0 10px #777777");
    label.append ("text")
         .attr ("class", "FlowLabel")
         .attr ("x", function (d) { return d.labelPos().x; })
         .attr ("y", function (d) { return d.labelPos().y-flowLabelDy-flowLabelMargin; })
         .style ("text-anchor", "middle")
         .text (function(d) { return d.labelText();});
}


// Computes the geometric properties of the blocks.
// Argument relspace  is an array of numbers with the relative
// spacing between columns
function computeLayout (relspace) {

    var verticalSpace = height - bottomMargin - topMargin;
    var columnAmount = [];
    var columnSpace = [];
    var ncols = layout.length;
    relspace = relspace || [1.0];

    // Compute total amount of relative spacing between columns
    var totrelspace = 0.0;
    for (var i = 0; i < ncols-1; i++) {
        if (i >= relspace.length) relspace.push (1.0);
        totrelspace += relspace[i];
    }

    //
    // Compute amtToY 
    //
    // First guess uses the biggest block as a guide
    var maxAmt = 0;
    for (var i = 0; i < ncols; i++) {
        for (var j = 0; j < layout[i].length; j++) {
            var amt = layout[i][j].totalAmt();
            if (amt > maxAmt) maxAmt = amt;
        }
    }
    amtToY = maxBlockHeight / maxAmt;

    // Now make room for the busiest column
    for (var i = 0; i < ncols; i++) {
        columnAmount.push(0.0);
        columnSpace.push (verticalSpace - (layout[i].length-1)*blockSep);
        for (var j = 0; j < layout[i].length; j++) {
            columnAmount [i] += layout[i][j].totalAmt();
        }
        var colScale = columnSpace[i] * 1.0 / columnAmount [i];
        if (colScale < amtToY) amtToY = colScale; 
    }

    // Reduce estimate to make room for thick paths, if necessary
    var pathAmtToY = maxPathThickness / pathReg.maxFlowPathAmt();
    if (pathAmtToY < amtToY) amtToY = pathAmtToY;
    
    // Lay out the blocks in each column
    var horizontalSpace = width - leftMargin - rightMargin;
    var columnSep = 0.0;
    for (var i = 0; i < ncols; i++) {
        columnSep += i == 0 ? 0.0 : 
                       (horizontalSpace - ncols * blockWidth) * relspace [i-1] / totrelspace;
        var x = leftMargin + i*blockWidth + columnSep;
        var verticalSep = (verticalSpace - columnAmount[i]*amtToY) / (layout[i].length);
        var y = topMargin + verticalSep/2;
        for (var j = 0; j < layout[i].length; j++) {
            layout [i][j].geometry (x, y, blockWidth, layout[i][j].totalAmt() * amtToY);
            y += layout [i][j].height + verticalSep;
        }
    }
}

// Returns a flattened collection of all blocks
function allBlocks() {
    var ret = [];
    for (var i = 0; i < layout.length; i++) ret = ret.concat(layout[i]);
    return ret;
}

// Name of the selected product if any
var selectedProd = "";

// These two functions are redefined by IDBSankey
var selectProduct = function (prod) {};
var deSelectProduct = function () {};

// This function is called by the sankey whenever the selected product is changed
var onProductChange = function () {};

// Presents the energy data in 'data' as a Sankey Diagram on svg element 'svg'
function IDBSankey (svg, data) {

    // Move block with the given className by dx, dy
    // If dx and dy are not defined, move to its old position
    function moveBlock (className, dx, dy) {

        nodeGroup.select ("g."+className)
            .attr("transform", function (d) { 
                if (dx == undefined) {
                    d.x = d.oldPos[0];
                    d.y = d.oldPos[1];
                } 
                else {
                    d.oldPos = [d.x, d.y];
                    d.x += dx;
                    d.y += dy;
                }
                return "translate ("+d.x+","+d.y+")" 
            } );

        flowLineGroup.selectAll ("g."+className)
            .select ("path")
            .attr ("d", function (d) { return d.path(); });

    }

    // 
    // Called whenever an energy product is selected. Alters the drawing
    // to highlight the given product flow
    selectProduct = function (prod) {
        deSelectProduct();

        // Only energy product boxes are allowed
        var iProd = products.indexOf(prod);

        if (products.indexOf(prod)<0) return;
        nodeGroup.selectAll ("g")
            .attr ("opacity", opacityNodeDeselected);

        selectedProd = prod;
        onProductChange();

        flowLineGroup.selectAll ("path.FlowPath")
            .attr ("opacity", opacityFlowDeselected)
            .style ("fill", colorFlowDeselected);

        // Show individual amounts
        nodeGroup.select ("g ."+prod) 
            .attr ("opacity", 1);

        nodeGroup.selectAll ("g."+prod+ " .SelectedBlockAmount")
            .attr ("opacity", 1);

        nodeGroup.selectAll ("g."+prod+ " .TriangleLegend")
            .attr ("opacity", 0);

        nodeGroup.select ("g."+prod+ " .BlockLabelContainer")
            .attr ("opacity", 1)
            .attr ("transform", "translate(0,"+blockLabelYDisplace+")");

        // Highlight flowlines
        flowLineGroup.selectAll ("g."+prod+ " path.FlowPath")
            .attr ("opacity", opacityFlowSelected)
            .style ("fill", null); // Removes the fill style so that the css color will appear
        flowLineGroup.selectAll ("g ."+prod)
            .call (flowLineLabelSvg);

        // Move up/down products in the same column
        if (prod == "Electricity" || prod == "Oil_Products") return;

        for (var i = 0; i < iProd; i++) {
            moveBlock (products[i],0,-blockSep/2);
        }
        for (var i = iProd+1; i < products.length-2; i++) {
            moveBlock (products[i],0,blockSep/2);   
        }

    };

    // 
    // Called whenever an energy product is deSelected.
    //
    deSelectProduct = function () {

        nodeGroup.selectAll ("g")
            .attr ("opacity", 1);

        flowLineGroup.selectAll ("path.FlowPath")
            .attr ("opacity", opacityFlowNormal)
            .style ("fill", null);

        flowLineGroup.selectAll ("g.FlowLabelCallout")
            .remove();

        if (selectedProd == "") return;

        // Hide individual amounts

        nodeGroup.selectAll ("g."+selectedProd+ " .SelectedBlockAmount")
            .attr ("opacity", 0);

        nodeGroup.selectAll ("g .TriangleLegend")
            .attr ("opacity", 1);

        nodeGroup.select ("g."+selectedProd+ " .BlockLabelContainer")
            .attr ("transform", "translate(0,0)");


        if (selectedProd != "Electricity" && selectedProd != "Oil_Products") {
            var iProd = products.indexOf(selectedProd);

            for (var i = 0; i < iProd; i++) {
                moveBlock (products[i]);
            }
            for (var i = iProd+1; i < products.length-2; i++) {
                moveBlock (products[i]);   
            }
        }

        selectedProd = "";
        onProductChange();
    };

    // Clear the SVG
    svg.selectAll ("g").remove();

    // Clear the layout and the registry
    layout = [];
    pathReg.clear();
    selectedProd = "";

    // Process the data into the main components for the sankey
    var blocksAndPaths = getEnergyFlow (data);
    var blockInfo = blocksAndPaths [0];
    var pathInfo = blocksAndPaths [1];

    //
    // Create the blocks
    //

    // Fill first column of the layout with the Energy Product blocks
    var firstColumn = [];
    var products = ["Crude","Gas","Coal","Peat","CRW",
                      "Geothermal","Nuclear", "Hydro","Solar"]
    var prodNames = ["Crude","Natural Gas","Coal","Peat","Biocomb.& Waste",
                      "Geothermal","Nuclear", "Hydro","Solar& Wind"]
    for (var iprod in products) {
        var prod = products [iprod];
        var info = blockInfo [prod];
        if (info != undefined && info[0]+info[1]>0) {
            firstColumn.push (Block(info[0],info[1],info[2],info[3],prodNames[iprod],prod))
        }
    }

    // Sort in decreasing order of total amount 
    firstColumn.sort (function (a,b) { return b.totalAmt() - a.totalAmt(); })

    // Remake the products array in sorted order
    products = [];
    for (var i in firstColumn) {
        products.push (firstColumn[i].className);
    }

    // Add first column to layout
    layout.push (firstColumn);

    // Second column contains only the Primary block
    var info = blockInfo.Primary;
    var primary = Block(info[0],info[1],info[2],info[3],'Primary Supply', 'Primary');
    layout.push ([primary]);

    // Third and fourth column blocks
    info = blockInfo.Oil_Products;
    var oil_prods = Block(info[0],info[1],info[2],info[3],'Oil Products', 'Oil_Products');
    info = blockInfo.Electricity;
    var electricity = Block(info[0],info[1],info[2],info[3],'Electricity', 'Electricity');

    // Third column contains Oil Products and two empty blocks
    layout.push ([EmptyBlock(10),oil_prods,EmptyBlock(10)]);

    // Fourth column contains Electricity and two empty blocks
    layout.push ([EmptyBlock(10),EmptyBlock(10),electricity]);

    // Fifth column contains only the consumption
    info = blockInfo.Consumption;
    var consumption = Block(info[0],info[1],info[2],info[3],'Total Consumption', 'Consumption');
    layout.push ([consumption]);

    // Fill sixth column of the layout with the Consumption sectors
    var sixthColumn = [];
    var sectors = ["Transport","Residential","Commercial","Industry","Other"];
    for (var isector in sectors) {
        var sector = sectors [isector];
        var info = blockInfo [sector];
        if (info != undefined && info[0]+info[1]>0) {
            sixthColumn.push (Block(info[0],info[1],info[2],info[3],sector,sector))
        }
    }
    // Sort in decreasing order of total amount 
    sixthColumn.sort (function (a,b) { return b.totalAmt() - a.totalAmt(); })

    // Remake the sectors array in sorted order
    sectors = [];
    for (var i in sixthColumn) {
        sectors.push (sixthColumn[i].className);
    }

    layout.push (sixthColumn);

    //
    // Create Flow Lines
    //

    var flowLineGroup = svg.append("svg:g");

    var flowLines = [];

    // Paths from products to Primary
    for (var iblock in firstColumn) {
        var block = firstColumn[iblock];
        var path = pathInfo [block.className+'Primary'][0];
        var amt = path [3];
        var className = path [2];
        flowLines.push (FlowLine (block,primary,amt,className));
    }

    // Paths from Primary to Consumption
    var passBlock1 = layout[2][0];
    var passBlock2 = layout[3][0];
    //passBlock2.y = passBlock1.y;

    var path = pathInfo ['PrimaryConsumption'];
    if (path != undefined) {
        // Sort by product
        path.sort(function (a,b) { 
            return products.indexOf(a[2]) - products.indexOf(b[2]); 
        });
        for (var ipath in path) {
            var amt = path[ipath][3];
            var className = path[ipath][2];
            flowLines.push (FlowLine(primary,consumption,amt,className,passBlock1, passBlock2));
        }
    }
    // Path from Primary to Oil Products
    path = pathInfo ['PrimaryOil_Products'];
    if (path != undefined) {
        for (var ipath in path) {
            var amt = path[ipath][3];
            var className = path[ipath][2];
            flowLines.push (FlowLine(primary,oil_prods,amt,className));
        }
    }
    // Path from Oil Products to Consumption
    path = pathInfo ['Oil_ProductsConsumption'];
    if (path != undefined) {
        for (var ipath in path) {
            var amt = path[ipath][3];
            var className = path[ipath][2];
            flowLines.push (FlowLine(oil_prods,consumption,amt,className));
        }
    }
    // Path from Oil Products to Electricity
    path = pathInfo ['Oil_ProductsElectricity'];
    if (path != undefined) {
        for (var ipath in path) {
            var amt = path[ipath][3];
            var className = path[ipath][2];
            flowLines.push (FlowLine(oil_prods,electricity,amt,className));
        }
    }

    // Path from Primary to Electricity
    var passBlock3 = layout[2][2];
    path = pathInfo ['PrimaryElectricity'];
    if (path != undefined) {
        // Sort by product
        path.sort(function (a,b) { 
            return products.indexOf(a[2]) - products.indexOf(b[2]); 
        });
        for (var ipath in path) {
            var amt = path[ipath][3];
            var className = path[ipath][2];
            flowLines.push (FlowLine(primary,electricity,amt,className, passBlock3));
        }
    }
    
    // Path from  Electricity to Consumption
    path = pathInfo ['ElectricityConsumption'];
    if (path != undefined) {
        for (var ipath in path) {
            var amt = path[ipath][3];
            var className = path[ipath][2];
            flowLines.push (FlowLine(electricity,consumption,amt,className));
        }
    }

    // Paths from Consumption to Sectors (those corresponding to sector totals)
    products.push ('Oil_Products');
    products.push ('Electricity');

    for (var iblock in sixthColumn) {
        var block = sixthColumn[iblock];
        for (var iprod in products) {
            var prod = products[iprod];
            var path = pathInfo ['Consumption'+block.className];
            if (path == undefined) continue;
            for (var ipath in path) {
                var className = path[ipath][2];
                if (prod == className) {
                    var amt = path[ipath][3];
                    flowLines.push (FlowLine(consumption,block,amt,className));
                }
            }
        }
    }

    // Fix the required space for the empty blocks in the two middle columns
    var primaryConsumptionFlow = pathReg.rightPos (primary,passBlock1,0).total || 10;
    layout [2][0].mainAmt = primaryConsumptionFlow;
    layout [3][0].mainAmt = primaryConsumptionFlow;
    layout [3][1].mainAmt = oil_prods.totalAmt();
    layout [2][2].mainAmt = electricity.totalAmt();

    // Compute the block layout geometry
    computeLayout([1,1,0.4,1,1]);

    // Adjust path Thickness
    // Calling this, makes thin paths more visible, but does messes up
    // the overall size of blocks
    // pathReg.adjustThickness();

    // Adjust the coordinates of empty blocks
    layout [2][0].x -= blockWidth/2;
    layout [2][2].x -= blockWidth/2;
    var primaryElectricityLeft = pathReg.leftPos (passBlock3,electricity,0);
    if (primaryElectricityLeft) {
        passBlock3.y += primaryElectricityLeft.above*amtToY+electricity.flowLeftEdge().y;
    }

    // Center Primary block w.r.t. incoming flow lines
    var bfirst = firstColumn[0];
    var y0left = bfirst.y + bfirst.flowRightEdge().y;
    var blast = firstColumn[firstColumn.length-1];
    var y1left = blast.y + blast.height;
    var y0right = primary.y;
    var y1right = primary.y+primary.height;
    var yshift =  (y1left+y0left)/2 - (y1right+y0right)/2;
    primary.y += yshift;

    // Adjust block heights
    var b = allBlocks();
    for (var ib in b) {
        b[ib].adjustHeight();
    }


    // Renders the flowLines into svg
    flowLineGroup.selectAll ("g")
        .data (flowLines) 
        .enter ()
        .append ("g")
        .call (flowLineSvg);

    // Renders the energy blocks into the svg
    var nodeGroup = svg.append("svg:g");
    nodeGroup.selectAll("g")
        .data (b)
        .enter()
        .append ("g")
        .on ("click", function (d) { 
            pathReg.debugBlock(d);
            selectProduct (d.className); 
            d3.event.stopPropagation(); 
        })
        .call (blockSvg);


    // Arrange for deselecting all products on click outside a block
    svg.on("click", deSelectProduct);


    // Start with all products deselected
    deSelectProduct();

}

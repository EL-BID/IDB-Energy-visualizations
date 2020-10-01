if (typeof lcg !== "object") {
    lcg = {};
}

// The translation module should have been defined, otherwise, 
// define a function that maps terms to themselves
if (typeof TL !== "function") TL = function (term) { return term; };

// We assume that the Number prototype has a function to format numbers called energyFormat,
// otherwise, define one ourselves. 
if (Number.prototype.energyFormat == undefined) {
    var wholeNumberFormat = d3.format (",.0f");
    var fracNumberFormat = d3.format (",.1f"); 
    Number.prototype.energyFormat = function () { 
        return Math.abs(this)>=1 ? wholeNumberFormat (this) : fracNumberFormat(this);
    } ;
}


//
// Computes a 1-D packing arrangement of sons within a parent.
// son -> array of son sizes
// size -> total size of parent (default: sum of son's sizes).
// policy -> "min", "mid", "max" or "dist", analogous to left, center, right or justified word packing (default:"min").
// pos -> minimum parent coordinate (e.g. left for horizontal or top for vertical packing) (default:0).
// sep -> an additional separation between pairs (default: 0).
// returns an array of son positions.
//
lcg.arrange = function (son, policy, size, pos, sep) {
    pos = typeof pos !== 'undefined' ? pos : 0;
    sep = typeof sep !== 'undefined' ? sep : 0;
    var sum = son.reduce(function(prev, cur) {
        return prev + cur;
    });
    size = typeof size !== 'undefined' ? size : sum;
    var ret = [];
    var n = son.length;
    sum += (n-1) * sep;
    if (policy == "dist") sep += (size-sum)/(n-1);
    else if (policy == "mid") pos += (size-sum)/2;
    else if (policy == "max") pos += size-sum;
    for (var i = 0; i < n; i++) {
        ret.push(pos);
        pos += son[i] + sep;
    }
    return ret;
}   

// A rounded rect path. RoundFlags is an array with 4 booleans [NW,NE,SE,SW] 
// telling which corners are to be rounded (by default, none). r is the round radius
lcg.roundRectPath = function (x,y,width,height,roundFlags,r) {
    r = (r == undefined) ? 10 : r;
    roundFlags = roundFlags || [];
    var nw = roundFlags[0], ne = roundFlags [1], se = roundFlags [2], sw = roundFlags [3];
    var p = "M" + ((nw?r:0)+x) + "," + y;
    var top = width - (ne?r:0) - (nw?r:0);
    p = p + " l"+top+",0";
    if (ne && r) p = p + " a"+r+","+r+",0,0,1,"+(r)+","+(r);
    var right = height - (ne?r:0) - (se?r:0);
    p = p + " l0,"+right;
    if (se && r) p = p + " a"+r+","+r+",0,0,1,"+(-r)+","+(r);
    var bottom = width - (se?r:0) - (sw?r:0);
    p = p + " l"+(-bottom)+",0";
    if (sw && r) p = p + " a"+r+","+r+",0,0,1,"+(-r)+","+(-r);
    var left = height - (sw?r:0) - (nw?r:0);
    p = p + "l 0,"+(-left);
    if (nw && r) p = p + " a"+r+","+r+",0,0,1,"+(r)+","+(-r);
    return p;
}

// Generates a tabbed rectangle path. Arguments:
// tabwidth : width of the tab
// tabheight : height of the tab
// tabx : horizontal displacement of the tab w.r.t. left side of the rectangle 
// width : width of the rectangle
// height : height of the rectangle
// r : radius for the bottom corners
lcg.tabbedRectPath = function (tabwidth, tabheight, tabx, width, height, roundFlags, r) {
    r = r || 10;
    roundFlags = roundFlags || [];
    var nw = roundFlags[0], ne = roundFlags [1], se = roundFlags [2], sw = roundFlags [3];
    var p = "M 0,"+tabheight;
    p = p + " l"+tabx+",0";
    p = p + " l0," + (-tabheight+(nw?r:0));
    if (nw) p = p + " a"+r+","+r+",0,0,1,"+(r)+","+(-r);
    var top = tabwidth - (nw?r:0) - (ne?r:0);
    p = p + " l"+ top + ",0";
    if (ne) p = p + " a"+r+","+r+",0,0,1,"+(r)+","+(r);
    p = p + " l0,"+ (tabheight-(ne?r:0)); 
    p = p + " l"+ (width-tabwidth-tabx) + ",0";
    p = p + " l0,"+ (height-(se?r:0));
    if (se) p = p + " a"+r+","+r+",0,0,1,"+(-r)+","+(r);
    var bottom = width - (sw?r:0) - (se?r:0);
    p = p + " l" + (-bottom) +",0";
    if (sw) p = p + " a"+r+","+r+",0,0,1,"+(-r)+","+(-r);
    p = p + " l0," + (-height+(sw?r:0)) +"z";
    return p;
} 

/// Path for a triangle pointing to the right within a circle with diameter = 500 
lcg.menuButtonIconPath = "M 250,0.6457942 C 111.92882,0.6457942 0,112.5746 0,250.64579 c 0,138.07119 111.92882,250 250,250 138.07119,0 250,-111.92881 250,-250 C 500,112.5746 388.07119,0.6457942 250,0.6457942 z m -56.15625,127.7187458 73.375,60.96875 73.34375,61 -73.34375,61 -73.375,60.96875 0,-121.96875 0,-121.96875 z";

// Counts the number of combos in case we define more than one
lcg.comboCounter = 0;

// A generator for dropdown menus from a common menu bar
lcg.DropDownCombo = function (parent, buttonWidth, buttonHeight, menuWidth, menuHeight, iconSize) {

    iconSize = iconSize || 15;

    var combo = {};
    combo.parent = parent;
    combo.buttonWidth = buttonWidth;
    combo.buttonHeight = buttonHeight;
    combo.buttonX = 0;
    combo.buttonIconX = lcg.defaults.comboButtonIconX;
    combo.menuWidth = menuWidth;
    combo.menuHeight = menuHeight;
    combo.group = [];
    combo.id = "combo" + (lcg.comboCounter++);
    combo.g = parent.append ("g").classed ("dropDownCombo", true);
    combo.menuButtonFrames = combo.g.append ("g").classed ("menuButtonFrameGroup", true);
    combo.menus = combo.g.append ("g").classed ("menuGroup", true);
    combo.clipid = combo.id+"clip";
    combo.menus.append ("clipPath")
        .attr ("id", combo.clipid)
        .append ("rect")
        .attr ("x", -1)
        .attr ("y", buttonHeight-1)
        .attr ("width", menuWidth+4)
        .attr ("height", menuHeight+2);


    // This is the callback for whenever a menu is dropped down. The argument
    // is the vertical dropdown displacement
    combo.onDropDown = function (dy) {};

    // This is the callback for whenever a menu is rolled up. 
    combo.onRollUp = function () {};

    // Creates a new dropdown menu with the given height and title
    combo.DropDown = function (menuHeight, title, titleX, titleY, roundFlags, r, buttonWidth) {

        title = title || "";
        titleX = titleX || 20;
        titleY = titleY || 20;
        roundFlags = roundFlags || [1,1,0,0];
        buttonWidth = buttonWidth || combo.buttonWidth;
        r = r || 6;

        var obj = {};
        combo.group.push (obj);
        obj.menuHeight = menuHeight || combo.menuHeight;

        var buttonPath = lcg.roundRectPath (combo.buttonX,0,buttonWidth,combo.buttonHeight,roundFlags, r);

        obj.buttonFrame = combo.menuButtonFrames.append ("path")
                    .classed ("menuButtonFrame", true)
                    .attr ("d", buttonPath);
        obj.menuFrame = combo.menus.append ("g").attr ("clip-path", "url(#"+combo.clipid+")");
        obj.menu = obj.menuFrame.append ("g")
                    .classed("dropDownMenu", true)
                    .attr ("visibility", "hidden");
        obj.menu.append ("path")
                    .classed("menuBackground", true)
                    .attr ("filter", "url(#drop-shadow)")
                    .attr ("d", 
                        lcg.tabbedRectPath(
                            buttonWidth+1, 
                            combo.buttonHeight-1, 
                            combo.buttonX, 
                            combo.menuWidth+1, 
                            obj.menuHeight+1,[roundFlags[0],roundFlags[1],1,1], r));
        obj.buttonBackdrop = obj.menu.append ("rect")
                    .classed ("menuButtonFrame", true)
                    .attr ("stroke-opacity", "0")
                    .attr ("x", combo.buttonX+3)
                    .attr ("y", 3)
                    .attr ("width", buttonWidth-6)
                    .attr ("height", combo.buttonHeight-6);
        obj.button = combo.menus.append("g")
                    .classed("menuButton", true)
                    .attr ("transform", "translate("+combo.buttonX+",0)");

        var iconpos = [combo.buttonHeight / 2+combo.buttonIconX, combo.buttonHeight / 2];
        var iconscale = iconSize / 500;
        obj.buttonIconGroup = obj.button.append ("g")
            .classed ("menuButtonIcon",true)
            .attr ("transform", "translate ("+iconpos[0]+","+iconpos[1]+")");
        obj.buttonIcon = obj.buttonIconGroup.append ("path")
            .attr ("d", lcg.menuButtonIconPath)
            .attr ("transform", "scale ("+iconscale+") translate (-250,-250)" );

        obj.buttonTitle = obj.button.append("text")
            .classed ("menuButtonLabel", true)
            .attr ("x", titleX)
            .attr ("y", titleY);
        obj.titleSpan = obj.buttonTitle.append ("tspan").text (title).classed("title", true);
        obj.buttonTitle.append ("tspan").text (" ").classed("space", true);
        obj.arrowSpan = obj.buttonTitle.append ("tspan").text (">").classed("arrow", true);
        obj.buttonTitle.append ("tspan").text (" ").classed("space", true);
        obj.valueSpan = obj.buttonTitle.append ("tspan").classed ("value",true);

        combo.buttonX += buttonWidth;
        obj.state = "up";
        
        // Function to return the value shown in the button
        obj.getValue = function (value) {
            return obj.valueSpan.text ();
        }        

        // Function to change the value to be shown in the button
        obj.setValue = function (value) {
            obj.valueSpan.text (value);
        }        

        // Function to change the arrow symbol to be shown in the button
        obj.setArrow = function (value) {
            obj.arrowSpan.text (value);
        }

        // Function called whenever the menu is to be shown
        obj.dropdown = function (delay) {
            var timeToStart = delay ? 400 : 0;
            var duration = 750;
            var timeToEnd = timeToStart + duration;
            obj.state = "down";
            obj.buttonFrame.classed ("menuDown", true);
            obj.buttonBackdrop.classed ("menuDown", true);
            obj.button.classed("menuDown", true);
            obj.buttonIconGroup.attr ("transform", "translate ("+iconpos[0]+","+iconpos[1]+") rotate(90)");
            obj.menu
                .attr ("visibility", "visible") 
                .attr ("transform", "translate(0,"+(-obj.menuHeight)+")")
                .transition ()
                .delay(timeToStart)
                .duration(duration)
                .attr ("transform", "translate(0,0)");
            obj.menuFrame
                .transition()
                .delay(timeToEnd)
                .attr ("clip-path", null);
        }

        // Function called whenever the menu is to be hidden
        obj.rollup = function () {
            obj.state = "up";
            obj.button.classed("menuDown", false)
            obj.buttonFrame.classed ("menuDown", false);
            obj.buttonBackdrop.classed ("menuDown", false);
            obj.menuFrame.attr ("clip-path", "url(#"+combo.clipid+")");
            obj.buttonIconGroup.attr ("transform", "translate ("+iconpos[0]+","+iconpos[1]+")");

            obj.menu
                .attr ("transform", "translate(0,0)")
                .transition ()
                .duration(400)
                .attr ("transform", "translate(0,"+(-obj.menuHeight)+")");
            obj.menu.transition().delay(400).attr ("visibility", "hidden");
        }
        // Toggles the showing/hiding of menu
        obj.buttonOn = function () { 
            if (obj.state == "up") {
                var delay = false;
                for (var i = 0; i < combo.group.length; i++) {
                    if (combo.group[i].state == "down") {
                        delay = true;
                        combo.group[i].rollup();
                    }
                }
                obj.dropdown(delay);
                combo.onDropDown(obj.menuHeight);
            }
            else {
                obj.rollup();
                combo.onRollUp ();
            }
        }
        // Set callbacks for showing/hiding the menu
        obj.button.on ("click", obj.buttonOn);
        obj.buttonFrame.on ("click", obj.buttonOn);
        obj.buttonBackdrop.on ("click", obj.buttonOn);

        return obj;
    }

    return combo;
}


//
// Returns the an array of pairs [[a[0],b[0]], [a[1],b[1]] ...]
//
lcg.zip = function (a,b) {
    var ret = [];
    var n = a.length;
    for (var i = 0; i < n; i++) ret.push([a[i],b[i]]);
    return ret;
}


// Defaults for various constants used in the package
lcg.defaults = {
    // General defaults
    'bbox' : {'x' : 10, 'y': 10, 'width': 200, 'height': 150 }, // bounding box
    'margin' : [20, 20, 20, 20],  // Margins w.r.t. the chart container
    'duration' : 1000,  // Average duration of transitions
    // Combo
    'comboButtonIconX' : 0, // Position of the dropdown icon inside each combo tab

    // Balloons 
    'balloonMargin' : 2, // margin around text
    'balloonR' : 4,      // radius of rectangle corners
    'balloonDx' : 4,     // callout arrow width
    'balloonDy' : 4,     // callout arrow height
    // Pies
    'pieSliceOffset' : 0.3, // ratio of the slice centroid to offset the slice when clicked
    'pieLabelOffset' : 2.3, // ratio of the slice centroid to offset the label
    'pieSizeRatio' : 0.8, // How much of the chart to use for the pie proper
    'pieRadiusRatio' : 1.0, // Scales the radius of the pie by this 
    // Menus
    'menuShowSample' : true, // Whether to show a sample rectangle together with the label
    'menuRSize' : 20,  // Size of the menu's sample rectangle
    'menuRAspect' : 1.0, // Aspect ratio (x/y) of the menu's sample rectangle
    'menuRRound' : 10, // Radius of the menu's sample rectangle (half the width for circles)
    'menuRSep' : 10, // Horizontal separation between the rectangle and the label
    'menuLabelOffset' : 5, // Vertical offset between the label and the rectangle
    'menuEntrySep' : 10, // Separation between consecutive entries of the menu
    'menuType' : 'action', // Type of the menu : either 'action', 'radio' or 'check' 
    'menuDirection' : 'vertical', // Menu direction : either 'horizontal' or 'vertical'
    // Areas
    'areaLabelXOffset' : 5, // Horizontal offset of the area label with respect to the last point
    'areaLabelYOffset' : 0, // Vertical offset of the area label with respect to the last point
}

// 
// Base class for chart visualizations.
//
// Typical usage:
// 
// <svg width=300 height=300 id = "mychart" />
// <script> 
//    chart = lcg.chart()
//             .parent("#mychart")
//             .data([ 1, 10, 5, 20 ])
//
// </script>
// 
lcg.chart = function () {

    //
    // These are local variables which are accessible only to methods
    // of this (base) class.
    //
    
    var 
    chart = {},     // The chart object
    parent,         // The container (an svg element)
    bbox = lcg.defaults.bbox, // Chart area
    w = bbox.width, 
    h = bbox.height, // width and height of the chart area 
    x = bbox.x, 
    y = bbox.y,   // Coordinates of the top left corner of the chart area
                    // w.r.t the chart container
    margin = lcg.defaults.margin,  // Margins w.r.t. the chart container
    x0 = x + margin[3], // left coordinate of the plottable area of the chart
    y0 = y + margin[0], // top coordinate of the plottable area of the chart
    width = w - margin[1] - margin[3], // Width of the plottable area of the chart
    height = h - margin[0] - margin[2]; // Height of the plottable area of the chart

    
    // These are variables which are to be accessed by derived
    // classes
    chart._rect = [x0,y0,width,height]; // x,y,width and height of the chart drawing w.r.t 
                             // the chart container
    chart._duration = lcg.defaults.duration;  // Average duration of transitions
    chart._group = 0;        // The svg group containing the chart
    chart._data= [];         // The data array  
    chart._key = undefined;  // The key argument to d3's data function

    // Whether or not to generate grid lines
    chart._xgridlines = false; // vertical grid lines
    chart._ygridlines = false; // horizontal grid lines

    // Number of ticks for x,y
    chart._xticks = 10;
    chart._yticks = 10; 

    // The tick format for each axis
    chart._xtickformat = null;
    chart._ytickformat = null;

    
    // Function for obtaining the value from each data item 
    chart._value = function(d,i) { return d };
    
    // Function for obtaining the category from each data item 
    chart._category = function(d,i) { return i };

    // Function for obtaining the series data from each data item 
    chart._series = function(d,i) { return d };
    
    // Function for obtaining category label from each data item
    chart._label = function(d,i) { return "label "+i };

    // Function for obtaining a tooltip for each data item
    chart._tooltip = function(d,i) { return "tip: item "+i };

    // For a chart with several series, the plot of each series
    // receives a class name based on the index of the series
    chart._seriesClassName = function (i) { return "series"+i; };

    // Function for mapping categories to colors
    // (By default, inherit from css)
    chart._color = function(d,i) { return null };

    // Function to be called when an item is clicked
    chart._onClick = function () {}

            
    // Sets or gets the chart's parent. 
    // p : the selector for the parent or the parent itself.
    // return : the parent node if p is not given, or the chart.
    chart.parent = function (p) {
        if (!arguments.length) return parent.node();     
        if (typeof p == "string") parent = d3.select(p);
        else parent = p;
        /*
        x = 0;
        y = 0;
        w = parent.node().clientWidth;
        h = parent.node().clientHeight;
        // May not have been rendered yet - try to get size using style
        if (!(w>0)) {
            w = parseInt(parent.style("width"));
            h = parseInt(parent.style("height"));
        } 
        // If still size 0, use some reasonable(?) default
        if (!(w>0)) {
            w = 200;
            h = 200;
        } 
        */
        // Test whether the container not is already an svg
        if(d3.ns.prefix.xhtml == parent.node().namespaceURI) {
            parent = parent.append("svg:svg")
                .attr("viewBox", "0 0 "+w+" "+h)
                .attr("preserveAspectRatio", "none");                      
        }
        // Create a group for holding the whole chart
        chart._group = parent.append("svg:g")
            .attr("class", "chart")
            .attr("id", "chart"+parent.node().childElementCount);
        chart.resize();
        return chart;
    }

    // Sets or gets the class name of the chart's main group, so that
    // it can be styled by css
    // cname : the new class name
    // return : the group's current class name if name is not given, or the chart.
    chart.className = function (cname) {
        if (!arguments.length) return chart._group.attr("class");
        chart._group.attr("class", cname);
        return chart;        
    }

    // Sets or gets the id of the chart's main group, so that
    // it can be styled by css
    // newid : the new id
    // return : the group's current id if newid is not given, or the chart.
    chart.id = function (newid) {
        if (!arguments.length) return chart._group.attr("id");
        chart._group.attr("id", newid);
        return chart;        
    }

    //
    // Gets/sets the chart's value accessor function.
    // v : the new value function.
    // Returns the chart or the current value function (if v is not given)
    chart.value = function (v) {
        if (!arguments.length) return chart._value;
        chart._value = v;
        return chart;
    }

    //
    // Gets/sets the chart's category accessor function
    // c : the new category function
    // Returns the chart or the current category function (if c is not given)
    chart.category = function (c) {
        if (!arguments.length) return chart._category;
        chart._category = c;
        return chart;
    }
  
    //
    // Gets/sets the chart's label accessor function
    // l : the new label function
    // Returns the chart or the current label function (if l is not given)
    chart.label = function (l) {
        if (!arguments.length) return chart._label;
        chart._label = l;
        return chart;
    }
    
    // Gets/sets the chart's tooltip accessor function
    // t : the new tooltip function
    // Returns the chart or the current tooltip function (if t is not given)
    chart.tooltip = function (t) {
        if (!arguments.length) return chart._tooltip;
        chart._tooltip = t;
        return chart;
    }

    //
    // Gets/sets the chart's seriesClassName accessor function
    // s : the new seriesClassName function
    // Returns the chart or the current className function (if s is not given)
    chart.seriesClassName = function (s) {
        if (!arguments.length) return chart._seriesClassName;
        chart._seriesClassName = s;
        return chart;
    }


    // Gets/sets the chart's series accessor function
    // s : the new series function
    // Returns the chart or the current series function (if s is not given)
    chart.series= function (s) {
        if (!arguments.length) return chart._series;
        chart._series = s;
        return chart;
    }
    
    //
    // Gets/sets the chart's color accessor function
    // c : the new color function
    // Returns the chart or the current color function (if c is not given)
    chart.color = function (c) {
        if (!arguments.length) return chart._color;
        chart._color = c;
        return chart;
    }

    //
    // Gets/sets the chart's 'onClick' callback function
    // c : the new callback function
    // Returns the chart or the current callback function (if c is not given)
    chart.onClick = function (c) {
        if (!arguments.length) return chart._onClick;
        chart._onClick = c;
        return chart;   
    }

    // General functions to modify internal variables
    // in an homogeneous way.
    // varname : variable name (without the leading '_')
    // value : the value to be set
    // Returns the chart object
    chart.set = function (varname, value) {
        chart['_'+varname] = value;
        return chart;
    }

    
    // 
    // Gets/sets chart's transitions duration
    // d : duration in milliseconds
    // Returns the chart or the current duration  (if d is not given)
    chart.duration = function (d) {
        if (!arguments.length) return chart._duration;
        chart._duration = d;
        return chart;
    }
        
    //
    // Sets or gets the margins to the content
    // m : [ top, right, bottom, left ] in pixels
    // returns either the margin array if m is not given, or the chart itself.
    chart.margin = function(m){
        if (!arguments.length) return margin;
        margin = m;
        chart.resize ();
        return chart.redraw();
    };
    
    // 
    // Sets or gets the width and height of the chart's total area,
    // i.e., including the margin.
    // s : [ width, height ] in pixels
    // returns either the size array if s is not given, or the chart itself.
    chart.size = function(s){
        if (!arguments.length) return [w, h];
        w = s[0];
        h = s[1];
        chart.resize();
        return chart.redraw();
    };
    
    // 
    // Sets or get the position of the upper left corner of the chart
    // p : either absolute [ x, y ] or "after" / "under" meaning relative 
    //     horizontal/vertical displacement w.r.t. other.
    // other: another chart
    // returns either the position array if p is not given, or the chart itself.
    chart.position = function(p, other){
        if (!arguments.length) return [x, y];
        if(typeof p == "string"){
            var otherPos = other.position();
            var otherSize = other.size();    
            if(p == "after"){
                x = otherPos[0]+otherSize[0];
                y = otherPos[1];
            } else if(p == "under"){
                x = otherPos[0];
                y = otherPos[1]+otherSize[1];
            }
        } else {
            x = p[0];
            y = p[1];
        }
        chart.resize();
        return chart.redraw();
    };
    
    //
    // Gets/sets the data for the chart.
    // d : the data object, which must be an array of objects.
    // key : if present, is a function for mapping data to elements (see the d3 data funciton)
    // returns the data (if d is not given) or the chart itself.
    chart.data = function(d, key) {
        if (!arguments.length) return chart._data;
        chart._data = d;
        chart._key = key;
        return chart.redraw();
    };
   

    // 
    // Recomputes the position and dimensions of the chart
    // drawing inside the parent container, i.e., not
    // including the margin.
    chart.resize = function () {
        width = w - margin[1] - margin[3];
        height = h - margin[0] - margin[2];
        x0 = x + margin[3];
        y0 = y + margin[0];
        chart._rect = [x0, y0, width, height];
        return chart;
    }

    //
    // This contains the actual drawing code for the chart.
    chart.redraw = function (){
        chart._group.selectAll("rect").remove();
        chart._group.append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", w)
            .attr("height", h)
        return chart;
    }
    
    return chart;
}



//
// A category menu, which depicts colors assigned to keys and
// can be used as a menu, either for single action upon clicking,
// or as having radiobutton or checkbutton behavior,
// by adding the 'selected' class to the appropriate entries.
// The selected data can be obtained by calling the .selected ()
// method and an item can be selected by calling the .select () 
// method.
//
// Data is a collection of values.
//
// Example usage:
//     chart = lcg.menu()
//             .parent("#mychart")
//             .color(function (i) { return [d3.rgb("red"), d3.rgb("yellow"), d3.rgb("blue")][i] })
//             .data([ "Red", "Yellow", "Blue" ])
//
lcg.menu = function () {

    var chart = lcg.chart(); // The object

    // Type of this menu: 'action' means no selection,
    // 'radio' means only one selected,
    // 'softradio' means up to one selected (none is ok)
    // 'check' means any entry may be selected / deselected
    chart._type = lcg.defaults.menuType;

    // Geometry layout parameters
    chart._showSample = lcg.defaults.menuShowSample; // Whether to show the sample rectangles
    chart._rSize = lcg.defaults.menuRSize; // Height of the key sample rectangle
    chart._rAspect = lcg.defaults.menuRAspect; // Aspect ratio (width/height) for the sample rectangle
    chart._entrySep = lcg.defaults.menuEntrySep; // Separation between entries
    chart._rSep = lcg.defaults.menuRSep; // Horizontal separation between the rect and the text
    chart._labelOffset = lcg.defaults.menuLabelOffset; // Displacement of the label text with
                     // respect to the key sample rectangle
    chart._rRound = lcg.defaults.menuRRound;  // Radius of the rounded bevel of the rectangle
    chart._direction = lcg.defaults.menuDirection; // Either 'horizontal' or 'vertical'
    chart._align = "min";
    chart._checkLimit = 1000; // Maximum number of selected entries when type=check
    
    // Function to tell whether a datum is a title (i.e., just for display) or an actual
    // menu entry
    chart._isTitle = function (d,i) {return false;}  // By default, no datum is a title

    // Function to tell whether a datum is a separator (i.e., a line)
    chart._isSeparator = function (d,i) {return d == "-";}  // By default, a single dash means a separator

    // If an element is not a separator and is not a title, then it is an entry
    chart._isEntry = function (d,i) { return !chart._isTitle(d,i) && !chart._isSeparator(d,i); }

    // Uber object holds methods we will rewrite and
    // which will access the superclass' original methods
    var uber = {
        parent: chart.parent,
        resize: chart.resize
    };

    // Sets/gets the parent container. Initializes the chart.
    chart.parent = function (p) {
        if (!arguments.length) return uber.parent();
        uber.parent(p);
        // Create a group for holding the keys
        chart._group.append ("g")
            .attr ("class", "menu");
        return chart;
    }
    
    // Sets / gets the menu type
    chart.type = function (t) {
        return chart.set('type', t);
    }

    // Enables/disables the color submenu
    chart.manageColors = function (truth) {
        chart._manageColors = truth;
        if (truth) {
            chart._colorSubMenu = lcg.colorSubMenu();
            chart._colorSubMenu.callback = chart._onColorChange;
        }
        return chart;
    }

    // Returns a list of the colors for the selected entries
    chart.selectedColors = function () {
        var r = [];
        chart._group.selectAll(".entry.selected circle.colorcircle").each (function () {
            r.push(d3.select(this).attr("fill"));
        });
        return r;
    }

    // Creates/destroys color circles attached to selected entries
    chart._setColorCircles = function () {
        if (chart._manageColors) {
            chart._colorSubMenu.attach(chart._group.selectAll(".entry"));
        }
    }

    // Called whenever the chart geometry changes, e.g., through calling
    // size or position
    chart.resize = function (s) {
        uber.resize(s);
        var x0 = chart._rect[0];
        var y0 = chart._rect[1];
        chart._group.attr("transform", "translate(" + x0 + "," + y0 + ")");
        return chart;
    }   

    // Call function f for each selected item
    chart.selected = function (f) {
        chart._group.selectAll(".entry.selected").each(f);
    }

    // Return an array of all selected data
    chart.selectedData = function () {
        var a = [];
        chart.selected (function (d,i) { 
            a.push (d);
        });
        return a;
    }

    // Selects or deselects entries based on a given boolean function or a list of indices
    chart.select = function (f) {
        chart._group.selectAll(".entry").each(function (d,i) {
            if (typeof(f) == "function") 
                d3.select(this).classed("selected", f(d,i) && !d3.select(this).classed ("inactive")); 
            else {
                d3.select(this).classed("selected", f.indexOf(i) >= 0 && !d3.select(this).classed ("inactive")); 
            }
        });
        chart._setColorCircles();
        return chart;
    };

    // returns or sets the active entries. If f is given, it must be a list of indices or a function,
    // otherwise returns a list of active indices
    chart.active = function (f) {
        if (f == undefined) {
            var ret = [];
            chart._group.selectAll(".entry").each(function (d,i) {
                if (!d3.select(this).classed("inactive")) ret.push (i);
            });
            return ret;
        }
        chart._group.selectAll(".entry").each(function (d,i) {
            var sel = d3.select(this);
            if (typeof(f) == "function") 
                sel.classed("inactive", !f(d,i)); 
            else {
                sel.classed("inactive", !(f.indexOf(i) >= 0)); 
            }
            if (sel.classed("inactive")) sel.classed ("selected", false);
        });
        return chart;
    };

    // similar to active, but returns or gets a list of data items
    chart.activeData = function (f) {
        if (f == undefined) {
            var ret = [];
            chart._group.selectAll(".entry").each(function (d,i) {
                if (!d3.select(this).classed("inactive")) ret.push (d);
            });
            return ret;
        }
        chart._group.selectAll(".entry").each(function (d,i) {
            var sel = d3.select(this);
            if (typeof(f) == "function") 
                sel.classed("inactive", !f(d,i)); 
            else {
                sel.classed("inactive", !(f.indexOf(d) >= 0)); 
            }
            if (sel.classed("inactive")) sel.classed ("selected", false);
        });
        return chart;
    };

    // What is done when a managed color changes
    chart._onColorChange = function () {
        chart._onClick ();
    }

    // What is done when a menu entry is clicked
    chart._entryClick = function (d, i) {
        var entry = d3.select (this);
        if (entry.classed ("inactive")) return;
        if (chart._type == 'radio' || chart._type == 'softradio') {
            var oldstate = (chart._type == 'softradio') ? entry.classed("selected") : false;
            chart._group.selectAll (".entry.selected").classed("selected", false);
            entry.classed ("selected", !oldstate);
        } 
        else if (chart._type == 'check') {
            var sel = entry.classed ("selected");  
            if (sel) 
                entry.classed ("selected", false);
            else {
                var n = chart._group.selectAll (".entry.selected").size();
                if (n < chart._checkLimit) entry.classed ("selected", true);
            }
        } 
        // Remove the color submenu if attached to this entry
        if (!entry.classed("selected") && chart._manageColors) {
            if (chart._colorSubMenu.chooserMenu != undefined) {
              chart._colorSubMenu.chooserMenu.remove();  
            } 
        }
        chart._setColorCircles();
        chart._onClick (d,i);
    }

    // Rearranges the entries horizontally or vertically within the chart's rect
    chart._layoutEntries = function () {
        // Select the entries
        var entries = chart._group.selectAll (".menuitem");
        // Get entry bounding boxes
        var w = [];
        var h = [];
        entries.each(function(d,i) {
            var box = this.getBBox();
            w.push(box.width);
            h.push(box.height);
        });
        // layout horizontally or vertically
        var sep = chart._entrySep;
        if (chart._direction [0] == 'h') {
            // Horizontal layout
            var xoffset = lcg.arrange (w, chart._align, chart._rect[2], 0, sep);
            entries.attr("transform", function(d,i) {
                return "translate("+xoffset[i]+"," + 0 + ")";
            });
        } else {
            // Vertical layout
            var yoffset = lcg.arrange (h, chart._align, chart._rect[3], 0, sep);
            entries.attr("transform", function(d,i) {
                return "translate("+ 0 +"," + yoffset[i] + ")";
            });
        }
    }

    // This is the actual redraw code for key legends
    chart.redraw = function () {

        var _rh = chart._rSize; // Height of the key sample rectangle
        var _raspect = chart._rAspect; // Aspect ratio (width/height) for the sample rectangle
        var _ysep = chart._entrySep; // Vertical separation between keys 
        var _xsep = chart._rSep; // Horizontal separation between the rect and the text
        var _base = chart._labelOffset; // Displacement of the label text 
        var _round = chart._rRound;  // Radius of the rounded bevel of the rectangle
        
        // Start by removing everything
        chart._group.select(".menu").selectAll("g").remove();

        if (chart._data.length == 0) return chart;

        // Then append
        var legends = chart._group.select(".menu").selectAll("g")
            .data(chart._data);



        // Create blocks for holding rectangles and legends
        var elemEnter = legends.enter()
            .append("g")
            .attr("transform", function(d,i) {
                return "translate(0," + (i)*(_rh+_ysep)+ ")"
            })
            .classed ("menuitem", true)
            .classed ("menutitle", function (d,i) { return chart._isTitle(d,i); })
            .classed ("menuseparator", function (d,i) { return chart._isSeparator(d,i); })
            .classed ("entry", function (d,i) { return chart._isEntry (d,i); });

        /* Attach callbacks only to real menu entries */
        var textitems = chart._group.selectAll(".entry,.menutitle");
        var entries = chart._group.selectAll (".entry");
        entries.on ("click", chart._entryClick);


        if (chart._showSample) {
            // Create the rectangles for each block
            entries.append("svg:rect")
                .attr ("class", "sample")
                .attr ("x", 0)
                .attr ("y", 0)
                .attr ("width", _rh*_raspect)
                .attr ("height", _rh)
                .attr ("rx", _round)
                .attr ("ry", _round)
                .style ("fill", function(d, i) { 
                    return chart._color(chart._category(d,i)); 
                 });
        } else {
            _rh = _xsep = 0;
        }

        // Create the legend texts for each block
        textitems.append("svg:text")
            .attr ("class", "label")
            .text (function (d) { return TL(chart._value(d)); })
            .attr ("x", function(d,i) { return chart._isTitle(d,i) ? 0 : _rh*_raspect+_xsep; })
            .attr ("y", _rh-_base);

        chart._layoutEntries ();

        return chart;
    }
  
    return chart;
}

//
// A menu with more detailed layout
//
lcg.megamenu = function () {

    var chart = lcg.menu(); // The object

    chart._entryBackdropPad = [3,3,3,3]; // How much to enlarge the entry backdrop rectangles [left,top,right,bottom]
    chart._panelAlign = "dist";
    chart._equalSizedPanels = false; // Whether to lay out panels uniformly
    chart._panelSep = 20;
    chart._textLineSep = 12;
    chart._samplePos = "left";
    chart._imageSample = function(d,i) { return undefined; };
    chart._iconPath = function(d,i) { return undefined; };
    chart._iconScale = 1.0;

    // Rearranges the entries horizontally or vertically within the chart's rect
    chart._layoutEntries = function () {
      
        // To fix IE11 issue, that does allow to modify rect bbox object
        function cloneBBox(rect) {
            return {x:rect.x, y:rect.y, width: rect.width, height:rect.height};
        }

        // Align samples and text
        if (chart._showSample) {

            var bs = [];
            chart._group.selectAll (".entry .sample").each (function (d,i) {
                bs [i] = cloneBBox(this.getBBox());
            });
            var bt = [];
            var ts = [];
            chart._group.selectAll (".entry .label").each (function (d,i) {
                bt [i] = cloneBBox(this.getBBox());
                var tspans = [];
                d3.select(this).selectAll("text").each (function (d,i) {
                    tspans.push(cloneBBox(this.getBBox()));
                });
                ts[i] = tspans;
            });
            if (chart._samplePos == "top") {
                for (var i = 0; i < bs.length; i++) {
                    var n = Math.max (bs[i].width,bt[i].width);
                    bs[i].x = (n-bs[i].width)/2;
                    bt[i].x =  (n-ts[i][0].width)/2-ts[i][0].x;
                    bt[i].y = bs[i].height + chart._labelOffset+ chart._rSep;
                }
            } else {
                for (var i = 0; i < bs.length; i++) {
                    var n = Math.max (bs[i].height,bt[i].height);
                    bt[i].x = chart._rSep+bs[i].width;
                    bt[i].y = chart._labelOffset +(n-bt[i].height)/2;
                }
            }
            chart._group.selectAll (".entry .sample")
                .attr ("transform", function (d,i) { 
                    return "translate("+bs[i].x+","+bs[i].y+")"; 
                });
            chart._group.selectAll (".entry .label")
                .attr ("transform", function (d,i) {
                    return "translate("+bt[i].x+","+bt[i].y+")"; 
                });            
        }

        // Select the entries
        var panels = chart._group.selectAll ("g.menupanel");
        var separators = panels.selectAll ("g.menuseparator");
        var entries = panels.selectAll ("g.menuitem");

        // Get entry bounding boxes
        var w = [];
        var h = [];
        var b = [];

        entries.each(function(d,i,j) {
            var box = cloneBBox(this.getBBox());
            if (w[j] == undefined) {
                b[j] = [];
                w[j] = [];
                h[j] = [];
            }
            b[j].push(box);
            w[j].push(box.width);
            h[j].push(box.height);
        });

        // layout each panel horizontally or vertically
        var sep = chart._entrySep;
        if (chart._direction [0] == 'h') {
            // Horizontal layout
            var xoffset = [];
            for (var j = 0; j < w.length; j++) {
                if (w[j] != undefined) {
                    xoffset[j] = lcg.arrange (w[j], chart._align, chart._rect[2], 0, chart.entrySep);
                }
            }
            entries.attr("transform", function(d,i,j) {
                return "translate("+xoffset[j][i]+"," + 0 + ")";
            });
        } else {
            // Vertical layout
            var yoffset = [];
            var sepsize = [];
            for (var j = 0; j < h.length; j++) {
                if (h[j] != undefined) {
                    yoffset[j] = lcg.arrange (h[j], chart._align, chart._rect[3], 0, chart._entrySep);
                    sepsize[j] = Math.max.apply(null, w[j]);
                }
            }
            entries.attr("transform", function(d,i,j) {
                return "translate("+ 0 +"," + (yoffset[j][i]-b[j][i].y) + ")";
            });
            separators.select("line")
                .attr ("x2", function (d,i,j) {
                    return w[j].length == 1 ? 0 : sepsize[j];
                })
                .attr ("y2", function (d,i,j) {
                    return w[j].length == 1 ? chart._rect[3] : 0;
                });

        }
        // Layout panels among themselves
        if (chart._direction [0] == 'h') {
            h = [];
            panels.each (function (d,i) {
                var box = this.getBBox();
                h [i] = box.height;
            });
            if (chart._equalSizedPanels) {
                var max = Math.max.apply(null, h);
                for (var i = 0; i < h.length; i++) 
                    if (h[i] > 5) h[i] = max;
            }
            var yoffset = lcg.arrange(h,chart._panelAlign,chart._rect[3],0,chart._panelSep);
            panels.attr("transform", function (d,i) {
                return "translate("+ 0 +"," + yoffset[i] + ")";
            });
        } else {
            w = [];
            panels.each (function (d,i) {
                var box = this.getBBox();
                w [i] = box.width;
            });
            if (chart._equalSizedPanels) {
                var max = Math.max.apply(null, w);
                for (var i = 0; i < w.length; i++) 
                    if (w[i] > 5) w[i] = max;
            }
            var xoffset = lcg.arrange(w,chart._panelAlign,chart._rect[2],0,chart._panelSep);
            panels.attr("transform", function (d,i) {
                return "translate("+xoffset[i]+"," + 0 + ")";
            });
        }

        // Resize backdrop rectangles
        var dx = chart._entryBackdropPad[0];
        var dy = chart._entryBackdropPad[1];
        var dw = chart._entryBackdropPad[0]+chart._entryBackdropPad[2];
        var dh = chart._entryBackdropPad[1]+chart._entryBackdropPad[3];
        entries.each(function(d,i,j) {
            var box = this.getBBox();
            d3.select(this).select(".entrybackdrop")
                .attr ("x", box.x-dx)
                .attr ("y", box.y-dy)
                .attr("width", (chart._direction [0] == 'h' ? box.width : w[j])+dw)
                .attr("height",box.height+dh);
        });

    }

    // This is the actual redraw code for key legends
    chart.redraw = function () {

        var _rh = chart._rSize; // Height of the key sample rectangle
        var _raspect = chart._rAspect; // Aspect ratio (width/height) for the sample rectangle
        var _ysep = chart._entrySep; // Vertical separation between keys 
        var _xsep = chart._rSep; // Horizontal separation between the rect and the text
        var _base = chart._labelOffset; // Displacement of the label text 
        var _round = chart._rRound;  // Radius of the rounded bevel of the rectangle
        
        // Start by removing everything
        chart._group.select(".menu").selectAll("g").remove();

        if (chart._data.length == 0) return chart;

        // Then create the panels
        var panels = chart._group.select(".menu").selectAll("g")
            .data(chart._data)
            .enter()
            .append ("g")
            .attr ("class", "menupanel");

        /* Create groups for holding samples and labels */
        var menuitems = panels.selectAll("g")
            .data (function (d) {return d;})
            .enter()
            .append("g")
            .attr("transform", function(d,i) {
                return "translate(0," + (i)*(_rh+_ysep)+ ")"
            })
            .classed ("menuitem", true);


        menuitems.append ("g")
            .classed ("menutitle", function (d,i) { return chart._isTitle(d,i) && !chart._isSeparator(d,i); })
            .classed ("menuseparator", function (d,i) { return chart._isSeparator(d,i); })
            .classed ("entry", function (d,i) { return chart._isEntry (d,i); })
            .append ("rect")
            .classed ("entrybackdrop", true)
            .attr ("opacity", 0)/*
            .attr ("fill", "white")*/;



        /* Selections for various classes */
        var textitems = panels.selectAll(".menutitle,.entry");
        var entries = panels.selectAll (".entry");
        var separators = panels.selectAll (".menuseparator");

        /* Attach callbacks only to real menu entries */
        entries.on ("click", chart._entryClick);

        /* Create sample rectangles */
        if (chart._showSample) {
            // Create the rectangles/images for each block
            entries.each (function (d,i,j) {
                var e = d3.select(this).append("g").classed("sample",true);
                var img = chart._imageSample (d,i);
                var icon = chart._iconPath (d,i);
                if (img) {
                    e = e.append ("image").attr ("xlink:href", img)
                        .attr ("width", _rh);
                } else if (icon) {
                    e = e.append("path").attr ("d", icon)
                        .attr ("transform", "scale("+chart._iconScale+","+chart._iconScale+")");
                } else {
                    e = e.append ("rect")
                        .attr ("width", _rh*_raspect)
                        .attr ("height", _rh)
                        .attr ("rx", _round)
                        .attr ("ry", _round);
                }
                e.style ("fill", chart._color(chart._category(d,i,j)));
            });
        } else {
            _rh = _xsep = 0;
        }

        // Create the legend texts for each block
        var textitems = textitems.append("svg:g")
            .attr ("class", "label");

        // Create two text tspans
        textitems.append ("text")
            .style ("text-anchor", chart._samplePos == "top" ? "middle" : "start")
            .attr ("dy", chart._labelOffset)
            .text (function (d) { 
                var txt = TL(chart._value(d)); 
                if (txt == undefined) return txt;
                var ar = txt.split ("|");
                if (ar.length > 1) {
                    ar.pop();
                    return ar.join(" ");
                }
                return txt;
            });
        textitems.append ("text")
            .style ("text-anchor", chart._samplePos == "top" ? "middle" : "start")
            .attr ("dy", chart._labelOffset+chart._textLineSep)
            .text (function (d) { 
                var txt = TL(chart._value(d)); 
                if (txt == undefined) return txt;
                var ar = txt.split ("|");
                if (ar.length > 1) {
                    return ar.pop();
                }
                return "";
            });

        // Create separator lines
        separators.append("line")
            .classed ("separator", true)
            .attr ("x1", 0)
            .attr ("y1", 0)
            .attr ("x2", 0)
            .attr ("y2", 0);

        chart._layoutEntries ();

        return chart;
    }
  
    return chart;
}

// Follow up a parent chain from a given node looking for the given class
// If found, the last element of the chain has the node with the sought class
// otherwise, returns undefined
lcg.parentChain = function (node, parentClass) {
    var chain = [];
    for (var i = 10; i > 0; i--) {
        chain.push(node);
        if (d3.select(node).classed(parentClass)) return chain;
        node = node.parentNode;
    }
}

// Obtain the translation of a selection as a [x,y] array

//lcg.getTranslation = function (sel) {
//    var transf = sel.attr("transform");
//    if (transf == undefined) return [0,0];
//  
//    var j = transf.search(/translate\s*\(\d+\.*\d*,\d+/g);
//    console.log(transf,j);
//    if (j < 0) return [0,0];    
//    transf = transf.substring(j)
//    var xstr = /\d+\.*\d*/.exec(transf);
//    var ystr = /,\d+\.*\d*/.exec(transf);    
//    var x = parseFloat(xstr[0]);
//    var y = parseFloat(ystr[0].substring(1));
//    return [x,y];
//}

lcg.getTranslation = function (sel) {
    var transf = sel.attr("transform");
    if (transf == undefined) return [0,0];
    var regex = /translate\s*\(([^\s,]+)\s*,?\s*([^\\s)]+)\s*\)/g;
    var parsedValues = regex.exec(transf);
    if(parsedValues)
    {
      var x = parseFloat(parsedValues[1]);
      var y = parseFloat(parsedValues[2]);
      return [x,y];
    }
    else 
    {
      return [0,0];
    }  
}

// Compose the translations of a chain and return the total translation
lcg.totalTranslation = function (chain) {
    var dx = 0, dy = 0;
    for (var i = 0; i < chain.length; i++) {
        var transl = lcg.getTranslation (d3.select(chain[i]));
        dx = dx+transl[0];
        dy = dy+transl[1];
    }
    return "translate("+ dx + ","+dy+")";
} 

// Attaches a hue selection submenu to a given selection
lcg.colorSubMenu = function () {

    // If true, colors from the stock are inserted and removed so as to ensure
    // that all used colors are unique
    var manageStock = true;  

    // If true, use hue colors, otherwise, use a fixed palette
    var usePalette = true;

    var obj = {}; // The submenu object

    // Returns a 100% saturated, 100%luminous color of the given hue (a value between 0 and 1)
    var hueColor = function (h) {
        return d3.rgb ("hsl("+(h*360)+",100%,50%)").toString();
    }

    // To fix IE11 issue, that does allow to modify rect bbox object
    function cloneBBox(rect) {
        return {x:rect.x, y:rect.y, width: rect.width, height:rect.height};
    }

    // Use a d3 color scale as the default
    //var palette = d3.scale.category20();
    var palette = [
        d3.rgb(255, 51, 0),
        d3.rgb(172, 31, 36),
        d3.rgb(255, 153, 0),
        d3.rgb(153, 102, 0),
        d3.rgb(221, 213, 33),
        d3.rgb(153, 153, 0),
        d3.rgb(108, 211, 60),
        d3.rgb(26, 138, 67),
        d3.rgb(28, 207, 211),
        d3.rgb(27, 138, 142),
        d3.rgb(98, 117, 184),
        d3.rgb(51,51,102),
        d3.rgb(183,118,204),
        d3.rgb(120,58,149),
        d3.rgb(217,58,117),
        d3.rgb(51,0,51),
    ];

    // The default stock of colors 
    var colorStock = [];
    var ncolors = palette.length;
    for (var i = 0; i < ncolors; i++) colorStock.push(usePalette? palette[i] : hueColor(i*1.0/ncolors));

    // Size of the dropdown circle
    var circleSize = 10; 

    // Callback when colors change
    obj.callback = function () {};

    // Attaches the dropdown circle to each element of a given d3 selection
    obj.attach = function (sel) {
        sel.each(function (d,i) {
            var box = this.getBBox();
            var sz = box.height;
            var margin = (sz - circleSize) / 2;
            var entry = d3.select(this);
            var circle = entry.select (".colorcircle");
            if (entry.classed ("selected")) {
                if (circle.size() == 0) {
                    // A selected entry with no circle -- add
                    circle = entry.append ("circle")
                        .classed ("colorcircle", true)
                        .attr ("cx", box.x + box.width - margin - circleSize/2)
                        .attr ("cy", box.y + sz / 2)
                        .attr ("r", circleSize / 2)
                        .style ("stroke", "white")
                        .style ("stroke-width", 2)
                        .attr ("fill", manageStock ? colorStock.splice(0,1)[0] : colorStock [0])
                        .on("click", function () {
                            d3.event.stopPropagation();
                            obj.showMenu (entry,circle,d,i) 
                        });                  
                }
            } else {
                if (circle.size() != 0) {
                    // a non-selected entry with a circle - remove
                    var color = circle.attr("fill");
                    if (manageStock) colorStock.splice(0,0,color);
                    circle.remove();
                }
            }
        });
    } 

    // Presents a menu for showing a menu for  the color of the circle
    obj.showMenu = function (entry,circle,d,i) {

        // Obtain the menu group following up the parent chain and the translation string 
        var chain = lcg.parentChain (entry.node(), "menu");
        var transl = lcg.totalTranslation(chain);
        var menu = d3.select(chain[chain.length-1]);
        // See if the menu already has a color chooser
        var chooserMenu = menu.select (".colorchooser");
        if (chooserMenu.size() == 0) {
            // Obtain the bounding box of the entry
            var box = cloneBBox (entry.node().getBBox());
            box.y += box.height;
            // Create the chooser menu
            chooserMenu = menu.append ("g")
                .classed ("colorchooser", true)
                .attr("transform",transl);
            var dx = box.width/colorStock.length;
            chooserMenu.selectAll ("rect")
                .data(colorStock)
                .enter()
                .append("rect")
                .attr ("x", function(d,i) { return box.x + i*dx; })
                .attr ("y", box.y)
                .attr ("width", dx+0.9)
                .attr ("height", box.height)
                .attr ("fill", function(d,i) { return d; })
                .on ("click", function (d,i) {
                    var oldColor = circle.attr("fill");
                    circle.attr("fill", colorStock.splice(i,1));
                    obj.callback();
                    if (manageStock) colorStock.splice(0,0,oldColor);
                    chooserMenu.remove();
                })
            obj.chooserMenu = chooserMenu;
        }
        else {
            // Destroy the menu
            chooserMenu.remove();
        }
    }

    return obj;
}

//
// A timeline menu/visualization. Depicts points along a straight line,
// which can be selected and thus used as a menu.
// The selected data can be obtained by calling the .selected ()
// method and an item can be selected by calling the .select () 
// method.
//
// Data is a collection of numbers.
//
// Example usage:
//     chart = lcg.timeline()
//             .parent("#mychart")
//             .data([ 2010, 2011, 2014 ]);
//
lcg.timeline = function () {

    var chart = lcg.chart(); // The object

    // Type of this menu: 'action' means no selection,
    // 'radio' means at most one selected,
    // 'check' means any entry may be selected / deselected
    chart._type = 'radio';

    // Geometry layout parameters
    chart._thickness = 5; // timeline thickness
    chart._intervalThickness = 2; // Thickness of the interval rectangles
    chart._r = 5; // Size of mark relative to one point along the timeline
    chart._rSel = 10; // Size of a selected mark
    chart._rAspect = 1.0; // width/height aspect ratio of marks
    chart._rRound = 5;  // Radius of the rounded bevel of the rectangle
    chart._selRRound = 10; // Radius of the rounded bevel of the selected rectangle
    chart._ppu = 50;  // Pixels per unit. Two data points with values a and b will be separated by (b-a)*_ppu pixels.
    chart._rangeOffset = 0; // Displacement of a range mark with respect to the timeline 
    chart._direction = 'horizontal'; // Either 'horizontal' or 'vertical'
    chart._anchorIndex = 0; // Index of the datum which should be shown at the focus point
    chart._focusPoint = [0,0];  // Where the anchor (e.g.: last selected) mark/point will be mapped
    chart._scroll = 0; // How much to scroll the whole drawing when the anchor is moved
    chart._fixedFocus = false;  // Whether the focus is fixed or floating
    chart._arrowSize = 10;  // Size of the scroll arrows
    chart._arrowDx = 10; // Arrow X displacement from the end of the timeline (negative makes it closer to the middle)
    chart._arrowDy = 0; // Arrow Y displacement away from the timeline (for h timelines, negative makes it lower than the main line)
    chart._quickArrowDx = 20; // Quick Arrow X displacement from the end of the timeline (negative makes it closer to the middle)
    chart._quickArrowDy = 0; // Quick Arrow Y displacement away from the timeline (for h timelines, negative makes it lower than the main line)
    chart._padding = 30; // internal padding space between elements and the border of the chart
    chart._drawArrows = true;  // whether to draw scroll arrows
    chart._hideArrows = false; // whether scroll arrows should auto-hide or not
    chart._markOffset = 0; // Displacement of marks and labels with respect to the timeline
    chart._summaryOffset = -10; // Displacement of the summary box with respect to the timeline
    chart._summaryRectPadding = [7,5,7,3]; // How much to dilate the summary box rect wrt the summary label (W,N,E,S)
    chart._labelOffset = 20; // Displacement of the label text with respect to the marks
    chart._selLabelOffset = 30; // Displacement of a selected label text with respect to the timeline

    // Function that computes the displacement of the label text with respect to the timeline
    chart._getLabelOffset = function (d,i) { return chart._labelOffset; } 

    // Functio to compute displacement of a selected label text with respect to the timeline
    chart._getSelLabelOffset = function (d,i) { return chart._selLabelOffset; }

    // Function that tells if an entry will be labeled with class "major" or not
    chart._isMajor = function (d,i) { return false; }

    // Function that tells if an entry is active
    chart._isActive = function (d,i) { return true };

    // Allows entries to be selected in groups
    chart._grouping = function (d,i) { return i; } // By default, each group is a singleton

    // Uber object holds methods we will rewrite and
    // which will access the superclass' original methods
    var uber = {
        parent: chart.parent,
        resize: chart.resize,
        data: chart.data
    };

    // Sets/gets the parent container. Initializes the chart.
    chart.parent = function (p) {
        if (!arguments.length) return uber.parent();
        uber.parent(p);
        // Create a clipping rectangle to allow scrolling
        // within a restricted area of the svg
        chart._clipId = chart._group.attr("id")+"clip";
        chart._group.append ("clipPath")
            .attr ("id", chart._clipId)
            .append ("rect")
            .attr ("fill", "gray");
        // Create a group for holding the marks & labels
        // attached to the clipping rectangle     
        chart._group.append ("g")
            .attr ("class", "timeline")
            .style ("clip-path", "url(#"+chart._clipId+")");
        
        return chart;
    }

    // processes new data
    chart.data = function (d) {

        // Build a special "data" with consecutive pairs of data items for
        // drawing the intervals between marks
        chart._intervals = [];
        if (d.length > 1 && typeof d[0] == "number") {
            for (var i = 1; i < d.length; i++) 
                chart._intervals.push ([d[i-1],d[i]]);
        }

        // Store the data
        var ret = uber.data(d);


        // Redraw
        chart.resize();

        // Draw arrows
        chart._renderArrows ();
        return ret;
    }    
    
    // Sets / gets the interaction type
    chart.type = function (t) {
        return chart.set('type', t);
    }

    // Sets / gets the layout direction (h/v)
    chart.direction = function (d) {
        var ret = chart.set('direction', d);
        chart.resize();
        return ret;
    }

    // The arrow size 
    chart.arrowSize = function (s) {
        var ret = chart.set ("arrowSize", s);
        chart.resize();
        return ret;
    }

    // Called whenever the chart geometry changes, e.g., through calling
    // size or position
    chart.resize = function () {
        uber.resize();
        var x0 = chart._rect[0];
        var y0 = chart._rect[1];
        var asize = chart._arrowSize;
        var horizontal = chart._direction[0] == "h";
        chart._group.attr("transform", "translate(" + x0 + "," + y0 + ")");


        // Compute a position for the focus
        if (!chart._fixedFocus && chart._data.length > 0) {
            // Compute the range of the data
            var ppu = chart._ppu;
            var anchor = chart._data [chart._anchorIndex];
            var range = chart._dataRange();
            var dmin = range[0];
            var dmax = range[1];

            // Figure out where the first datum goes
            var padding = chart._padding;
            var space = (horizontal ? chart._rect[2] : chart._rect[3])-2*padding;
            var range = (dmax-dmin)*ppu;
            var first = // Position of the first datum
                (range <= space) ?
                // center range 
                padding + (space-range) / 2 :
                // left justify
                padding;

            // set the focus
            chart._focusPoint = horizontal ? 
                                [first+(anchor - dmin)*ppu, chart._rect[3]/2] :
                                [chart._rect[2]/2, first+(anchor - dmin)*ppu];
        }
        else {
            // map focus point to center of the chart
            chart._focusPoint = [chart._rect[2]/2, chart._rect[3]/2]; 
        }

        // Set the clip rectangle for the whole chart
        chart._group.select("#"+chart._clipId+" rect")
            .attr ("width", chart._rect[2])
            .attr ("height", chart._rect[3]);

        // Set the arrows position
        var asize = chart._arrowSize/2;
        var padding = chart._padding;
        var dx = chart._arrowDx;
        var dy = chart._arrowDy;
        var qdx = chart._quickArrowDx;
        var qdy = chart._quickArrowDy;
        var w = chart._rect[2];
        var h = chart._rect[3];
        if (horizontal) {
            chart._group.select (".rightArrow")
                .attr ("transform", "translate("+(w+asize+dx)+","+(h/2+dy)+") scale("+asize+")");
            chart._group.select (".leftArrow")
                .attr ("transform", "translate("+(-asize-dx)+","+(h/2+dy)+") scale("+asize+")");
            chart._group.select (".lastArrow")
                .attr ("transform", "translate("+(w+asize+qdx)+","+(h/2+qdy)+") scale("+asize+")");
            chart._group.select (".firstArrow")
                .attr ("transform", "translate("+(-asize-qdx)+","+(h/2+qdy)+") scale("+asize+")");
        }
        else {
            chart._group.select (".rightArrow")
                .attr ("transform", "translate("+(w/2+dy)+","+(h+asize+dx)+") scale("+asize+") rotate (90)");
            chart._group.select (".leftArrow")
                .attr ("transform", "translate("+(w/2+dy)+","+(-asize-dx)+") scale("+asize+") rotate(90)");   
            chart._group.select (".lastArrow")
                .attr ("transform", "translate("+(w/2+qdy)+","+(h+asize+qdx)+") scale("+asize+") rotate (90)");
            chart._group.select (".firstArrow")
                .attr ("transform", "translate("+(w/2+qdy)+","+(-asize-qdx)+") scale("+asize+") rotate(90)");   
        }
        return chart;
    }   

    // Call function f for each selected item
    chart.selected = function (f) {
        chart._group.selectAll(".entry.selected").each(f);
    }

    // Return an array of all selected data
    chart.selectedData = function () {
        var a = [];
        chart.selected (function (d,i) { 
            a.push (d);
        });
        return a;
    }

    // Return an array with all selected data indices
    chart.selectedIndices = function () {
        var a = [];
        chart._group.selectAll (".entry").each (function (d,i) { 
            if (d3.select(this).classed("selected")) a.push (i);
        });
        return a;
    }

    // This function returns the value of the d attribute for a path drawing of a mark.
    // geom is a descriptor of the geometry, with fields x, y, width, height, r and sel
    chart._markPath = function (d, sel) {
        var geom = chart.markGeometry (d, sel);
        return lcg.roundRectPath (geom.x, geom.y, geom.width, geom.height, [1,1,1,1], 0);
    }

    // Returns an array with geometry parameters of a datum d which is considered 
    // selected (sel=true) or not
    chart.markGeometry = function (d, sel) {
        // The radius
        var r = sel ? chart._rSel : chart._r;
        // If there's a dash in the datum tells then d is a range datum
        var dash = String(d).indexOf ("-");
        // The return object
        var R = r * chart._rAspect;
        var ret = {"x" : -R, "y": -r, "r": sel?chart._rRound:chart._selRRound, "width": 2*R, "height" : 2*r };
        // Adjust for range datum
        if (dash >= 0) {
            size = (parseInt(d.substring (dash+1)) - parseInt(d.substring(0,dash)))*chart._ppu;
            if (chart._direction[0] == 'h') {
                ret.y += chart._rangeOffset;
                ret.width += size;
            }
            else {
                ret.x += chart._rangeOffset;
                ret.height += size;
            }
        }
        return ret;  
    } 

    // Computes the grouping closure of an array of data indices
    chart._groupingClosure = function (idx) {
        var selGroups = [];
        for (var j = 0; j < idx.length; j++) {
            var i = idx[j];
            var g = chart._grouping(chart._data[i],i);
            if (g != undefined && selGroups.indexOf(g) < 0) {
                selGroups.push(g);
            }
        }
        var res = [];
        for (var i = 0; i < chart._data.length; i++) {
            var g = chart._grouping(chart._data[i],i);
            if(selGroups.indexOf(g) >= 0) {
                res.push(i);
            }
        }
        return res;
    }

    // Selects or deselects entries based on a given boolean function or a list of indices
    chart.select = function (f) {
        var rsel = chart._rSel;
        var r = chart._r;
        var horiz = (chart._direction[0] == 'h');
        // Prepare an array of selected indices in case f isn't an array
        if (typeof(f) == "function") {
            var tmp = [];
            for (var i = 0; i < chart._data.length; i++) {
                if (f(chart._data[i],i)) tmp.push(i);
            }
            f = tmp;
        } 
        f = chart._groupingClosure (f);
        // Select each entry
        chart._group.selectAll(".entry").each(function (d,i) {
            // Whether this entry is selected
            var sel = f.indexOf(i) >= 0;
            var ent = d3.select(this);
            var D = chart._getLabelOffset(d,i) > 0 ? rsel-r : r-rsel;
            var amt = chart._getLabelOffset (d,i);
            var selamt = chart._getSelLabelOffset (d,i) + D;
            var offset = horiz ? [0, amt] : [amt, 0];
            var selOffset = horiz ? [0, selamt] : [selamt, 0];
            if (ent.classed("selected") != sel) {
                // The geometry 
                var geom = chart.markGeometry (d, sel);
                ent
                    .classed("selected", sel)
                    .select(".mark")
                        .transition().duration(chart._duration/2)
                        .attr("d", chart._markPath (d,sel));
                if (sel) {
                    ent.select(".label")
                        .transition().duration(chart._duration/2)
                        .attr ("dx", selOffset[0])
                        .attr ("dy", selOffset[1]);
                }
                else {
                    ent.select(".label")
                        .transition().duration(chart._duration/2)
                        .attr ("dx", offset[0])
                        .attr ("dy", offset[1]);
                }
            }
        });
        // Select as anchor the first selected entry
        var sel = chart.selectedIndices();
        if (sel.length > 0) chart.anchorIndex(sel[0]);
        // Re-render the summary box
        chart._renderSummary();
        return chart;
    };

    // Makes entries active or inactive on a given boolean function or a list of indices
    chart._setActive = function () {
        var f = chart._isActive;
        chart._group.selectAll(".entry").each(function (d,i) {
            if (typeof(f) == "function") 
                d3.select(this).classed("inactive", !f(d,i)); 
            else {
                d3.select(this).classed("inactive", !(f.indexOf(i) >= 0)); 
            }
        });
        chart._group.selectAll(".interval").each (function (d,i) {
            var ileft = i;
            var iright = i+1;
            var dleft = chart._data[ileft];
            var dright = chart._data[iright];
            d3.select(this)
                .classed ("inactive", !(chart._isActive(dleft,ileft) && chart._isActive(dright,iright)))
        });
        return chart;
    };

    // Returns an array of the active entries
    chart._getActive = function () {
        var ret = [];
        chart._group.selectAll(".entry").each(function (d,i) {
            if (!d3.select(this).classed("inactive")) ret.push (d); 
        });
        return ret;
    }

    // Sets/gets the focused datum by index
    chart.anchorIndex = function (i) {
        if (!arguments.length) return chart._anchorIndex;
        if (i < chart._data.length) {
            chart._scroll = (chart._data[i] - chart._data[chart._anchorIndex])*chart._ppu;
            chart._anchorIndex = i;
        }
        if (chart._anchorIndex < chart._data.length) chart._layoutEntries();
        return chart;
    }

    // Sets/gets the focused datum  
    chart.anchor = function (d) {
        var i = chart._data.indexOf(d);
        if (i>=0) return chart.anchorIndex(i);
        return chart;
    }

    // What is done when a menu entry is clicked
    chart._entryClick = function (d, i) {
        if (!chart._isActive(d,i)) return; // Ignore if not active
        chart.anchorIndex(i);
        if (chart._type == 'radio') {
            var g = chart._grouping (d,i);
            var s = [];
            for (var j = 0; j < chart._data.length; j++)
                if (chart._grouping (chart._data[j],j) == g) s.push(j);
            chart.select(s);
        } 
        else if (chart._type == 'check'){
            var sel = chart.selectedIndices ();
            var pos = sel.indexOf(i);
            if (pos < 0) sel.push(i); 
            else sel.splice(pos, 1)
            chart.select(sel);
        } 
        chart._onClick (d,i);
    }

    // A callback listener for a click on the timeline itself. Figures
    // out which entry is nearest and simulates a click on it   
    chart._lineClick = function () {
        var coords = d3.mouse(this);
        chart._group.select(".timeline").selectAll (".entry").each (function (d,i) {
            var entry = d3.select (this);
            if (!entry.classed ("inactive")) {
                var box = this.getBBox ();
                var transl = lcg.getTranslation (entry);
                var boxCenter = box.x + box.width/2 + transl[0];
                if (Math.abs(boxCenter-coords[0]) < chart._ppu/2) {
                    chart._entryClick (d,i);
                }
            }
        });
    }

    // Returns the index of the next selectable element to the right of the anchor,
    // or -1 if none exists
    chart._nextIndex = function () {
        var i = chart.anchorIndex();
        var g = chart._grouping (chart._data[i],i);
        while (i+1 < chart._data.length) {
            i++;
            if (chart._isActive(chart._data[i],i) && chart._grouping (chart._data[i],i) != g) return i;
        }
        return -1;
    }

    // Returns the value of the next selectable element to the right of the anchor,
    // or undefined if none exists
    chart._nextValue = function () {
        var i = chart._nextIndex();
        if (i >= 0) return chart._data[i];
    }

    // Emulates a click to the point to the right of the current anchor
    chart._nextClick = function () {
        var i = chart._nextIndex();
        if (i>=0) chart._entryClick ("", i);
    }

    // Emulates a click to the point to the right of the current anchor
    chart._prevClick = function () {
        var i = chart.anchorIndex();
        if (i-1 >= 0) chart._entryClick ("", i-1);
    }


    // Callback to move to first active entry
    chart._firstClick = function () {
        var first = -1;
        chart._group.selectAll(".entry").each(function (d,i) {
            if (!d3.select(this).classed("inactive") && first == -1) first = i; 
        });
        if (first != -1) chart._entryClick ("", first);
    }    

    // Callback to move to first active entry
    chart._lastClick = function () {
        var last = -1;
        chart._group.selectAll(".entry").each(function (d,i) {
            if (!d3.select(this).classed("inactive")) last = i; 
        });
        if (last != -1) chart._entryClick ("", last);
    }

    // If the anchor is floating, computes a scroll value for showing the 
    // anchor point
    chart._setScroll = function () {
        if (chart._scroll != 0) {
            var padding = chart._padding;
            var w = chart._rect[2];
            var h = chart._rect[3];
            if (chart._direction [0] == 'h') {
                chart._focusPoint[0] += chart._scroll;
                if (chart._focusPoint[0] < padding) chart._focusPoint[0] = padding;
                if (chart._focusPoint[0] > w-padding) {
                    chart._focusPoint[0] = w-padding;
                }
            } else {
                chart._focusPoint[1] += chart._scroll;
                if (chart._focusPoint[1] < padding) chart._focusPoint[1] = padding;
                if (chart._focusPoint[1] > h-padding) chart._focusPoint[1] = h-padding;
            }
            chart._scroll = 0;
        }
    }

    // Compute the range of the data
    chart._dataRange = function () {
        var ppu = chart._ppu;
        var dmin = 1e10;
        var dmax = -1e10;
        for (var i = 0; i < chart._data.length; i++) {
            var d = chart._data[i];
            if (typeof d == "string") {
                var v = d.split ("-");
                if (v.length > 1) {
                    a = parseInt(v[0]);
                    b = parseInt(v[1]);
                    if (a < dmin) dmin = a;
                    if (b > dmax) dmax = b;
                }
                else {
                    d = parseInt (d);
                    if (d < dmin) dmin = d;
                    if (d > dmax) dmax = d;
                }
            }
            else {
                if (d < dmin) dmin = d;
                if (d > dmax) dmax = d;
            }
        }
        return [dmin,dmax];
    }

    // Returns a single number representative of the datum (for range values)
    chart._dataValue = function(d) {
        d = String(d);
        var dash = d.indexOf ("-");
        var ret = parseFloat (d);
        if (dash>=0) {
            ret += (parseInt(d.substring (dash+1)) - parseInt(d.substring(0,dash)))/2;
        }
        return ret;
    }

    // Rearranges the entries horizontally or vertically within the chart's rect
    chart._layoutEntries = function () {
        // Find the anchor and move the focus if not fixed
        var anchor = chart._dataValue(chart._data[chart._anchorIndex]);
        if (!chart._fixedFocus) chart._setScroll();
        var fx = chart._focusPoint[0];
        var fy = chart._focusPoint[1];
        var horiz = chart._direction [0] == 'h';
        var mdx = horiz ? 0 : chart._markOffset;
        var mdy = horiz ? chart._markOffset : 0;

        // Select the entries
        var entries = chart._group.selectAll (".entry");
        
        // The connecting line
        var line = chart._group.selectAll (".line");

        // Compute the range of the data
        var ppu = chart._ppu;
        var range = chart._dataRange();
        var dmin = range[0];
        var dmax = range[1];

        if (horiz) {
            // Horizontal layout

            // Layout intervals
            chart._group.selectAll (".interval").transition().duration(chart._duration/2).attr("transform", function(d,i) {
                var x = fx + (d[0] - anchor) * ppu;
                return "translate(" + x + "," + (fy+mdy) + ")";
            })
            entries.transition().duration(chart._duration/2).attr("transform", function(d,i) {
                var dval = chart._dataValue(d);
                var delta = parseFloat(d)-dval;
                var x = fx + (chart._dataValue(d) - anchor + delta) * ppu;
                return "translate(" + x + "," + (fy+mdy) + ")";
            })
            var lmin = fx + (parseFloat(dmin) - anchor) * ppu;
            var lmax = fx + (parseFloat(dmax) - anchor) * ppu;
            line.transition().duration(chart._duration/2)
                .attr ("x", lmin)
                .attr ("width", lmax-lmin)
                .attr ("y", fy-chart._thickness/2)
                .attr ("height", chart._thickness);
            if (chart._hideArrows) {
                chart._group.select (".leftArrow")
                    .attr ("visibility", lmin < 0 ? "inherit" : "hidden");
                chart._group.select (".rightArrow")
                    .attr ("visibility", lmax > chart._rect[2] ? "inherit" : "hidden");
            }
        }
        else {
            // vertical layout
            entries.transition().duration(chart._duration/2).attr("transform", function(d,i) {
                var y = fy + (chart._dataValue(d) - anchor) * ppu;
                return "translate(" + (fx+mdx) + "," + y + ")";
            });
            var lmin = fy + (parseFloat(dmin) - anchor) * ppu;
            var lmax = fy + (parseFloat(dmax) - anchor) * ppu;
            line.transition().duration(chart._duration/2)
                .attr ("y", lmin)
                .attr ("height", lmax-lmin)
                .attr ("x", fx-chart._thickness/2)
                .attr ("x2", chart._thickness);
            if (chart._hideArrows) {
                chart._group.select (".leftArrow")
                    .attr ("visibility", lmin < 0 ? "inherit" : "hidden");
                chart._group.select (".rightArrow")
                    .attr ("visibility", lmax > chart._rect[3] ? "inherit" : "hidden");
            }
        }
    }


    // Renders the navigation arrows
    chart._renderArrows = function () {
        if (chart._drawArrows && chart._group.select("g.arrows").size() == 0) {
            var arrows = 
                chart._group.append ("g")
                .attr ("class", "arrows");
            var right = arrows.append ("path")
                .attr ("class", "rightArrow")
                .attr ("d", "M1,0 L-0.5,0.87  L-0.5,-0.87 L1,0 z")
                .on ("click", chart._nextClick);
            var left = arrows.append ("path")
                .attr ("class", "leftArrow")
                .attr ("d", "M-1,0 L0.5,0.87 L0.5,-0.87 L-1,0 z")
                .on ("click", chart._prevClick);
            var first = arrows.append ("path")
                 .attr ("class", "firstArrow")
                 .attr ("d", "M-1,0 L-0.25,0.87 L -0.25,0 L0.5,0.87 L0.5,-0.87 L-0.25,0 L-0.25,-0.87  z")
                 .on ("click", chart._firstClick);
            var last = arrows.append ("path")
                 .attr ("class", "lastArrow")
                 .attr ("d", "M1,0 L0.25,0.87 L 0.25,0 L-0.5,0.87 L-0.5,-0.87 L0.25,0 L0.25,-0.87  z")
                 .on ("click", chart._lastClick);
        }
    }

    // Computes the summary position as the barycenter of all selected items
    chart._summaryPosition = function () {
        var anchor = chart._dataValue(chart._data[chart._anchorIndex]);
        var fx = chart._focusPoint[0];
        var fy = chart._focusPoint[1];
        var horiz = chart._direction [0] == 'h';
        var dx = horiz ? 0 : chart._summaryOffset + chart._thickness/2;
        var dy = horiz ? chart._summaryOffset + chart._thickness/2 : 0;
        var sdata = chart.selectedData();
        var sum = 0;
        for (var i = 0; i < sdata.length; i++) sum += parseInt(sdata[i]);
        var d = sum / sdata.length;
        return horiz ? [fx + (d-anchor)*chart._ppu, fy + dy]
                     : [fx + dx, fy + (d-anchor)*chart._ppu];   
    }

    // Returns an estimate label for the data at the given x position
    chart._xlabel = function (x) {
        var fx = chart._focusPoint[0];
        var anchor = chart._dataValue(chart._data[chart._anchorIndex]);
        return parseInt((x-fx)/chart._ppu+anchor);
    }

    // Computes a value for the summary label
    chart._summaryLabel = function () {
        var sdata = chart.selectedData();
        if (sdata.length == 0) return "";
        if (sdata.length == 1) return parseInt(sdata[0]);
        return sdata[0]+"-"+sdata[sdata.length-1];
    }

    // Renders the selection summary box
    chart._renderSummary = function () {
        // Remove all 
        chart._group.select (".timeline").selectAll ("g.summary").remove();
        // Add again
        var label = chart._summaryLabel();
        if (label == "") return;
        var pos = chart._summaryPosition();
        var summary = 
            chart._group.select (".timeline").append ("g")
            .attr ("class", "summary");
        var rect = summary.append ("rect")
            .attr ("class", "backdrop");
        var text = summary.append ("text")
            .text (label)
            .attr ("class", "label")
            .attr ("text-anchor", "middle")
            .attr ("x", pos[0])
            .attr ("y", pos[1]);
        // Adjust rect w.r.t. label
        var textbox = summary.node().getBBox();
        var pad = chart._summaryRectPadding;
        rect.attr ("x", textbox.x-pad[0])
            .attr ("y", textbox.y-pad[1])
            .attr ("width", textbox.width + pad[0]+pad[2])
            .attr ("height", textbox.height + pad[1]+pad[3]); 

        // Set up dragging behavior
        var dx = 0;
        var saveIndices = chart.selectedIndices();
        var setdx = function () {
            chart._group.select (".timeline g.summary")
                .attr ("transform", "translate("+dx+",0)")
                .select(".label")
                .text (chart._xlabel(pos[0]+dx));
        }
        var drag = d3.behavior.drag()
            .on("dragstart", function(){
                dx = 0;
                setdx();
            })
            .on("drag", function(){
                dx += d3.event.dx;
                setdx();
            })
            .on("dragend", function(){
                var val = chart._xlabel(pos[0]+dx);
                var i = chart._data.indexOf (val);
                if (i < 0) {
                    val = val+"";
                    i = chart._data.indexOf(val);
                }
                //var sel = (i >= 0) && chart._isActive(val,i) ? [i] : saveIndices;
                //chart.select(sel);
                if (i>=0 && chart._isActive(val,i)) {
                    chart._entryClick(val,i);
                }
                else {
                    chart._entryClick (chart._data[saveIndices[0]],saveIndices[0]);
                }
            });
        summary.call (drag);
    }

    // Redraws the chart for new data
    chart.redraw = function () {

        // Start by removing everything
        chart._group.select(".timeline").selectAll(".line,.interval,.entry").remove();

        // Then append
        var entries = chart._group.select(".timeline").selectAll("g .entry")
            .data(chart._data);

        // Quit if nothing is to be redrawn
        if (chart._data.length == 0) return chart;

        var horiz = (chart._direction[0] == 'h');
        

        var padding = chart._padding;
        var w = chart._rect[2];
        var h = chart._rect[3];

        // Create a rect for the timeline itself
        chart._group.select(".timeline")
            .append ("rect")
            .attr ("x", horiz ? 0 : (w-chart._thickness)/2)
            .attr ("y", horiz ? (h-chart._thickness)/2 : 0)
            .attr ("width", horiz ? w : chart._thickness)
            .attr ("height", horiz ? chart._thickness : h)
            .attr ("class", "backgroundline");
        chart._group.select(".timeline")
            .append ("rect")
            .attr ("class", "line")
            .on ("click", chart._lineClick);


        // Create interval marks
        if (chart._intervals) {
            var intervals = 
                chart._group.select(".timeline")
                    .selectAll (".interval")
                    .data(chart._intervals)
                    .enter()
                    .append ("rect").classed("interval",true);
            var ithick = chart._intervalThickness;
            intervals.each (function (d,i) {
                var ileft = i;
                var iright = i+1;
                var dleft = chart._data[ileft];
                var dright = chart._data[iright];
                d3.select(this)
                    .classed ("inactive", !(chart._isActive(dleft,ileft) && chart._isActive(dright,iright)))
                    .attr ("x", 0)
                    .attr ("y", -ithick)
                    .attr ("width", (d[1]-d[0])*chart._ppu)
                    .attr ("height", ithick);
            });
        }

        // Create blocks for holding marks and legends
        var elemEnter = entries.enter()
            .append("g")
            .on ("click", chart._entryClick)
            .attr ("class", "entry")
            .classed ("major", chart._isMajor)
            .classed ("inactive", function (d,i) { return !chart._isActive (d,i); });


        // Create the marks for each block
        elemEnter.each (function (d,i) {
            var ent = d3.select (this);
            ent.append("svg:path")
                .attr ("class", "mark")
                .attr ("d", chart._markPath (d,false));
        });

        // Create the legend texts for each block
        elemEnter.each (function (d,i) {
            var geom = chart.markGeometry (d, false);
            var x = geom.x+geom.width/2;
            var y = geom.y+geom.height/2;
            var ent = d3.select (this);
            var offset = chart._getLabelOffset (d,i);
            ent.append("svg:text")
            .attr ("class", "label")
            .text (function (d) { return chart._value(d); })
            .attr ("x", x)
            .attr ("y", y)
            .attr ("dx", horiz ? 0 : offset)
            .attr ("dy", horiz ? offset : 0)
            .attr ("text-anchor", horiz ? "middle" : "start");
        });

        chart._layoutEntries ();
        chart._renderSummary ();
        return chart;
    }
  
    return chart;
}

//
// This is an utility function that returns a clone of obj
// for simple object types
//
lcg.clone = function (obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = lcg.clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = lcg.clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}


// Utility function to draw balloon callouts
lcg.balloon = function () {

    // The default arguments for the balloon callout drawing function
    var _x = function (d) { return 0; },
        _y = function (d) { return 0; }, 
        _text = function (d) { return "a text"},
        _margin = lcg.defaults['balloonMargin'],
        _r = lcg.defaults['balloonR'],
        _dx = lcg.defaults['balloonDx'],
        _dy = lcg.defaults['balloonDy'];


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

    // The drawing function itself
    function draw (sel) {
        
        // Add text elements for the labels
        var text = sel.append ("text")
            .attr ("class", "label")
            .attr ("x", _x)
            .attr ("y", function (d,i) { return _y (d,i) - _dy - _margin; })
            .style ("text-anchor", "middle")
            .text (_text);
        
        // Take note of their bounding boxes
        text.each(function (d) { 
            d.calloutBox = this.getBBox(); 
        });
        
        // ... and remove them. We need to redraw them later on top of the
        // callout boxes
        text.remove();

        // The balloon
        sel.append ("path")
            .attr ("d", function (d) { return balloonSvgPath (d.calloutBox, _margin, _r, _dx, _dy) });

        // The label       
        sel.append ("text")
            .attr ("class", "label")
            .attr ("x", _x)
            .attr ("y", function (d,i) { return _y (d,i) - _dy - _margin; })
            .style ("text-anchor", "middle")
            .text (_text);

    }

    // Function that alters the default _text function
    draw.text = function (newtext) {
        _text = newtext;
        return draw;
    }


    // Function that alters the default _x function
    draw.x = function (newx) {
        _x = newx;
        return draw;
    }

    // Function that alters the default _y function
    draw.y = function (newy) {
        _y = newy; 
        return draw;
    }

    // Function that alters the default _margin value
    draw.margin = function (newmargin) {
        _margin = newmargin; 
        return draw;
    }

    // Function that alters the default _dx value
    draw.dx = function (newdx) {
        _dx = newdx; 
        return draw;
    }

    // Function that alters the default _dx value
    draw.dy = function (newdy) {
        _dy = newdy; 
        return draw;
    }

    return draw;
}

// A hierarchical table implemented with d3's treemap layout.
// Data is an hierarchy of arrays  An array at odd/even levels
// splits the chart rectangle vertically/horizontally. By 
// default, each cell is drawn as a simple colored rect, but
// you can plug in your own cell function to draw whatever.
// 
// Typical usage: 
// 
//    var data = 
//      {  name: "",
//         children: [{
//            children: [
//              { name: "a", size: 10 },
//              { name: "", 
//                children: [
//                  { name: "b1", size: 5 },
//                  { name: "b2", size: 5 }
//                ]
//             },
//              { name: "c", size: 10 }
//            ]
//          }]
//       };
//     var htable  = lcg.htable ()
//        .parent("#mychart")
//        .data(data) 
//
lcg.htable = function () {

    var chart = lcg.chart(); // The object

    // This is the function for drawing each cell of the table
    chart._cell = function () {
      this.append ("rect");
      this.append ("text");
      return this;
    };

    // This is the function for updating each cell of the table
    chart._cellUpdate = function () {
      this.select ("rect")
        .attr ("x", function(d) { return d.x + "px"; })
        .attr ("y", function(d) { return d.y + "px"; })
        .attr ("width", function(d) { return Math.max(0, d.dx) + "px"; })
        .attr ("height", function(d) { return Math.max(0, d.dy) + "px"; })
        .attr ("fill", function (d,i) { 
            if (d.children == undefined) return chart._color(chart._category (d,i)); 
            return "white"; 
        });
      this.select ("text")
        .attr ("x", function(d) { return d.x + d.dx/2 })
        .attr ("y", function(d) { return d.y + d.dy/2 })
        .style ("text-anchor", "middle")
        .text (function (d) { if (d.name == undefined) return ""; return d.name; });
      return this;
    };

    // Accessors for the _cell and _cellUpdate functions
    chart.cell = function (c) {
        if (c == undefined) return c;
        chart._cell = c;
        return chart;
    }

    chart.cellUpdate = function (c) {
        if (c == undefined) return c;
        chart._cellUpdate = c;
        return chart;
    }


    // Uber object holds methods we will rewrite and
    // which will access the superclass' original methods
    var uber = {
        parent: chart.parent,
        resize: chart.resize,
        data: chart.data
    };

    // Sets/gets the parent container. Initializes the chart.
    chart.parent = function (p) {
        if (!arguments.length) return uber.parent();
        uber.parent(p);
        return chart;
    }
    
    // Called whenever the chart geometry changes, e.g., through calling
    // size or position
    chart.resize = function () {
        uber.resize();
        var r = Math.min(chart._rect[2], chart._rect[3])/2;
        var x0 = chart._rect[0];
        var y0 = chart._rect[1];
        chart._group.attr("transform", "translate(" + x0 + "," + y0 + ")");
        return chart;
    }   

    // Change the order of the children of d
    function reverseData (d) {
        if (d.children != undefined) {
            d.children.reverse();
            for (var i in d.children) {
                d.children[i] = reverseData (d.children[i]);
            }
        }
        return d;
    } 

    // This is the actual redraw code for square pile charts
    chart.redraw = function () {

        // By default, first children appear last, so build 
        // a copy of the input data where children are reversed
        var data = reverseData (lcg.clone(chart._data));

        var treemap = d3.layout.treemap()
            .size([chart._rect[2], chart._rect[3]])
            .sticky(true)
            .mode ("slice-dice")
            .sort (null)
            .value(function(d) { return d.size; });

        var node = chart._group.datum(data).selectAll(".node")
            .data(treemap.nodes);

        // Update
        node.call (chart._cellUpdate);

        // Exit
        node.exit ().remove();

        // Enter
        node.enter().append("g")
            .attr("class", "node")
            .call(chart._cell)
            .call(chart._cellUpdate);


        return chart;
    }

    return chart;
}

//
// A pie chart.
// Data is a collection of values.
// Example usage:
//     chart = lcg.pie()
//             .parent("#mychart")
//             .data([ 1, 10, 5, 20 ])
//
lcg.pie = function () {

    var
    chart = lcg.chart(), // The object
    arc, // Function for mapping angles to disks
    donut; // Function for mapping data to angles

    chart._sliceOffset = lcg.defaults.pieSliceOffset; // How much to offset the slice when clicked
    chart._labelOffset = lcg.defaults.pieLabelOffset; // How much to offset the label
    chart._sizeRatio = lcg.defaults.pieSizeRatio; // How much of the chart to use for the pie proper
    chart._radiusRatio = lcg.defaults.pieRadiusRatio; // Scale the radius by this factor 


    //
    // Sets the chart's radius ratio value
    // v : the new value
    chart.radiusRatio = function (v) {
        chart._radiusRatio = v;
        return chart.resize();
    }

    // Uber object holds methods we will rewrite and
    // which will access the superclass' original methods
    var uber = {
        parent: chart.parent,
        resize: chart.resize
    };

    // Sets/gets the parent container. Initializes the chart.
    chart.parent = function (p) {
        if (!arguments.length) return uber.parent();
        uber.parent(p);
        // Create a group for holding the slices
        chart._group.append ("g")
            .attr ("class", "pie");
        // Create a function for laying out the pie slices from values
        donut = d3.layout.pie().sort(null)
                .value(function (d) { return chart._value(d) });
        return chart;
    }
    
    // Called whenever the chart geometry changes, e.g., through calling
    // size or position
    chart.resize = function (s) {
        uber.resize(s);
        chart.r = (Math.min(chart._rect[2], chart._rect[3])/2*chart._sizeRatio)*chart._radiusRatio;
        var x0 = chart._rect[0]+chart._rect[2]/2;
        var y0 = chart._rect[1]+chart._rect[3]/2;
        arc = d3.svg.arc().outerRadius(chart.r).innerRadius(0);
        chart._group.attr("transform", "translate(" + x0 + "," + y0 + ")");
        return chart;
    }   
    
    // Store the currently-displayed angles in this._current.
    // Then, interpolate from this._current to the new angles.
    function arcTween(a) {
       if (this._current == undefined) {
          this._current = {value:0};
       }
       var i = d3.interpolate(this._current, a);
       this._current = i(0);
       return function(t) {
          return arc(i(t));
       };
    }

    // Returns the centroid of the slice corresponding to d offseted by ratio 
    function offsetCentroid (d, ratio) {
        var center = arc.centroid(d);
        return [center[0]*ratio, center[1]*ratio];
    }

    // Decides the type of anchor for a label based on the slice geometry
    function labelAnchor (d) {
        var ang = (d.startAngle + d.endAngle) / 2;
        if (ang > Math.PI / 8 && ang < Math.PI * 7 / 8) return "start";
        if (ang > Math.PI * 9 / 8 && ang < Math.PI * 15 / 8) return "end";
        return "middle";
    }

    // Decides the y offset for a label based on the slice geometry
    // Decides the type of anchor for a label based on the slice geometry
    function labelDy (d) {
        var ang = (d.startAngle + d.endAngle) / 2;
        if (ang <= Math.PI / 8 || ang >= Math.PI * 15 / 8) return 0;
        if (ang >= Math.PI * 7 / 8 && ang <= Math.PI * 9 / 8) return "0.8em";
        return "0.3em";
    }


    // Deselects all selected slices
    function deselectAll() {
        chart._group.select (".selected")
            .classed("selected", false)
            .attr("transform", "translate(0,0)");
    }

    // The callback function for clicking a pie slice
    function onClick (d, i) {
        var isSelected = d3.select(this).classed("selected");
        deselectAll();
        if (isSelected) return; // Just toggle, i.e., unselect
        // Otherwise, select
        var center = offsetCentroid(d,chart._sliceOffset);
        d3.select(this)
            .classed ("selected",true)
            .transition().duration(chart._duration/2)
            .attr("transform", "translate("+center+")");
        // Reorder the svg
        chart._group.selectAll(".slice").sort(function (a, b) { // select the parent and sort the path's
            console.log (a);
            if (a != d) return -1;               // a is not the hovered element, send "a" to the back
            else return 1;
        });
    }

    // This is the actual redraw code for pie charts
    chart.redraw = function () {
        var arcs = chart._group.select(".pie").selectAll(".slice")
          .data(donut(chart._data),
                  function(d,i) { // key function 
                    return chart._category(d.data,i); 
                  });
        // Update transition
        arcs.transition().delay(chart._duration/4).duration(chart._duration/2).attrTween("d", arcTween);
        // Exit 
        arcs.exit()
            .transition().duration(chart._duration/4).style("opacity", 0.0).remove();
        // Enter
        var enter = arcs.enter().append("g")
            .attr("class", "slice")
            .on("click", onClick);
        // Append the slice paths
        enter.append("path").each(function(d) { this._current = d; });
        // Append titles (tooltips)
        enter.append("title").attr("class", "tooltip");
        // Append labels
        enter.append("text").attr("class", "label");


        var slices = chart._group.select(".pie").selectAll(".slice");

        // Update the paths
        slices.select("path")
            .attr("fill", function(d, i) { 
                return chart._color(chart._category(d.data,i)); 
             })
            .transition().delay(chart._duration/2).duration(chart._duration/2).attrTween("d", arcTween);
        
        // Update titles
        slices.select(".tooltip")
            .text(function(d,i) { return chart._tooltip(d.data,i) });

        // Update labels
        slices.select(".label")
            .attr("transform", function(d) { 
                return "translate(" + offsetCentroid(d,chart._labelOffset) + ")";
            })
            .attr("text-anchor", labelAnchor) //center the text on it's origin
            .attr("dy", labelDy)
            .text(function(d,i) { return chart._label(d.data,i) })
            .style("opacity",0.0)
            .transition().duration(chart._duration).style("opacity", 1.0);

        // Redo the callouts
        slices.selectAll(".callout").remove();

        slices.append("g")
            .attr ("class", "callout")
            .attr("transform", function(d) { 
                return "translate(" + offsetCentroid(d,1) + ")";
            })
            .call(lcg.balloon()
                    .text (function (d,i) { return chart._tooltip(d.data,i); })
            );

        return chart;
    }
  
    return chart;
}



//
// A square pile chart.
// Data is a collection of values.
// Example usage:
//     chart = lcg.square()
//             .parent("#mychart")
//             .data([ 1, 10, 5, 20 ])
//
lcg.square = function () {

    var
    chart = lcg.chart(); // The object

    // Separation between squares
    chart._sep = 4;

    // Whether to put the largest (first) square to the left of all others
    chart._largestLeft = true;
 
    // Minimum margin around box text
    chart._labelMargin = 10;

    // Label y offset
    chart._labelOffsetY = -4;

    // This function is used to compute an alternative label when the
    // original label does not fit inside the square. Argument w
    // is the width of the square computed by the layout function
    chart._shortLabel = function (d,i,w) {
        return "";
    }
    

    // Gets/sets chart's square separation 
    // s : square constant (in pixels)
    // Returns the chart or the current separation  (if s is not given)
    chart.squareSep = function (s) {
        if (!arguments.length) return chart._sep;
        chart._sep = s;
        return chart;
    }

    // Gets/sets chart's "largest to the left" toggle 
    // l : true or false
    // Returns the chart or the setting for the toggle (if l is not given)
    chart.largestLeft = function (l) {
        if (!arguments.length) return chart._largestLeft;
        chart._largestLeft = l;
        return chart;
    }

    // Gets/sets chart's label margin constant
    // m : margin constant (in pixels)
    // Returns the chart or the current margin  (if m is not given)
    chart.labelMargin = function (m) {
        if (!arguments.length) return chart._labelMargin;
        chart._labelMargin = m;
        return chart;
    }

    // Uber object holds methods we will rewrite and
    // which will access the superclass' original methods
    var uber = {
        parent: chart.parent,
        resize: chart.resize
    };

    // Sets/unsets/queries the square corresponding to item i w.r.t.
    // having the "selected" class. If truth is given, sets/unsets the
    // class; if not, returns true/false depending on whether "selected"
    // is one of its class names.
    chart.selectByIndex = function (i, truth) {
        if (truth === undefined) {
            return chart._group.select ("#c"+i).classed ("selected")
        }
        chart._group.select ("#c"+i).classed ("selected", truth)
        chart._group.select ("#l"+i).classed ("selected", truth)
        chart._group.select ("#r"+i).classed ("selected", truth)
    } 

    // Returns an array of indices of all selected items
    chart.allSelected = function () {
        var ret = [];
        for (var i in chart._data) {
            if (chart._group.select ("#c"+i).classed ("selected")) ret.push (i)
        }
        return ret;
    }

    // Removes the "selected" class from all squares
    chart.unselectAll = function () {
        chart._group.select (".squares").selectAll (".square").classed ("selected", false);
        chart._group.select (".labels").selectAll (".label").classed ("selected", false);
        chart._group.select (".callouts").selectAll (".callout").classed ("selected", false);
    }

    // callback for clicking square i
    chart.onClick (function(d,i) {
        chart.selectByIndex (i, !chart.selectByIndex(i));
        d3.event.stopPropagation();
    })

    // Sets/gets the parent container. Initializes the chart.
    chart.parent = function (p) {
        if (!arguments.length) return uber.parent();
        uber.parent(p);
        // Create a group for holding the background
        chart._group.append ("g")
            .attr ("class", "bkg");
        // Create a group for holding the squares
        chart._group.append ("g")
            .attr ("class", "squares");
        // Create a group for holding the labels
        chart._group.append("g")
            .attr("class", "labels");
        // Create a group for holding the callouts
        chart._group.append("g")
            .attr("class", "callouts");
        return chart;
    }
    
    // Called whenever the chart geometry changes, e.g., through calling
    // size or position
    chart.resize = function (s) {
        uber.resize(s);
        var r = Math.min(chart._rect[2], chart._rect[3])/2;
        var x0 = chart._rect[0];
        var y0 = chart._rect[1];
        chart._group.attr("transform", "translate(" + x0 + "," + y0 + ")");
        return chart;
    }   
    
    // This function computes the layout of the rectangles given the values
    // in data
    chart._layout = function () {
        // Convenience function for computing the size of a value
        var size = function (i) {
            return (Math.sqrt(Math.abs(chart._value(chart._data[i], i))));
        }
        // Reset the coords array
        chart._coords = [];
        // Bail out if no data
        if (chart._data.length == 0) return;
        // Compute an order for data from largest to smallest
        var order = [];
        for (var i in chart._data) order.push(i);
        order.sort (function (a,b) {
            return Math.abs(chart._value(chart._data[b], b)) - 
                   Math.abs(chart._value(chart._data[a], a));
        }); 
        // Compute the width/height of the design
        var w = [0,0]; // normalized width of the design for the two rows
        var h = [0,0]; // normalized height of the two rows
        var n = [0,0]; // How many in each row
        for (var iorder in order) {
            if (chart._largestLeft && iorder == 0) continue;
            var i = order[iorder];
            var v = size(i);
            var j = (w[1]<w[0]) ? 1 : 0;
            w [j] += v;
            h [j] = Math.max(h[j],v);
            n[j]++;
        }
        // Fit the design inside its area by computing a proper scale
        var wid = Math.max(w[0],w[1]);
        var hgt = h[0]+h[1];
        if (chart._largestLeft) {
            var sizeFirst = size(order[0]);
            wid += sizeFirst;
            hgt = Math.max(hgt,sizeFirst);
        }
        var xscale = Math.min((chart._rect[2]-n[0]*chart._sep)/wid,(chart._rect[2]-n[1]*chart._sep)/wid);
        var yscale = (chart._rect[3]-chart._sep)/hgt;
        var scale = xscale;
        var x0 = 0;
        var y0 = 0; //(chart._rect[3] - chart._sep - (h[0]+h[1])*scale)/2;
        if (yscale < xscale) {
            scale = yscale;
            x0 = (chart._rect[2] - wid*scale)/2;
            y0 = 0;
        }
        var middle = chart._rect[3]*h[0]/(h[0]+h[1]);
        w = [0,0];
        // Compute the coordinates of the rectangles
        for (var iorder in order) {
            var i = order [iorder];
            var v = size(i) * scale;
            if (chart._largestLeft && iorder == 0) {
                var x = x0;
                var y = (chart._rect[3] - v) / 2;
                chart._coords [i] = [x,y,v,v];
                w[0] = w[1] = v + chart._sep;   
            }
            else {
                var j = (w[1]<w[0]) ? 1 : 0;
                var x = x0 + w[j];
                var y = y0 + ((j==0)? middle - v - chart._sep/2 : middle+chart._sep/2);
                chart._coords [i] = [x,y,v,v];
                w [j] += v + chart._sep;
            }
        }
    }

    // This is the actual redraw code for square pile charts
    chart.redraw = function () {

        // Recompute the layout
        chart._layout();

        // Figure out the positions for the labels
        // Add temp text elements for the labels
        var labels = chart._group.append("g").attr("id", "tmp")
            .selectAll("text.label")
            .data(chart._data, chart._dataKey)
            .enter()
            .append("text")
            .attr ("class", "label")
            .attr ("x", function (d,i) { return chart._coords[i][0]+chart._coords[i][2]/2; })
            .attr ("y", function (d,i) { return chart._coords[i][1]+chart._coords[i][3]/2; })
            .style ("text-anchor", "middle")
            .text (function(d,i) { return chart._label(d,i);});
        // Note down bounding box
        labels.each(function (d) { 
            d.bbox = this.getBBox(); 
        });
        // And remove
        chart._group.select("#tmp").remove();

        // Select the elements
        var rects = chart._group.select(".squares").selectAll("rect")
            .data(chart._data);
        // Update transition
        rects.transition()
            .delay(chart._duration/4)
            .duration(chart._duration/2)
            .attr("x", function (d,i) {return chart._coords[i][0]})
            .attr("y", function (d,i) {return chart._coords[i][1]})
            .style("fill", function(d, i) { 
                return chart._color(chart._category(d,i)); 
             })
            .attr("width", function (d,i) {return chart._coords[i][2]})
            .attr("height", function (d,i) {return chart._coords[i][3]});
        // Exit 
        rects.exit()
            .transition().duration(chart._duration/4).style("opacity", 0.0).remove();
        // Enter
        rects.enter().append("svg:rect")
            .attr("class", "square")
            .attr("id", function (d,i) { return "r"+i })
            .style("fill", function(d, i) { return chart._color(chart._category(d,i)); })
            .attr("x", function (d,i) {return chart._coords[i][0]})
            .attr("y", function (d,i) {return chart._coords[i][1]})
            .attr("width", function (d,i) {return chart._coords[i][2]})
            .attr("height", function (d,i) {return chart._coords[i][3]})
            .on ("click", chart._onClick)
            .style("opacity", 0)
            .transition().delay(chart._duration/2).duration(chart._duration/2).style("opacity", 1.0);


        // Append/replace titles (tooltips)
        chart._group.selectAll("rect title").remove();
        chart._group.selectAll("rect")
            .append("title")
            .text(function(d,i) { return chart._tooltip(d,i) });

        // Add text elements for the labels
        var labels = chart._group.select(".labels").selectAll("text")
            .data(chart._data);
        // Update transition
        labels.transition()
            .delay(chart._duration/4)
            .duration(chart._duration/2)
            .attr ("x", function (d,i) { return chart._coords[i][0]+chart._coords[i][2]/2; })
            .attr ("y", function (d,i) { 
                return chart._coords[i][1]+(chart._coords[i][3]+d.bbox.height)/2; 
            })
            .text (function(d,i) { 
                if (chart._coords[i][2] > d.bbox.width + chart._labelMargin) {
                    return chart._label(d,i);
                } else {
                    return chart._shortLabel(d,i,chart._coords[i][2]);
                }
            });
        // Exit 
        labels.exit()
            .transition().duration(chart._duration/4).style("opacity", 0.0).remove();
        // Enter
        labels.enter()
            .append("text")
            .attr ("class", "label")
            .attr("id", function (d,i) { return "l"+i })
            .attr ("x", function (d,i) { return chart._coords[i][0]+chart._coords[i][2]/2; })
            .attr ("y", function (d,i) { 
                return chart._coords[i][1]+(chart._coords[i][3]+d.bbox.height)/2; 
            })
            .attr ("dy", chart._labelOffsetY)
            .text (function(d,i) { 
                if (chart._coords[i][2] > d.bbox.width + chart._labelMargin) {
                    return chart._label(d,i);
                } else {
                    return chart._shortLabel(d,i,chart._coords[i][2]);
                }

            })
            .on ("click", chart._onClick)
            .style ("text-anchor", "middle")
            .style("opacity", 0)
            .transition().delay(chart._duration/2).duration(chart._duration/2).style("opacity", 1.0);


        // The callouts
        chart._group.select(".callouts").selectAll(".callout").remove();

        var callouts = chart._group.select(".callouts").selectAll(".callout").data(chart._data);

        callouts.enter()
            .append("g")
            .attr ("class", "callout")
            .attr ("id", function (d,i) { return "c"+i })
            .call(lcg.balloon()
                    .text (function (d,i) { return chart._tooltip(d,i); })
                    .x(function (d,i) { return chart._coords[i][0]+chart._coords[i][2]/2; })
                    .y (function (d,i) { return chart._coords[i][1]+chart._coords[i][3]/3; })
            )
            .style("opacity", 0)
            .transition().delay(chart._duration/2).duration(chart._duration/2).style("opacity", 1.0);

        return chart;
    }
  
    return chart;
}



//
// Scattergram chart.
// Data is a collection of series, where each series is a collection of points.
//
// A simple usage example is
//
// chart = lcg.scatter()
//    .parent ("#viz")
//    .size([200,200])
//    .data ([[3,4,5],[1,9,10]]);
//
lcg.scatter = function () {
    var
    chart = lcg.chart(); // The object
    
    // Returns x and y coordinates from each element of each series
    chart._x = function (d, i) { return i };
    chart._y = function (d, i) { return d };
    
    // Default size of each point (could also be a function)
    chart._r = 5;
    
    // Ranges for the x and y coordinates
    chart._xrange = [0,0];
    chart._yrange = [0,0];
    
    // Symbol function to be used for selecting the proper symbol
    // type for each series
    chart._symbolType = function (serie) { 
        return ['circle', 'square', 'cross', 'triangle-up'][serie % 4];
    };
    
    // These methods from the superclass are going to be rewritten below
    var uber = {
        resize: chart.resize
    };
    
    //
    // Gets/sets the chart's x accessor function
    // x : the new x function
    // Returns the chart or the current x function (if x is not given)
    chart.x = function (x) {
        if (!arguments.length) return chart._x;
        chart._x = x;
        return chart;
    }
   
    //
    // Gets/sets the chart's y accessor function
    // y: the new y function
    // Returns the chart or the current y function (if y is not given)
    chart.y = function (y) {
        if (!arguments.length) return chart._y;
        chart._y = y;
        return chart;
    }
    
    //
    // Gets/sets the function or constant that determine the size of each point
    // r : the new value or function for determining point size
    // Returns the chart or the current r value/function (if r is not given)
    chart.r = function (r) {
        if (!arguments.length) return chart._r;
        chart._r = r;
        return chart;
    }
    
    // Sets an attribute of a selection depending on a condition
    function condAttr (sel,cond,attr,value) {
        if (cond) { sel.attr(attr,value) }
    } 
    
    // Called whenever the geometry of the chart is modified
    chart.resize = function (s) {
        uber.resize(s);
        chart._xrange = [chart._rect[0],chart._rect[0]+chart._rect[2]]; 
        chart._yrange = [chart._rect[1]+chart._rect[3],chart._rect[1]]; 
        return chart;
    }   
    
    // Redraws the chart
    chart.redraw = function() {
    
        // Compute x and y extents for all series
        var xextent,yextent;
        for (serie in chart._data) {
            var data = chart._value(chart._data[serie]);
            var xe = d3.extent(data, chart._x);
            var ye = d3.extent(data, chart._y);
            if (xextent == undefined) { 
                xextent = xe;
                yextent = ye;
            }
            else { 
                xextent = d3.extent(xextent.concat(xe));
                yextent = d3.extent(yextent.concat(ye));
            }            
        }
        
        // See if data was actually defined, and bail out if not
        if (xextent==undefined) return chart;
                
        // Compute x and y scales for the data
        var xscale = d3.scale.linear ().domain(xextent).range(chart._xrange);
        var yscale = d3.scale.linear ().domain(yextent).range(chart._yrange);

        // Define the x axis
        var xaxis = d3.svg.axis().scale(xscale);
        var xaxisId = "xaxis";
        var axisSel = chart._group.selectAll ("g #"+xaxisId);
        if (axisSel.empty()) {
            // Not defined yet - create
            axisSel = chart._group.append ("g")
                .attr("class", "axis")
                .attr("id", xaxisId);
        }
        axisSel
            .attr("transform", "translate(0,"+chart._yrange[0]+")")
            .transition().call(xaxis);
         
        // Define the y axis
        var yaxis = d3.svg.axis().scale(yscale).orient("left");
        var yaxisId = "yaxis";
        axisSel = chart._group.selectAll ("g #"+yaxisId);
        if (axisSel.empty()) {
            // Not defined yet - create
            axisSel = chart._group.append ("g")
                .attr("class", "axis")
                .attr("id", yaxisId);
        }
        axisSel
            .attr("transform", "translate("+chart._xrange[0]+",0)")
            .transition().duration(chart._duration).call(yaxis);                
            
        // Functions for computing position and size from data items
        var x = function(d,i) { return xscale(chart._x(d, i)); }
        var y = function(d,i) { return yscale(chart._y(d, i)); }
        var r = d3.functor (chart._r);
                 
        // Plot all series
        for (serie in chart._data) {
            var data = chart._value(chart._data[serie]);
            var cat = chart._category(data,serie);
            var color = typeof(chart._color) == "function" ? chart._color(cat) : chart._color; 
            var setcolor = color != undefined;
            var className = chart._seriesClassName(serie);
            var plot = chart._group.selectAll("g ."+className);
            var translation = function(d,i) { return "translate(" + x(d,i) + "," + y(d,i) + ")"; };
            var symbol = d3.svg.symbol();
            symbol.type(chart._symbolType(serie));
            symbol.size(function (d,i) { return Math.pow(r(d,i)+2,2); });
            
            if (plot.empty()) {
                // First plot of this series --> create the group
                plot = chart._group.append ("g").attr("class", className);
            }
            
            // Join data
            plot = plot.selectAll("path")
                .data(data);
                
            // Update
            plot.transition().delay(chart._duration/4).duration(chart._duration/2)
                .attr("transform", translation)
                .attr("d", symbol);
                
            // Exit
            plot.exit().transition().duration(chart._duration/4).style("opacity", 0.0).remove();          
            
            // Enter
            var points =  plot.enter()
                .append("path")
                .attr ("class", "point")
                .style("opacity", 0)
                .attr("transform", translation)
                .attr("d", symbol)
                .call(condAttr, setcolor, "fill", color);

            // Tooltips
            points.append ("svg:title").text (function (d,i) { 
                if (Math.abs(d) < 1) return d.toFixed(2);
                return d.toFixed(0); 
            });

            points
                .transition().delay(chart._duration/2).duration(chart._duration/2).style("opacity", 1.0);
                
        }
        return chart;
    }    
    return chart;
}

// 
// Common class for a chart plotting multiple series, where each point 
// has an ordinal abcissa. This is used as a base class for other
// chart types such as the bar chart.
// 
// Data is a collection of series, where each series is a collection of points.
//
// Styling:
//    axes: class "axis" , where the x axis has id "xaxis" and the y axis has id "yaxis".
//    bars: each series receives a class name as set by the seriesClassName function. 
//       By default, the first series is named "series0", the second "series1" and so forth.
//
lcg.ordinalChart = function () {

    var chart = lcg.chart(); // The object
    
    chart._xorient = "bottom"; // Where the x axis will be placed
    chart._yorient = "left"; // Where the y axis will be placed

    // Returns x and y coordinates from each element of each series
    chart._x = function (d, i) { return i };
    chart._y = function (d, i) { return d };

    // X and y coordinate ranges for the space occupied by the chart in the svg
    chart._xrange = [0,0];
    chart._yrange = [0,0];
    
    // Returns the cluster to which each series belongs. By default, each series
    // belongs to a separate cluster, which means its bars are drawn beside
    // those of the other series. If two series are mapped to the same cluster,
    // then their bars are mapped on top of each other
    chart._cluster = function (s) { return s; }

    // These methods from the superclass are going to be rewritten below
    var uber = {
        resize: chart.resize
    };
    
    //
    // Gets/sets the chart's x accessor function
    // x : the new x function
    // Returns the chart or the current x function (if x is not given)
    chart.x = function (x) {
        if (!arguments.length) return chart._x;
        chart._x = x;
        return chart;
    }
   
    //
    // Gets/sets the chart's y accessor function
    // y: the new y function
    // Returns the chart or the current y function (if y is not given)
    chart.y = function (y) {
        if (!arguments.length) return chart._y;
        chart._y = y;
        return chart;
    }

    // Gets/sets the chart's cluster function
    // cf : the new cluster function
    // Returns the chart or the current cluster function (if cf is not given)
    chart.cluster = function (cf) {
        if (!arguments.length) return chart._cluster;
        chart._cluster = cf;
        return chart;
    } 

    // Gets/sets the chart's x axis orientation (should be "bottom" or "top")
    chart.xorient = function (orient) {
        if (!arguments.length) return chart._xorient;
        chart._xorient = orient;
        return chart;   
    }

    // Gets/sets the chart's y axis orientation (should be "left" or "right")
    chart.yorient = function (orient) {
        if (!arguments.length) return chart._yorient;
        chart._yorient = orient;
        return chart;   
    }

    
    // Called whenever the geometry of the chart is modified
    chart.resize = function (s) {
        uber.resize(s);
        chart._xrange = [chart._rect[0],chart._rect[0]+chart._rect[2]]; 
        chart._yrange = [chart._rect[1]+chart._rect[3],chart._rect[1]]; 
        return chart;
    }   
    

    // Redraws the chart
    chart.redraw = function() {
    
        // Compute x domain and cluster y extents for all clusters
        chart.xdomain = [];
        chart.clextent = [];
        chart.ydomain = [];
        for (var serie in chart._data) {
            var data = chart._value(chart._data[serie]);
            // cluster to which this series belongs
            var cl = chart._cluster(serie);
            if (chart.ydomain[cl] == undefined) chart.ydomain[cl] = [];
            for (var i in data) {
                var x = chart._x(data[i],i);
                if (chart.xdomain.indexOf(x) < 0) chart.xdomain.push(x);
                var y = chart._y(data[i],i);
                if (chart.ydomain[cl][i] == undefined) chart.ydomain[cl][i] = y;
                else chart.ydomain[cl][i] += y;
            }
        }
        for (var cl in chart.ydomain) {
            chart.clextent [cl] = d3.extent(chart.ydomain[cl]);
            if (chart.clextent [cl][0] > 0) chart.clextent [cl][0] = 0;
        }

        // See if data was actually defined, and bail out if not
        var nclusters = chart.clextent.length;
        if (nclusters == 0) return chart;

        // Compute the y extent of all clusters
        chart.yextent = chart.clextent[0];
        for (var cl = 1; cl < nclusters; cl++) {
            chart.yextent = d3.extent(chart.yextent.concat(chart.clextent[cl]));
        }
        
        // Compute x and y scales for the data
        chart.xscale = d3.scale.ordinal ().domain(chart.xdomain).rangeBands(chart._xrange);
        chart.yscale = d3.scale.linear ().domain(chart.yextent).range(chart._yrange);

        // Define the x axis
        chart.xaxis = d3.svg.axis()
            .scale(chart.xscale)
            .ticks(chart._xticks)
            .tickFormat (chart._xtickformat)
            .orient(chart._xorient);

        var xaxisId = "xaxis";
        var axisSel = chart._group.selectAll ("g #"+xaxisId);
        if (axisSel.empty()) {
            // Not defined yet - create
            axisSel = chart._group.append ("g")
                .attr("class", "axis")
                .attr("id", xaxisId);
        }
        axisSel
            .attr("transform", "translate(0,"+chart._yrange[0]+")")
            .transition().call(chart.xaxis);

        // Define the y axis
        chart.yaxis = d3.svg.axis()
            .scale(chart.yscale)
            .ticks(chart._yticks)
            .tickFormat (chart._ytickformat)
            .orient(chart._yorient);
        var yaxisId = "yaxis";
        var yaxisShift = chart._xrange[0];
        if (chart._yorient == "right") yaxisShift = chart._xrange[1];
        axisSel = chart._group.selectAll ("g #"+yaxisId);
        if (axisSel.empty()) {
            // Not defined yet - create
            axisSel = chart._group.append ("g")
                .attr("class", "axis")
                .attr("id", yaxisId);
        }
        axisSel
            .attr("transform", "translate("+yaxisShift+",0)")
            .transition().duration(chart._duration).call(chart.yaxis);       

        // Define the horizontal grid lines
        if (chart._ygridlines) {
            var ygridId = "ygridlines";
            gridSel = chart._group.selectAll ("g #" + ygridId);
            if (gridSel.empty()) {
                // Not defined, create
                gridSel = chart._group.append ("g")
                    .attr("class", "gridlines")
                    .attr("id", ygridId);
            }
            gridSel
                .attr("transform", "translate("+yaxisShift+",0)")
                .transition().duration(chart._duration)
                .call(chart.yaxis
                        .tickSize(-chart._rect[2],0,0)
                        .tickFormat("")
                    );       
        }  

        // Define the vertical grid lines
        if (chart._xgridlines) {
            var xgridId = "xgridlines";
            gridSel = chart._group.selectAll ("g #" + xgridId);
            if (gridSel.empty()) {
                // Not defined, create
                gridSel = chart._group.append ("g")
                    .attr("class", "gridlines")
                    .attr("id", xgridId);
            }
            gridSel
                .attr("transform", "translate(0,"+chart._yrange[0]+")")
                .transition().duration(chart._duration)
                .call(chart.xaxis
                        .tickSize(-chart._rect[3],0,0)
                        .tickFormat("")
                    );       
        }        

        return chart;
    }    
    return chart;
}

// 
// A bar chart.
//
// Data is a collection of series, where each series is a collection of points.
//
// A simple usage example is
//
// chart = lcg.bar()
//    .parent ("#viz")
//    .size([200,200])
//    .data ([[3,4,5],[1,9,10]]);
// 
// Styling:
//    axes: class "axis" , where the x axis has id "xaxis" and the y axis has id "yaxis".
//    bars: each series receives a class name as set by the seriesClassName function. 
//       By default, the first series is named "series0", the second "series1" and so forth.
//
lcg.bar = function () {

    var chart = lcg.ordinalChart(); // The object
    
    // Defaults for some constants
    chart._groupSep = 0.2; // How much of the horizontal space allocated for each group
                      // is to be used for separating one group from the next

    chart._barSep = 0.1; // How much of the horizontal space allocated for each bar
                      // is to be used to separate one bar from the other

    // The bar path generator. Returns svg path data for a 
    // rectangle with lower left corner at x,y and width/height = w/h
    chart._bar= function (d,i,s,x,y,w,h) {
        return "M " + x + "," + y +
            "L " + (x+w) + "," + y +
            "L " + (x+w) + "," + (y-h) +
            "L " + x + "," + (y-h) +
            "z";
    }
    
    // These methods from the superclass are going to be rewritten below
    var uber = {
        resize: chart.resize,
        redraw: chart.redraw
    };
    

    // Gets/sets the chart's group separation ratio constant
    chart.groupSep = function (sep) {
        if (!arguments.length) return chart._groupSep;
        chart._groupSep = sep;
        return chart;
    }

    // Gets/sets the chart's bar separation ratio constant
    chart.barSep = function (sep) {
        if (!arguments.length) return chart._barSep;
        chart._barSep = sep;
        return chart;
    }

    // Gets/sets the chart's bar path data function
    // bf : the new bar path data function
    // Returns the chart or the current bar path data function (if bf is not given).
    // The bar path data function is called with the following arguments:
    //   bf(d,i,s,x,y,w,h), where
    //      d: the datum (as per d3's usual conventions)
    //      i: the index of the datum (as per d3's usual conventions)
    //      s: the series index (0 for the first series, 1 for the second, etc)
    //      x, y: coordinate of the lower left corner of the bar
    //      w, h: width, height of the bar.
    // Your function should return a path specification string. 
    chart.barPathData = function (bf) {
        if (!arguments.length) return chart._bar;
        chart._bar = bf;
        return chart;
    } 


    // Sets the class of a given bar path. 
    chart._barClassName = function (d, i) {
        return 'Bar' + i;
    }
    
    // Redraws the chart
    chart.redraw = function() {
 
        // Redraws the base class
        uber.redraw();

        // Functions for computing geometry from data items
        var x = function(d,i) { return chart.xscale(chart._x(d, i)); }
        var y = function(d,i) { return chart.yscale(chart._y(d, i)); }

        // This array accumulates y extents over all clusters and x values
        var dataExtent = [];

        // Number of defined clusters
        var nclusters = chart.clextent.length;

        // This produces a function for the path data for a given
        // data series        
        function pathDataFunction (serie) {
            var band = chart.xscale.rangeBand();
            var bandGap = band * chart._groupSep; 
            var barGap = (band-bandGap) / nclusters*chart._barSep;
            var dx = (band-bandGap) / nclusters;

            // Make sure this cluster is already represented in dataExtent
            var cl = chart._cluster(serie);
            if (cl >= dataExtent.length) { 
                for (var i = dataExtent.length; i <= cl; i++) dataExtent.push ([]);
            }

            // Define the function for this series
            return function(d,i) { 
                var barExtent = d3.extent([0, chart._y(d,i)]);
                if (i >= dataExtent[cl].length) {
                    for (var j = dataExtent[cl].length; j <= i; j++) {
                        dataExtent[cl].push([0,0]);
                    }
                }
                if (barExtent[1]>0) {
                    barExtent[0] += dataExtent[cl][i][1];
                    barExtent[1] += dataExtent[cl][i][1];
                }
                else {
                    barExtent[0] += dataExtent[cl][i][0];
                    barExtent[1] += dataExtent[cl][i][0];                        
                }
                var y0 = chart.yscale(barExtent[0]);
                var y1 = chart.yscale(barExtent[1]);
                var ret = chart._bar (d,i,serie,x(d,i)+bandGap/2+cl*(dx+barGap),y0,dx-barGap,y0-y1);
                dataExtent[cl][i] = d3.extent(dataExtent[cl][i].concat(barExtent));
                return ret;
            }
        }

        var plotArea = chart._group.select("g.plotArea");
        if (plotArea.empty() && chart._data.length > 0) plotArea = chart._group.append ("g").classed("plotArea",true);


        // Plot all series
        var classesPlotted = [];
        for (var serie in chart._data) {
            var data = chart._value(chart._data[serie]);
            var cat = chart._category(data,serie);
            var className = chart._seriesClassName (serie);
            classesPlotted.push (className);
            var plot = plotArea.select("g ."+className);
            var pathData = pathDataFunction(serie);

            if (plot.empty()) {
                // First plot of this series --> create the group
                plot = plotArea.append ("g").attr("class", className);
            }
            
            // Join data
            plot = plot.selectAll("path")
                .data(data);
            
            // Update
            plot.transition().delay(chart._duration/4).duration(chart._duration/2)
                .attr("d", pathData);

            plot.select ("title").text (function (d,i) { 
                return d.energyFormat();
            });
                
            // Exit
            plot.exit().transition().duration(chart._duration/4).style("opacity", 0.0).remove();          

            // Enter
            var newbars = plot.enter()
                .append("path")
                .attr ("class", chart._barClassName)
                .style("opacity", 0)
                .attr("d", pathData);

            newbars
                .transition().delay(chart._duration/2).duration(chart._duration/2).style("opacity", 1.0);    

            // Tooltips
            newbars.append ("title").text (function (d,i) { 
                return d.energyFormat();
            });

        }

        // Remove series not plotted
        plotArea.selectAll("g").each (function () {
            var thisClass = d3.select (this).attr("class");
            if (classesPlotted.indexOf(thisClass) < 0)
                d3.select(this).remove();
        });

        return chart;
    }    
    return chart;
}

// 
// An area chart.
//
// Data is a collection of series, where each series is a collection of points.
//
// A simple usage example is
//
// chart = lcg.area()
//    .parent ("#viz")
//    .size([200,200])
//    .data ([[3,4,5],[1,9,10]]);
// 
// Styling:
//    axes: class "axis" , where the x axis has id "xaxis" and the y axis has id "yaxis".
//    areas: each series receives a class name as set by the seriesClassName function. 
//       By default, the first series is named "series0", the second "series1" and so forth.
//
lcg.area = function () {

    var chart = lcg.chart(); // The object
    
    // Some user-modifiable layout variables 
    chart._labelXOffset = lcg.defaults.areaLabelXOffset;
    chart._labelYOffset = lcg.defaults.areaLabelYOffset;

    // These methods from the superclass are going to be rewritten below
    var uber = {
        resize: chart.resize,
        redraw: chart.redraw
    };
    
    // Tells whether the x axis is composed of numbers ("linear") or 
    // of categories ("ordinal")
    var xDomainType = "linear";

    // Setters for variable xDomainType 
    chart.ordinal = function () {
        xDomainType = "ordinal";
        return chart;
    }
    chart.linear = function () {
        xDomainType = "linear";
        return chart;
    }

    // Redraws the chart
    chart.redraw = function() {

        // Plottable area
        var x0 = chart._rect[0];
        var y0 = chart._rect[1];
        var width = chart._rect[2];
        var height = chart._rect[3];

        // Scales to map coordinates to the plottable area    
        var xScale = xDomainType=="linear" ? d3.scale.linear().range([0,width])
                                           : d3.scale.ordinal().rangePoints([0,width]);
        var yScale = d3.scale.linear ().range([height,0]);

        // The axes
        var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .ticks(chart._xticks)
                    .tickFormat (chart._xtickformat)
                    .orient("bottom");
        var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .ticks(chart._yticks)
                    .tickFormat (chart._ytickformat)
                    .orient("left");

        // The gridlines (if any)
        var xGrid= null, yGrid = null;
        if (chart._xgridlines) {
            xGrid = d3.svg.axis()
                    .scale(xScale)
                    .ticks(chart._xticks)
                    .tickFormat ("")
                    .innerTickSize(height)
                    .orient("bottom");
        }
        if (chart._ygridlines) {
            yGrid = d3.svg.axis()
                    .scale(yScale)
                    .ticks(chart._yticks)
                    .innerTickSize (-width)
                    .tickFormat ("")
                    .orient("left");
        }

        // Functions that access x/y values from data
        var _x = chart._category;
        var _y = chart._value;

        // Functions that map data x/y coordinates into chart x/y coordinates
        var chartX = function (d,i) { return xScale(_x(d,i)) };
        var chartY = function (d,i) { return yScale(_y(d,i)) };

        // This is the function which takes each series of points and
        // returns an svg path geometry for the area under the curve
        var area = d3.svg.area()
            .x (chartX) // Abcissa
            .y1 (chartY) // Ordinate
            .y0 (function(d,i) { return yScale(0) }); // Baseline
            

        // This is the function which takes each series of points and
        // returns an svg path geometry for curve itself
        var line = d3.svg.line().x(chartX).y(chartY);

        // Sets the group position to the plottable area
        chart._group.attr ("transform", "translate(" + x0 + "," + y0 + ")");

        // Set the proper domains of the scales by taking min/max values of data
        var xValues = [];
        var yValues = [0];
        for (var key in chart._data) {
            var series = chart._series(chart._data[key],key);
            for (var i in series) {
                xValues.push (_x(series[i],i));
                yValues.push (_y(series[i],i));
            }
        } 
        xScale.domain (xDomainType=="linear" ? d3.extent(xValues) : xValues);
        yScale.domain (d3.extent(yValues)); 

        // See if this is the first time the chart is plotted
        var firstPlot = chart._data.length > 0 && chart._group.select (".xaxis").empty();

        // No transitions for the first plot
        var duration = firstPlot ? 0 : chart._duration; 

        // The axes
        if (firstPlot) {
            if (chart._xgridlines) {
                chart._group.append ("g")
                    .attr ("class", "gridlines xgridlines")
                    .call (xGrid);
            }
            if (chart._ygridlines) {
                chart._group.append ("g")
                    .attr ("class", "gridlines ygridlines")
                    .call (yGrid);
            }
            chart._group.append ("g")
                .attr("class", "axis xaxis")
                .attr("transform", "translate(0," + height + ")").call(xAxis);
            chart._group.append ("g")
                .attr("class", "axis yaxis").call(yAxis);
        }
        chart._group.select ("g.xaxis").transition().duration(duration).call(xAxis);
        chart._group.select ("g.yaxis").transition().duration(duration).call(yAxis);
        if (chart._xgridlines) {
            chart._group.select ("g.xgridlines").transition().duration(duration).call(xGrid);
        }
        if (chart._ygridlines) {
            chart._group.select ("g.ygridlines").transition().duration(duration).call(yGrid);
        }



        // Add/Remove series groups
        var series = chart._group
            .selectAll("g.series")
            .data(chart._data, chart._key);
        var newseries = series.enter()
            .append("g")
            .attr("class", function (d,i) { return "series " + chart._seriesClassName (i); });


        // The Color 
        var _color = function (d,i) { 
                return chart._color(chart._label(d,i)); 
            };

        // Add path for the area
        newseries
            .append ("path")
            .attr ("class", "area")
            .style ("fill", _color);

        // Add path for the line 
        newseries
            .append ("path")
            .attr ("class", "line")
            .style ("fill", "none")
            .style ("stroke", _color);

        // Add a group of paths for the symbols
        newseries
            .append("g")
            .attr ("class", "symbols")
            .style ("fill", _color);

        // Add labels
        newseries
            .append ("text")
            .attr ("class", "label")
            .attr ("transform", function (d,i) {
                d = chart._series(d,i);
                return "translate(" + xScale(_x(d[d.length-1],d.length-1))
                        +"," +        yScale(_y(d[d.length-1]))
                        +")";
            })
            .attr ("dx", chart._labelXOffset)
            .attr ("dy", chart._labelYOffset)
            .text (chart._label)
            .style ("fill", _color);

        // Remove vanishing series
        series.exit().remove();

        // Area paths
        chart._group.selectAll("g.series path.area")
            .data(chart._data, chart._key)
            .transition().duration(duration).attr("d", function(d,i) { return area(chart._series(d,i)); });

        // line paths
        chart._group.selectAll("g.series path.line")
            .data(chart._data, chart._key)
            .transition().duration(duration).attr("d", function(d,i) { return line(chart._series(d,i)); });

        // Symbols
        var symbols = chart._group.selectAll("g.series g.symbols")
            .data(chart._data, chart._key)
            .selectAll("path.point")
            .data (function (d, i) { return chart._series(d,i); });
        symbols
            .enter()
            .append("path")
            .attr ("class", "point")
            .attr("transform", function (d,i) { return "translate("+chartX(d,i)+","+chartY(d,i)+")" } )
            .attr("d", d3.svg.symbol())
            // Tooltips
            .append ("svg:title").text (function (d,i) { 
                d = d.value;
                if (Math.abs(d) < 1) return d.toFixed(2);
                return d.toFixed(0); 
            });
        symbols.exit().remove();
        symbols
            .transition().duration(duration)
            .attr("transform", function (d,i) { return "translate("+chartX(d,i)+","+chartY(d,i)+")" } );

        // Labels
        var labels = chart._group.selectAll("g.series text")
            .data (chart._data, chart._key)
            .transition().duration(duration)
            .attr ("transform", function (d,i) {
                d = chart._series(d,i);
                return "translate(" + xScale(_x(d[d.length-1],d.length-1))
                        +"," +        yScale(_y(d[d.length-1]))
                        +")";
            })
            .text (chart._label);

        return chart;
    }    
    return chart;
}


// A Stacked area chart
lcg.stackedArea = function () {

    var chart = lcg.chart(); // The object

    // Some user-modifiable layout variables 
    chart._labelXOffset = lcg.defaults.areaLabelXOffset;
    chart._labelYOffset = lcg.defaults.areaLabelYOffset;

        
    // These methods from the superclass are going to be rewritten below
    var uber = {
        resize: chart.resize,
        redraw: chart.redraw
    };
    
    // Tells whether the x axis is composed of numbers ("linear") or 
    // of categories ("ordinal")
    var xDomainType = "linear";

    // Setters for variable xDomainType 
    chart.ordinal = function () {
        xDomainType = "ordinal";
        return chart;
    }
    chart.linear = function () {
        xDomainType = "linear";
        return chart;
    }

    // Redraws the chart
    chart.redraw = function() {

        // Plottable area
        var x0 = chart._rect[0];
        var y0 = chart._rect[1];
        var width = chart._rect[2];
        var height = chart._rect[3];

        // Scales to map coordinates to the plottable area    
        var xScale = xDomainType=="linear" ? d3.scale.linear().range([0,width])
                                           : d3.scale.ordinal().rangePoints([0,width]);
        var yScale = d3.scale.linear ().range([height,0]);

        // The axes
        var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .ticks(chart._xticks)
                    .tickFormat (chart._xtickformat)
                    .orient("bottom");
        var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .ticks(chart._yticks)
                    .tickFormat (chart._ytickformat)
                    .orient("left");

        // The gridlines (if any)
        var xGrid= null, yGrid = null;
        if (chart._xgridlines) {
            xGrid = d3.svg.axis()
                    .scale(xScale)
                    .ticks(chart._xticks)
                    .tickFormat ("")
                    .innerTickSize(height)
                    .orient("bottom");
        }
        if (chart._ygridlines) {
            yGrid = d3.svg.axis()
                    .scale(yScale)
                    .ticks(chart._yticks)
                    .innerTickSize (-width)
                    .tickFormat ("")
                    .orient("left");
        }

        // Functions that access values from data
        var _x = chart._category;
        var _y = chart._value;
        var _series = chart._series;


        var stack = d3.layout.stack()
            .values(function (d,i) {
                return _series (d,i);
            })
            .x(_x)
            .y(_y);

        var stackedData = chart._data != undefined && chart._data.length > 0 ? stack(chart._data) : [];
 
        // Functions that map data x/y coordinates into chart x/y coordinates
        var chartX = function (d,i) { return xScale(_x(d,i)) };
        var chartY = function (d,i) { return yScale(d.y+d.y0) };

        // This is the function which takes each series of points and
        // returns an svg path geometry for the area under the curve
        var area = d3.svg.area()
            .x (chartX) // Abcissa
            .y1 (chartY) // Ordinate
            .y0 (function(d,i) { return yScale(d.y0) }); // Baseline
            

        // This is the function which takes each series of points and
        // returns an svg path geometry for curve itself
        var line = d3.svg.line().x(chartX).y(chartY);

        // Sets the group position to the plottable area
        chart._group.attr ("transform", "translate(" + x0 + "," + y0 + ")");

        // Set the proper domains of the scales by taking min/max values of data
        var xValues = [];
        var yValues = [0];
        for (var key in stackedData) {
            var series = _series(stackedData[key], key);
            for (var i in series) {
                xValues.push (_x(series[i],i));
                yValues.push (series[i].y+series[i].y0);
            }
        } 
        xScale.domain (xDomainType=="linear" ? d3.extent(xValues) : xValues);
        yScale.domain (d3.extent(yValues)); 

        // See if this is the first time the chart is plotted
        var firstPlot = stackedData.length > 0 && chart._group.select (".xaxis").empty();

        // No transitions for the first plot
        var duration = firstPlot ? 0 : chart._duration; 

        // The axes
        if (firstPlot) {
            if (chart._xgridlines) {
                chart._group.append ("g")
                    .attr ("class", "gridlines xgridlines")
                    .call (xGrid);
            }
            if (chart._ygridlines) {
                chart._group.append ("g")
                    .attr ("class", "gridlines ygridlines")
                    .call (yGrid);
            }
            chart._group.append ("g")
                .attr("class", "axis xaxis")
                .attr("transform", "translate(0," + height + ")").call(xAxis);
            chart._group.append ("g")
                .attr("class", "axis yaxis").call(yAxis);
        }
        chart._group.select ("g.xaxis").transition().duration(duration).call(xAxis);
        chart._group.select ("g.yaxis").transition().duration(duration).call(yAxis);
        if (chart._xgridlines) {
            chart._group.select ("g.xgridlines").transition().duration(duration).call(xGrid);
        }
        if (chart._ygridlines) {
            chart._group.select ("g.ygridlines").transition().duration(duration).call(yGrid);
        }
        

        // Add/Remove series groups
        var series = chart._group
            .selectAll("g.series")
            .data(stackedData, chart._key);
        var newseries = series.enter()
            .append("g")
            .attr("class", function (d,i) { return "series " + chart._seriesClassName (i); });


        // The Color 
        var _color = function (d,i) { 
                return chart._color(chart._label(d,i)); 
            };

        // Add path for the area
        newseries
            .append ("path")
            .attr ("class", "area")
            .style ("fill", _color);

        // Add path for the line 
        newseries
            .append ("path")
            .attr ("class", "line")
            .style ("fill", "none")
            .style ("stroke", _color);

        // Add a group of paths for the symbols
        newseries
            .append("g")
            .attr ("class", "symbols")
            .style ("fill", _color);

        // Add labels
        newseries
            .append ("g")
            .attr ("class", "labelpos")
            .attr ("transform", function (d,i) {
                d = _series(d,i);
                return "translate(" + chartX(d[d.length-1],d.length-1)
                        +"," +        chartY(d[d.length-1],d.length-1)
                        +")";
            })
            .append ("text")
            .attr ("class", "label")
            .attr ("dx", chart._labelXOffset)
            .attr ("dy", chart._labelYOffset)
            .text (chart._label)
            .style ("fill", _color);

        // Remove vanishing series
        series.exit().remove();

        // Area paths
        chart._group.selectAll("g.series path.area")
            .data(stackedData, chart._key)
            .transition().duration(duration).attr("d", function(d,i) { return area(chart._series(d,i)); });

        // line paths
        chart._group.selectAll("g.series path.line")
            .data(stackedData, chart._key)
            .transition().duration(duration).attr("d", function(d,i) { return line(chart._series(d,i)); });

        // Symbols
        var symbols = chart._group.selectAll("g.series g.symbols")
            .data(stackedData, chart._key)
            .selectAll("path.point")
            .data (function (d, i) { return _series(d,i); });
        symbols
            .enter()
            .append("path")
            .attr ("class", "point")
            .attr("transform", function (d,i) { return "translate("+chartX(d,i)+","+chartY(d,i)+")" } )
            .attr("d", d3.svg.symbol());
        symbols.exit().remove();
        symbols
            .transition().duration(duration)
            .attr("transform", function (d,i) { return "translate("+chartX(d,i)+","+chartY(d,i)+")" } );

        // Labels
        var labels = chart._group.selectAll("g.series g.labelpos")
            .data (stackedData, chart._key)
            .transition().duration(duration)
            .attr ("transform", function (d,i) {
                d = _series(d,i);
                return "translate(" + chartX(d[d.length-1],d.length-1)
                        +"," +        chartY(d[d.length-1],d.length-1)
                        +")";
            })
            .select("text")
            .text (chart._label);

        return chart;
    }    
    return chart;
}

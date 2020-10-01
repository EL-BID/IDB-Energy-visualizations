// Transforms a given d3 svg selection into a text buffer that can be saved as 
// a standalone svg image. 
// ScaleFactor is 1.0 by default but
// can be used to produce a larger/smaller drawing
function svgBuffer(svg, scaleFactor) {

	// Default for scaleFactor
	scaleFactor = scaleFactor || 1.0;

	// Replace xml formatting chars with safe html codes
	function safeTags(str) {
	    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
	}

	// Map of css style attributes that will be encoded with each tag
	var cssSelectors = {
		"border-bottom-color" : true,
		"border-bottom-style" : true,
		"border-bottom-width" : true,
		"border-left-color" : true,
		"border-left-style" : true,
		"border-left-width" : true,
		"border-right-color" : true,
		"border-right-style" : true,
		"border-right-width" : true,
		"border-top-color" : true,
		"border-top-style" : true,
		"border-top-width" : true,
		"color" : true,
		"font-family" : true,
		"font-size" : true,
		"font-style" : true,
		"font-variant" : true,
		"font-weight" : true,
		"opacity" : true,
		"fill" : true,
		"text-anchor" : true,
		"stroke" : true,
		"stroke-width": true,
		"line-height": true,
		"white-space": true,
		"display": true,
		"visibility": true,
	};

    var readingDefs = false;
	var w = parseInt(svg.attr("width"))*scaleFactor;
	var h = parseInt(svg.attr("height"))*scaleFactor;
        
	// Recursively visit an SVG node and reencodes certain style attributes inline
	function visitSVG(node, buffer) {

		if(node.nodeName == "#comment") return;
                    
		buffer.push("<", node.tagName);
        
        if(node.tagName == "defs") {
            readingDefs = true;
        }

		if(node.tagName == "svg") {
			buffer.push(" xmlns=\"http://www.w3.org/2000/svg\"");
			buffer.push(" xmlns:xlink=\"http://www.w3.org/1999/xlink\"");
		}

        for(var i = 0; i < node.attributes.length; i++) {
			var attr = node.attributes.item(i);
			if(attr.nodeName != "style" && attr.nodeName != "class") {
				if(node.tagName == "image" && attr.nodeName == "href") {
					var pathArray = node.baseURI.split("/");
					var protocol = pathArray[0];
					var host = pathArray[2];
					var completeURL = protocol + "//" + host + attr.value;
					buffer.push(" xlink:href=\"", completeURL, "\"");
				}
				else if (node.tagName == "svg" && (attr.nodeName == "width" || attr.nodeName == "height")) {
					buffer.push(" ", attr.nodeName, "=\"", scaleFactor*attr.value, "\"");
				}
				else {
					buffer.push(" ", attr.nodeName, "=\"", attr.value, "\"");
				}
			}

		}
		var style = window.getComputedStyle(node,null);
		if(style && (!readingDefs||node.tagName=="rect")) {
			buffer.push(" style=\"");
			for(var j = 0; j < style.length; j++) {
				var item = style.item(j);

				if(cssSelectors[item] && cssSelectors[item] != style[item]) {
                    var si = style[item];
                    if (node.tagName == "svg" && (item == "width" || item == "height")) {
                     	si = parseInt(si) * scaleFactor;
                    }
                    else if(item == "font-family") {
                        var a1 = si.indexOf('"');
                        if(a1 >= 0) {
                            var a2 = si.lastIndexOf('"');
                            si = si.substring(a1+1,a2);
                        }
                    }
                    else if(item == "fill") {
                        var a1 = si.indexOf('url("');
                        if(a1 >= 0) {
                            var a1 = si.indexOf("#");
                            var a2 = si.lastIndexOf('"');
                            si = "url(" + si.substring(a1,a2) + ")";
                        }                            
                    }
					buffer.push(item, ":", si, ";");
				}
			}
			buffer.push("\"");
		}

		if(node.childNodes.length == 0) {
			buffer.push("/>");					
		}
		else {
			buffer.push(">");

			// If this is the svg node, push another group containing a scale factor transformation
			if (node.tagName == "svg") {
				buffer.push ('<rect width="'+w+'" height="'+h+'" style="fill:rgb(255,255,255);"></rect>')
				buffer.push ("<g transform=\"scale("+scaleFactor+")\">");
			}


			for(var i = 0; i < node.childNodes.length; i++) {
				var childNode = node.childNodes[i];
				if(childNode.nodeName == "#text") {
					buffer.push(safeTags(childNode.nodeValue));
				}
				else {
					visitSVG(childNode, buffer);
				}
			}

			// If this is the svg node, close the group containing a scale factor transformation
			if (node.tagName == "svg") {
				buffer.push ("</g>");
			}

			buffer.push("</",node.tagName,">"); 
			if(node.tagName == "defs") {
                readingDefs = false;
            }
		}
	}

	var w = parseInt(svg.attr("width"))*scaleFactor;
	var h = parseInt(svg.attr("height"))*scaleFactor;

	var buffer = [];
	visitSVG(svg.node(),buffer);
	return buffer.join("");
}


// Save an svg as an svg image file.
// The title argument
// is used as the name of the file to be saved.
// ScaleFactor is 1.0 by default but
// can be used to produce a larger/smaller drawing
function saveSvgAsSVG(svg, title, scaleFactor) {
	try {
	    var isFileSaverSupported = !!new Blob();
	} catch (e) {
	    alert("blob not supported");
	}

	// set the default scale factor
	scaleFactor = scaleFactor || 1.0;

	var html = svgBuffer(svg, scaleFactor);
	var blob = new Blob([html], {type: "image/svg+xml"});
	saveAs(blob, title+".svg");
};


// Save an svg as a Png image by rendering it into a 
// canvas using the canvg library. The title argument
// is used as the name of the file to be saved.
// ScaleFactor is 1.0 by default but
// can be used to produce a larger/smaller drawing
function saveSvgAsPNG(svg, title, scaleFactor)
{

	// set the default scale factor
	scaleFactor = scaleFactor || 2.0;

	// The element that was clicked
	var link = this;

	var buffer = svgBuffer (svg, scaleFactor);

	var w = parseInt(svg.attr("width"))*scaleFactor;
	var h = parseInt(svg.attr("height"))*scaleFactor;

	var imageName = title;

	var canvas = d3.select("body")
		.append("canvas")
		.attr ("id", "canvasId")
		.attr("width",w)
		.attr("height",h)
		.style("background-color", "white")
		.style("display","none")
	;
    
	var canvasNode = canvas.node();

	canvg(canvasNode,buffer);

	function eventFire(el, etype){
		if (el.fireEvent) {
		  el.fireEvent('on' + etype);
		} else {
		  var evObj = document.createEvent('Events');
		  evObj.initEvent(etype, true, false);
		  el.dispatchEvent(evObj);
		}
	}

	function doSave () {
		var dataUrl = canvasNode.toDataURL("image/png");
		var downloadA = d3.select("body")
			.append("a")
			.attr ("id", "saveId")
			.attr ("href", dataUrl)
			.attr ("download", imageName)
			.style ("display", "none");
		eventFire(document.getElementById('saveId'), 'click');
		canvas.remove();
		downloadA.remove();
	}

	setTimeout(doSave,1000);
}

function saveImage() {
	var imageName = viewNames[context.view];
    var svg = d3.select("#visualization svg");
	svg.selectAll(".sourceURL").style("visibility","visible");
	//saveSvgAsPng(svg.node(),imageName);
	saveSvgAsPNG(svg, imageName);
}


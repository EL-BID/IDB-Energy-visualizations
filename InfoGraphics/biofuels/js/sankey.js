
//
// A Sankey layout function
// 
var sankey = function () {

	// the layout object
	var self = {
		value: function (nodeOrLink) { return nodeOrLink.value },  // Accessor for a node/link 
		source: function (link) { return link.source }, // Accessor for source node of a link
		target: function (link) { return link.target }, // Accessor for target node of a link
	};

	// the various options for which we will create getter/setter functions
	var opts = {
		width: 800,      // width of the layout
		height: 600,     // height of the layout
		blockwidth : 40, // width of each block
		vratio : 0.5,    // how much of the vertical space is reserved for the layout
		data: { nodes: [], links : [] }, // Nodes and links
	}

	// Create getter/setter functions for all options
	for (var key in opts) {
  		self[key] = getSet(key, self).bind(opts);
	}

	// The actual layout
	self.layout = { blocks : [], paths : [] };

	// the function to compute layout
	self.computeLayout = function () {
		var nn = opts.data.nodes.length;
		var nl = opts.data.links.length;
		var layout = self.layout;

		
		// Create blocks
		layout.blocks = [];
		for (var i = 0; i < nn; i++) {
			layout.blocks[i] = {
				type: "block",
				node: opts.data.nodes[i],
				column: (opts.data.nodes[i].column || 0),
				value: self.value(opts.data.nodes[i])
			};
		}

		// Figure out the columns where each block will reside
		var flag;
		for (var k = 0; k < nl; k++) {
			flag = false;
			for (var i = 0; i < nl; i++) {
				var link = opts.data.links[i];
				var a = self.source(link);
				var b = self.target(link);
				if (layout.blocks[b].column<=layout.blocks[a].column) {
					layout.blocks[b].column=layout.blocks[a].column+1;
					flag = true;
				} 
			}
		}
		if (flag) {
			throw "not a dag";
		}

		// Create paths
		layout.paths = [];
		var sourcetarget = {}; // Dictionary for mapping paths to links' source/target 
		for (var i = 0; i < nl; i++) {
			var link = opts.data.links[i];
			var s = self.source(link);
			var t = self.target(link);
			var key = s+","+t;
			var p;
			if (sourcetarget[key] == undefined) {
				p = {
					type:"path",
					source:s,
					target:t,
					value:0,
					links:[]
				};
				layout.paths.push(p);
				sourcetarget[key] = p;
			}
			else {
				p = sourcetarget[key];
			}
			p.value += self.value(link);
			p.links.push (link);
		}
		// Number of paths created
		var np = layout.paths.length;

		// Create the column/slots structure
		var columns = [];
		var maxValue = 0.0;

		// add the blocks' values
		for (var i = 0; i < nn; i++) {
			var block = layout.blocks[i];		
			var c = block.column;
			columns[c] = columns[c] || { value : 0, slots : [] };
			columns[c].value += block.value;
			columns[c].slots.push (block);
			maxValue = Math.max(maxValue, columns[c].value);
		}
		// add the paths' values
		for (var i = 0; i < np; i++) {
			var path = layout.paths[i];
			// Create special slots for paths spanning more than 1 column
			for (var j = layout.blocks[path.source].column+1; 
				 j < layout.blocks[path.target].column; 
				 j++) {
				columns[j] = columns[j] || { value : 0, slots : [] };
				columns[j].value += path.value;
				// Use .push below for making creating paths over the other blocks
				columns[j].slots./*unshift*/push (path); 
				//var n = columns[j].slots.length;
				//columns[j].slots.splice(~~(n/2),0,path);
				maxValue = Math.max(maxValue, columns[j].value);
			}
		}

		// Compute value to height function
		var vth = self.layout.valueToHeight = function (v) { 
			return opts.height / maxValue * opts.vratio * v 
		};
		
		// Compute column number to x function 
		var x = function (icol) { 
			var space = opts.width - opts.blockwidth * columns.length;
			return space / (columns.length + 1) * (icol+1) + 
				(icol)*opts.blockwidth; 
		}

		// Compute column number / slot number to y function
		var y = function (icol, islot) {
			var vabove = 0.0;
			for (var i = 0; i < islot; i++) {
				vabove += columns [icol].slots[i].value;
			}
			var space = opts.height - vth(columns[icol].value);
			return space / (columns[icol].slots.length + 1) * (islot+1) + 
			    vth (vabove);
		}

		// Compute block rects
		for (var icol = 0; icol < columns.length; icol++) {
			for (var islot = 0; islot < columns[icol].slots.length; islot++) {
				var b = columns[icol].slots[islot];
				if (b.type == "block") {
					b.x = x(icol);
					b.y = y(icol,islot);
					b.width = opts.blockwidth;
					b.height = vth (b.value);
				}
			}
		}


		// Function that tests if two paths cross
		var pathCross = function (p1, p2) {
			var v1 = p1.vtx, v2 = p2.vtx;
			var i1 = 0, i2 = 0;
			while (i1 < v1.length - 1 && i2 < v2.length - 1) {
				if (v1[i1][0] < v2[i2][0]) { 
					i1++;
				}
				else if (v1[i1][0] > v2[i2][0]) {
					i2++;
				}
				else if ((v1[i1][1] > v2[i2][1]) != (v1[i1+1][1] > v2[i2+1][1])) {
					return true;
				}
				else {
					i1++; 
					i2++;
				}

			}
			return false;
		}

		// Compute path geometries and test them for crossings.
		// If a pair of paths cross each other, swap them and try again,
		// up to a fixed number of tries

		for (var swapTries = 5; swapTries > 0; swapTries--) {
			// clear block edge Heights
			for (var iblock = 0; iblock < nn; iblock++) {
				var b = layout.blocks[iblock];
				b.leftPathHeight = 0;
				b.rightPathHeight = 0;
				if (b.node.exports) { // Start a little lower if exports are defined
					b.rightPathHeight += Math.abs(vth(b.node.exports));
				}
			}
			// Compute path geometries
			for (var ipath = 0; ipath < np; ipath++) {
				var p = layout.paths[ipath];
				p.height = vth(p.value);
				
				var sourceBlock = layout.blocks[p.source];
				var sourceX = sourceBlock.x+sourceBlock.width;
				var sourceY = sourceBlock.y+sourceBlock.rightPathHeight;
				sourceBlock.rightPathHeight += p.height;
				
				var targetBlock = layout.blocks[p.target];
				var targetX = targetBlock.x;
				var targetY = targetBlock.y+targetBlock.leftPathHeight;
				targetBlock.leftPathHeight += p.height;

				p.vtx = [[sourceX,sourceY]];
				for (var icol = sourceBlock.column+1; icol<targetBlock.column; icol++) {
					var flag = false;
					for (var islot = 0; islot < columns[icol].slots.length; islot++) {
						if (columns[icol].slots[islot] == p) {
							var midX = x(icol);
							var midY = y(icol,islot);
							p.vtx.push([midX,midY]);
							p.vtx.push([midX+opts.blockwidth,midY]);
							flag = true;
							break;
						}
					}
					if (!flag) { throw "could not find passage slot" }
				}
				p.vtx.push([targetX,targetY]);
			}


			// Tests all path pairs
			var pairs = [];
			for (var i = 0; i < np; i++) {
				var pi = layout.paths[i];
				for (var j = i+1; j < np; j++) {
					var pj = layout.paths[j];
					if (pathCross (pi,pj)) {
						pairs.push ([i,j]);
					}
				}
			}

			if (swapTries > 0 && pairs.length > 0) {
				var i = pairs[0][0];
				var j = pairs[0][1];
				var tmp = layout.paths[i];
				layout.paths[i] = layout.paths[j];
				layout.paths[j] = tmp;
			}
			else {
				break;
			}
		}
	}

	// return the Sankey layout object
	return self;

}
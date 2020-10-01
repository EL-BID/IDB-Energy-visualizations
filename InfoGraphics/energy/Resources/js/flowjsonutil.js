// Parses the energy info for a given country/period and
// Returns two tables representing the blocks and paths
// of a sankey diagram.
function getEnergyFlow (data) {
	// Holds all energy blocks. Each element is a tuple
	// of the form [production,imports,exports,waste]
	var Blocks = {
		Crude: [0,0,0,0],
		Gas: [0,0,0,0],
		Coal: [0,0,0,0],
		Peat: [0,0,0,0],
		CRW: [0,0,0,0],
		Geothermal: [0,0,0,0],
		Nuclear: [0,0,0,0],
		Hydro:[0,0,0,0],
		Solar:[0,0,0,0],
		Primary: [0,0,0,0],
		Oil_Products: [0,0,0,0],
		Electricity:[0,0,0,0],
		Consumption:[0,0,0,0],
		Industry: [0,0,0,0],
		Transport: [0,0,0,0],
		Residential: [0,0,0,0],
		Commercial: [0,0,0,0],
		Other: [0,0,0,0]
	};
	// Holds all defined paths between energy blocks. Each
	// element is a list of quadruples of the form [fromBlock,toBlock,className,amount]. 
	// All quadruples in the same list have the same fromBlock and toBlock elements,
	// but should have different className's
	var Paths = {
	};
	// Adds another path to the paths table
	function addPath (src,dst,amt,className) {
		var key = src+dst;
        if (className == undefined) className = src;
        if (className == 'All_Products' || className == 'Primary') className = dst;
		if (Paths[key] == undefined) {
			Paths[key] = [[src,dst,className,amt]];
		} else {
			for (var i = 0; i < Paths[key].length; ++i) {
				if (Paths[key][i][2] == className) {
					Paths[key][i][3] += amt;
					return
				}
			}
			Paths[key].push ([src,dst,className,amt])
		}
	}
	// Analyze data and fill tables Blocks and Paths
	for (var i = 0; i < data.length; i++) {
		d = data[i];
		var p = shortname[d.product];
		var f = shortname[d.flow];
		var v = Math.abs(d.value);
        
		// if (p == "All_Primary") continue;
        
		if (f == "Production") {
			if (p == "All_Primary") continue;
			if (p != "Electricity" && p != "Oil_Products" && p != "All_Primary") {
				Blocks[p][0] += v;
				Blocks.Primary[0] += v;
				addPath (p,'Primary',v);
			}
		}
		else if (f == "Imports") {
			if (p == "All_Primary") continue;
			Blocks[p][1] += v;	
			if (p != "Electricity" && p != "Oil_Products") {
				Blocks.Primary[0] += v;
				addPath (p,'Primary',v);
			}
		}
		else if (f == "Exports") {
			if (p == "All_Primary") continue;
			Blocks[p][2] += v;		
			if (p != "Electricity" && p != "Oil_Products") {
				Blocks.Primary[0] -= v;
				addPath (p,'Primary',-v);
			}			
		}
		else if (f == "Consumption" || f == "Electricity" || f == "Oil_Products") {
			if (p == "All_Primary" || p == "All_Products") continue;
			if (p == 'Oil_Products' || p == 'Electricity') addPath (p,f,v);
			else addPath ('Primary',f,v,p);
			Blocks[f][0] += v;
		}
		else if (p == "All_Products") {
			if (Blocks [f] != undefined && f.search ("HW")<0) {
				// Not Heat and Waste, thus, consumption
				Blocks[f][0]+= v;
				addPath ('Consumption', f, v, f);
			}
			else if (f == "Hydrocarbon_HW") {
				Blocks.Oil_Products [3] = v;
			}
			else if (f == "Electricity_HW") {
				Blocks.Electricity [3] = v;
			}
		}
		else if (f == 'Industry' || f == 'Residential' || f == 'Commercial' || 
				 f == 'Transport' || f == 'Other') {
			addPath ('Consumption', f, v, p);
		}
	}
	return [Blocks,Paths];
}


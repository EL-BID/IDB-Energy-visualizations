// Parses the energy info for a given country/period and
// Returns two tables representing the blocks and paths
// of a sankey diagram.
function getElectricityFlow (data) {
	// Holds all energy blocks. Each element is a tuple
	// of the form [production,imports,exports,waste]
	var Blocks = {
		Imports: [0,0,0,0],
		Crude: [0,0,0,0],
		Gas: [0,0,0,0],
		Coal: [0,0,0,0],
		Peat: [0,0,0,0],
		CRW: [0,0,0,0],
		Geothermal: [0,0,0,0],
		Nuclear: [0,0,0,0],
		Hydro:[0,0,0,0],
		Solar:[0,0,0,0],
		Oil_Products: [0,0,0,0],
		Electricity:[0,0,0,0],
		Industry: [0,0,0,0],
		Transport: [0,0,0,0],
		Residential: [0,0,0,0],
		Commercial: [0,0,0,0],
		Other: [0,0,0,0],
		Exports: [0,0,0,0],
		ImportsOut: [0,0,0,0],
		CrudeOut: [0,0,0,0],
		GasOut: [0,0,0,0],
		CoalOut: [0,0,0,0],
		PeatOut: [0,0,0,0],
		CRWOut: [0,0,0,0],
		GeothermalOut: [0,0,0,0],
		NuclearOut: [0,0,0,0],
		HydroOut:[0,0,0,0],
		SolarOut:[0,0,0,0],
		Oil_ProductsOut: [0,0,0,0],
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
		if (f == "Electricity") {
			if (p == "All_Primary") continue;
			Blocks[p][0] += v;
			Blocks['Electricity'][0] += v;
			addPath (p,'Electricity',v);
		}
		else if (p == 'Electricity') {
			if (f == "Imports") {
				Blocks['Imports'][0] += v;	
				Blocks['Electricity'][0] += v;	
				addPath ('Imports','Electricity',v,'Imports');
			}
			else if (f == "Exports" || f == 'Industry' || f == 'Residential' || f == 'Commercial' || 
					 f == 'Transport' || f == 'Other') {
				Blocks[f][0] += v;	
				addPath ('Electricity', f, v, f);
			}
		}
		else if (p == "All_Products" && f == "Electricity_HW") {
			Blocks.Electricity [3] = v;
		}
	}
	// Before returning, perform an adjustment in the Electricity Block by putting some
	// of the energy into the export block, which is actually going to be labeled as
	// Energy Own Use
	var outEnergy = Blocks.Industry[0]+Blocks.Commercial[0]+Blocks.Residential[0]+Blocks.Other[0]+Blocks.Transport[0]+Blocks.Exports[0];
	Blocks.Electricity[2] = Blocks.Electricity[0]-Blocks.Electricity[3]-outEnergy;

	// Add blocks and paths for the output by source
	var electricityPerSource = getElectricityOutputBySource (data);
	electricityPerSource.forEach (function (d) {
		var prod = shortname[d.product];
		var dst = prod+"Out";
		Blocks [dst] = [d.outputKboe,0,0,0];
		addPath ("Electricity",dst,d.outputKboe,dst);
	});

	return [Blocks,Paths];
}

function getElectricityOutputBySource (data) {

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

    productData.forEach(function (d) {
            d.inputKboe = Math.abs(d.value);
            d.outputKboe = 0;
            d.loss = d.inputKboe;
            electricityData.forEach(function (e) {
                if (e.product === d.product) {
                    var GWh = e.value;
                    d.outputGWh = GWh;
                    d.outputKboe = GWh / ((365 * 1628.2) / 1000);
                    d.loss = d.inputKboe - d.outputKboe;
                }
            });
    });

    return productData;

}



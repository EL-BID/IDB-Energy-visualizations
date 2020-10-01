energy.database = { };

energy.database.loadTable = function( tableName, callback )
{
	function jsonLoaded (object)
	{
		callback( object );
	}
	d3.json( P + "/energy/Resources/data/" + tableName + ".json", jsonLoaded)
}

energy.database.getCountriesAndPeriods = function( callback )
{
	function onTableLoaded ( data ) 
	{
		// store this object to enable valid country / period menu itens
		energy.database.lastCountriesAndPeriods = data;

		// setup country name abbreviation
		var countryNameAbbreviation = { };

		countryNameAbbreviation["Trinidad and Tobago"] = "Trinidad and T.";
		countryNameAbbreviation["Trinidad & Tobago"] = "Trinidad and T.";
		countryNameAbbreviation["Dominican Republic"] = "Dominican Rep.";

		// Not Lac country names
		var regionNames = [ "Andean", "Caribbean", "LAC", "World", "North America", "Central America", "Europe", "Southern Cone" ];
		var notLacNames = [ "Austria", "Belgium", "Canada", "China", "Croatia", "India", "Denmark", 
							"Finland",  "France",  "Germany",  "Israel",
							"Italy",  "Japan",  "Korea",  "Netherlands",
							"Norway",  "Portugal",  "Slovenia",  
							"Spain",  "Sweden",  "Switzerland",  "USA", "United Kingdom",
						];

		// Dictionary to select distinct LAC , NOT LAC Country Names and Region Names
		var lacDic = { };
		var notLacDic = { };
		var regionDic = { };

		// Dictionary to select distinct periods
		var periodsDic = { };

		for(var i in data)
		{
			var row = data[i];
			// get the country name
			var country = row.country;
			if(notLacNames.indexOf(country) >= 0) // check if the name is in notLacNames
			{
				// store the country name and its abbreviation in notLacDic
				notLacDic[country] = countryNameAbbreviation[country] || country;
			}
			else if (regionNames.indexOf(country) >= 0) // Might be a region
			{ 
				regionDic[country] = countryNameAbbreviation[country] || country;
			}
			else // Is a LAC country
			{
				// store the country name and its abbreviation in lacDic
				lacDic[country] = countryNameAbbreviation[country] || country;
			}

			// store period
			periodsDic[row.period] = true;
		}

		// Names selected. Time to extract them. Store pairs in an array: <country,abbreviation>

		var lac = [ ];
		var notLac = [ ];
		var region = [ ];

		for(var i in lacDic)
		{
			var o = { };
			o.country = i;
			o.abbreviation = lacDic[i];
			lac.push(o);
		}

		for(var i in notLacDic)
		{
			var o = { };
			o.country = i;
			o.abbreviation = notLacDic[i];
			notLac.push(o);
		}		

		for(var i in regionDic)
		{
			var o = { };
			o.country = i;
			o.abbreviation = regionDic[i];
			region.push(o);
		}

		// Sort arrays
		var countrySort = function(a,b) { return a.abbreviation > b.abbreviation ? 1 : -1 };
		lac.sort(countrySort);
		notLac.sort(countrySort);
		region.sort(countrySort);

		// Periods extraction and sort

		var periods = [ ];
		var years = [ ];

		for(var i in periodsDic)
		{
			if(i.indexOf("-") > 0)
			{
				periods.push(i);
			}
			else
			{
				years.push(i);
			}
		}

		periods.sort();
		years.sort();

		callback(lac, notLac, periods, years, region);
	}

	energy.database.loadTable("countryperiod", onTableLoaded);
}

energy.database.getEnabledCountriesAndPeriod = function(country, period, callback)
{
	if(country == null || period == null)
	{
		return;
	}

	var enabledCountries = { };
	var enabledPeriods = { };

	var last = energy.database.lastCountriesAndPeriods;

	for(var i in last)
	{
		var obj = last[i];

		if(obj.country == country)
		{
			enabledPeriods[obj.period] = true;
		}
		if(obj.period == period)
		{
			enabledCountries[obj.country] = true;
		}
	}

	callback( enabledCountries, enabledPeriods );
}


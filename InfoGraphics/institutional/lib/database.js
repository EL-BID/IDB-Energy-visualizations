institutional.database = { };

institutional.database.loadTable = function( tableName, callback )
{
	function jsonLoaded (error, object)
	{
		// handle error here?
		callback( error, object );
	}

	d3.json(P + "/institutional/Resources/data/" + tableName + ".json", jsonLoaded)
}

institutional.database.isDisabledYear = function( countryName, year )
{
	var years = institutional.database.validYears[countryName];
	for(var i in years)
	{
		if(years[i] == year)
		{
			return false;
		}
	}
	return true;
}

institutional.database.ensurePeriodHasData = function (countryName, year)
{
	var years = institutional.database.validYears[countryName];
	for(var i in years)
	{
		if(years[i] == year)
		{
			return year;
		}
	}
	return years[0];
}

institutional.database.getCountriesAndPeriods = function( callback )
{
	function onTableLoaded (error, object)
	{
		if(error)
		{
			callback(error, null, null);
			return;
		}

		var countrySet = { };
		var periodSet = { };
		var validYears = { }

		for(var i in object)
		{
			if(!validYears[object[i].country])
			{
				validYears[object[i].country] = [object[i].year];
			}
			else
			{
				validYears[object[i].country].push(object[i].year);	
			}
			countrySet[object[i].country] = 0;
			periodSet[object[i].year] = 0;
		}

		institutional.database.validYears = validYears;

		var countries = [ ];
		for(var i in countrySet)
		{
			countries.push(i);
		}

		countries.sort();

		var periods = [ ];
		for(var i in periodSet)
		{
			periods.push(i);
		}

		periods.sort();

		callback( null, countries, periods );
	}

	institutional.database.loadTable("countryyear", onTableLoaded);
}

institutional.database.getCountriesTimeline = function( callback )
{
	function onTableLoaded (error, object)
	{
		if(error)
		{
			callback(error, null, null);
			return;
		}

		var countrySet = { };

		for(var i in object)
		{
			countrySet[object[i].country] = 0;
		}

		var countries = [ ];
		for(var i in countrySet)
		{
			countries.push(i);
		}

		countries.sort();

		callback( null, countries );
	}

	institutional.database.loadTable("countrytimeline", onTableLoaded);
}




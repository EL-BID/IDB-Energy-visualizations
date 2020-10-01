
// This module defines all menus to institutional visualization

institutional.menus = { };

institutional.menus.countriesAndPeriodsWithAll = function(countrySelector, periodSelector, callback)
{

	function generateCountriesAndPeriodsMenu( error, countries, periods )
	{
		if(error)
		{
			console.log(error);
		}

		if(countrySelector)
		{
			var m1 = menus.menu2()
				.columns(2)
				.data( [ countries, [ "ALL" ] ] )
				.label(function(d){return d})
			;

			var d = menus.dropDown2()
				.label("Country: ")
				.menu(m1);
			;

			d3.select(countrySelector)
				.classed("instcountry", true)
				.call(d)
			;
		}

		if(periodSelector)
		{
			var m2 = menus.menu2()
				.columns(2)
				.data( [ periods ] )
				.label(function(d){return d})
			;

			var d2 = menus.dropDown2()
				.label(TL("Period") + ": ")
				.menu(m2);
			;

			d3.select(periodSelector)
				.classed("instperiod", true)
				.call(d2)
			;
		}

		if(callback)
		{
			callback();
		}

	}

	institutional.database.getCountriesAndPeriods(generateCountriesAndPeriodsMenu);
}

institutional.menus.countriesAndPeriods = function(countrySelector, periodSelector, callback)
{

	function generateCountriesAndPeriodsMenu( error, countries, periods )
	{
		if(error)
		{
			console.log(error);
		}

		if(countrySelector)
		{
			var m1 = menus.menu2()
				.columns(2)
				.data( [ countries ] )
				.label(function(d){return TL(d)})
			;

			var d = menus.dropDown2()
				.label(TL("Country") + ": ")
				.menu(m1);
			;

			d3.select(countrySelector)
				.classed("instcountry", true)
				.call(d)
			;
		}

		if(periodSelector)
		{
			var m2 = menus.menu2()
				.columns(1)
				.data( [ periods ] )
				.label(function(d){return TL(d)})
			;

			var d2 = menus.dropDown2()
				.label(TL("Period") + ": ")
				.menu(m2);
			;

			d3.select(periodSelector)
				.classed("instperiod", true)
				.call(d2)
			;
		}

		if(callback)
		{
			callback();
		}

	}

	institutional.database.getCountriesAndPeriods(generateCountriesAndPeriodsMenu);
}

institutional.menus.twoLetterMenu = function(countrySelector, callback)
{
	var itensLac = [ ];
	var itensNotLac = [ ];

	var notLac = { 'CHN': true, 'USA': true, 'IND': true, 'EUR': true };

	for(var i in threeLetter)
	{
		if(threeLetter[i] == "US")
		{
			lac = false;
		}
		if(notLac[threeLetter[i]])
		{
			itensNotLac.push( { country: threeLetter[i], label: threeLetter[i] + " - " + TL(i) });
		}
		else
		{
			itensLac.push( { country: threeLetter[i], label: threeLetter[i] + " - " + TL(i) });
		}
	}

	itensNotLac.push( { country: "ALL", label: TL("ALL") }); 


	if(countrySelector)
	{
		var m1 = menus.menu2()
			.columns(3)
			.data( [ itensLac, itensNotLac ] )
			.label(function(d){return d.label})
		;

		var d = menus.dropDown2()
			.label(TL("Country") + ": ")
			.menu(m1);
		;

		d3.select(countrySelector)
			.classed("threelettermenu", true)
			.call(d)
		;
	}

	if(callback)
	{
		callback();
	}
}

institutional.menus.countriesTimeline = function(countrySelector, callback)
{

	function generateCountriesMenu( error, countries )
	{
		if(error)
		{
			console.log(error);
		}

		if(countrySelector)
		{
			var m1 = menus.menu2()
				.columns(2)
				.data( [ countries ] )
				.label(function(d){return TL(d)})
			;

			var d = menus.dropDown2()
				.label(TL("Country") + ": ")
				.menu(m1);
			;

			d3.select(countrySelector)
				.classed("instcountry", true)
				.call(d)
			;
		}

		if(callback)
		{
			callback();
		}

	}

	institutional.database.getCountriesTimeline(generateCountriesMenu);
}


institutional.menus.sectors = function(selector, callback)
{
	var sectors = [ "Hydrocarbon", "Electricity" ]; 

	function getText(d) { return d == "Hydrocarbon" ? TL("hydrocarbonupper") : TL(d) };

	function getCssClass(d) { return d };

	menus.image()
		.data(sectors)
		.text(getText)
		.cssClass(getCssClass) 
		.generate(selector)
	;

	if(callback)
	{
		callback();
	}
}



// This module defines all menus to energy visualization

energy.menus = { };

// Product Image Menu - selector is a string containg a unique css selection,
// for example "#menu1", in which the menu product should be generated
energy.menus.products = function(selector, callback)
{
	// Producs legend and css class name
	var products = 
	[
		{ legend: TL("Crude Oil")        , className: "Crude"       , enLabel: "Crude Oil"        }, 
		{ legend: TL("Natural Gas")      , className: "Gas"         , enLabel: "Natural Gas"      }, 
		{ legend: TL("Coal")             , className: "Coal"        , enLabel: "Coal"             }, 
		{ legend: TL("Geothermal")       , className: "Geothermal"  , enLabel: "Geothermal"       },
		{ legend: TL("Hydro")            , className: "Hydro"       , enLabel: "Hydro"            },
		{ legend: TL("Solar & Wind")     , className: "Solar"       , enLabel: "Solar & Wind"     },
		{ legend: TL("Nuclear")          , className: "Nuclear"     , enLabel: "Nuclear"          },
		{ legend: TL("Biocomb. & Waste") , className: "CRW"         , enLabel: "Biocomb. & Waste" },
		{ legend: TL("Oil Products")     , className: "Oil_Products", enLabel: "Oil Products"     },
		{ legend: TL("Electricity")      , className: "Electricity" , enLabel: "Electricity"      }    
	];

	// Getter for text property in data
	function getText(d) { return d.legend; }

	// Getter for css class name in data
	function getCssClass(d) { return d.className; }

	// Configure and generate the menu into selector element
	menus.image()
		.data(products)
		.text(getText)
		.cssClass(getCssClass) 
		.generate(selector)
	;

	if(callback)
	{
		callback();
	}

}

// Product Image Menu - selector is a string containg a unique css selection,
// for example "#menu1", in which the menu product should be generated
energy.menus.products2 = function(selector, callback)
{
	// Producs legend and css class name
	var products = 
	[
		{ legend: TL("Crude Oil")        , className: "Crude"      , enLabel: "Crude Oil"        }, 
		{ legend: TL("Natural Gas")      , className: "Gas"        , enLabel: "Natural Gas"      }, 
		{ legend: TL("Coal")             , className: "Coal"       , enLabel: "Coal"             }, 
		{ legend: TL("Geothermal")       , className: "Geothermal" , enLabel: "Geothermal"       },
		{ legend: TL("Hydro")            , className: "Hydro"      , enLabel: "Hydro"            },
		{ legend: TL("Solar & Wind")     , className: "Solar"      , enLabel: "Solar & Wind"     },
		{ legend: TL("Nuclear")          , className: "Nuclear"    , enLabel: "Nuclear"          },
		{ legend: TL("Biocomb. & Waste") , className: "CRW"        , enLabel: "Biocomb. & Waste" }
 	];

	// Getter for text property in data
	function getText(d) { return d.legend; }

	// Getter for css class name in data
	function getCssClass(d) { return d.className; }

	// Configure and generate the menu into selector element
	menus.image()
		.data(products)
		.text(getText)
		.cssClass(getCssClass) 
		.generate(selector)
	;

	if(callback)
	{
		callback();
	}

}

energy.menus.products3 = function(selector, callback)
{
	// Producs legend and css class name
	var products = 
	[
		{ legend: TL("Oil Products") , className: "Oil_Products", enLabel: "Oil Products" },
		{ legend: TL("Electricity")  , className: "Electricity" , enLabel: "Electricity"  }    
    ];

	// Getter for text property in data
	function getText(d) { return d.legend; }

	// Getter for css class name in data
	function getCssClass(d) { return d.className; }

	// Configure and generate the menu into selector element
	menus.image()
		.data(products)
		.text(getText)
		.cssClass(getCssClass) 
		.generate(selector)
	;

	if(callback)
	{
		callback();
	}

}


energy.menus.countriesAndPeriods = function(countrySelector, periodSelector, callback)
{

	function generateCountriesAndPeriodsMenu( lac, notLac, periods, years , regions )
	{
		if(countrySelector)
		{

			var m1 = menus.menu2()
				.columns(3)
				.data( [ lac, notLac, regions ] )
				.label(function(d){return TL(d.abbreviation)})
			;

			var d = menus.dropDown2()
				.label(TL("Country") + ": ")
				.menu(m1);
			;

			d3.select(countrySelector)
				.classed("country", true)
				.call(d)
			;
		}

		if(periodSelector)
		{
			var m2 = menus.menu2()
				.columns(4)
				.data( [ years, periods ] )
				.label(function(d){return d})
			;

			var d2 = menus.dropDown2()
				.label(TL("Period") + ": ")
				.menu(m2);
			;

			d3.select(periodSelector)
				.classed("period", true)
				.call(d2)
			;
		}

		if(callback)
		{
			callback();
		}
	}

	energy.database.getCountriesAndPeriods(generateCountriesAndPeriodsMenu);
}

energy.menus.countriesAndPeriods2 = function(countrySelector, periodSelector, callback)
{

	function generateCountriesAndPeriodsMenu( lac, notLac, periods, years , regions)
	{
		if(countrySelector)
		{
			var m1 = menus.menu3()
				.columns(3)
				.data( [ lac, notLac, regions ] )
				.label(function(d){return TL(d.abbreviation)})
			;

			var d = menus.dropDown2()
				.label(TL("Country") + ": ")
				.menu(m1);
			;

			d3.select(countrySelector)
				.classed("country", true)
				.call(d)
			;
		}

		if(periodSelector)
		{
			var m2 = menus.menu2()
				.columns(4)
				.data( [ years, periods ] )
				.label(function(d){return d})
			;

			var d2 = menus.dropDown2()
				.label(TL("Period") + ": ")
				.menu(m2);
			;

			d3.select(periodSelector)
				.classed("period", true)
				.call(d2)
			;
		}

		if(callback)
		{
			callback();
		}
	}

	energy.database.getCountriesAndPeriods(generateCountriesAndPeriodsMenu);
}


energy.menus.destinations = function(selector, callback)
{
	var destinations = [ "Imports","Exports","Production","Consumption","Transformation" ];

	var m2 = menus.menu2()
		.columns(1)
		.data( [ destinations ] )
		.label(function(d){return TL(d)})
	;

	var d2 = menus.dropDown2()
		.label(TL("Flow") + ": ")
		.menu(m2);
	;

	d3.select(selector)
		.classed("destination", true)
		.call(d2)
	;

	if(callback)
	{
		callback();
	}
}

energy.menus.periodicity = function(selector, callback)
{
	var periodicity = [ "Averages", "Annual" ];

	var m2 = menus.menu2()
		.columns(2)
		.data( [ periodicity ] )
		.label(function(d){return TL(d)})
	;

	var d2 = menus.dropDown2()
		.label(TL("Period") + ": ")
		.menu(m2);
	;

	d3.select(selector)
		.classed("periodicity", true)
		.call(d2)
	;

	if(callback)
	{
		callback();
	}
}


energy.menus.sectors = function(selector, callback)
{
	var sectors = [ "Commercial", "Industry", "Residential", "Transport", "Others" ]; 

	function getText(d) { return TL(d) }

	function getCssClass(d) { return d }

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


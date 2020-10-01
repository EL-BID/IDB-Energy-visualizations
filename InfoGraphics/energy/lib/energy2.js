var energy = { };

energy.updateAbstract = function()
{
    return;
    
	var a = [];
	a[0] = 	d3.select("#menu1 span.MenuValue").text(); // menus.getSelectedText("#menu1");
	a[1] = menus.getSelectedText("#menu2");
	a[2] = menus.getSelectedText("#menu3");

	var abstract = viewNames[context.view];
	var sep = " > ";
	for(var i in a)
	{
		if(a[i])
		{
			abstract += sep + a[i];
		}
	}

	var sel = d3.select(".abstract");
	if(sel.empty())
	{
		var svg = d3.select(".datavis");
		var w = parseInt(svg.attr("width"));
		var h = parseInt(svg.attr("height"));
		svg.attr("height",h+50);

		var g = svg.append("g")
			.attr("class","imageInformation")
			.attr("transform","translate(0,"+h+")")
		;

		g.append("text")
			.attr("class","abstract")
			.attr("y",10)
			.attr("x",20)
			.text(abstract)
		;

		g.append("text")
			.attr("class","sourceText")
			.attr("y",-5)
			.attr("x",w-20)
			.attr("text-anchor","end")
			.text(ENERGY_IMAGE_SOURCE_TEXT)
		;

		g.append("text")
			.attr("class","sourceText")
			.attr("y",10)
			.attr("x",w-20)
			.attr("text-anchor","end")
			.text(ENERGY_IMAGE_SOURCE_TEXT2)
		;
		
		g.append("text")
			.attr("class","sourceURL")
			.attr("y",25)
			.attr("x",w-20)
			.attr("text-anchor","end")
			.text(ENERGY_IMAGE_SOURCE_URL)
		;
	}
	else
	{
		sel.text(abstract);
	}

	function disableMenuItens(enabledCountries, enabledPeriods)
	{
		menus.disableByCriteria( ".country" ,  function(d) { return !enabledCountries[d.country] } );
		menus.disableByCriteria( ".period"  ,  function(d) { return !enabledPeriods[d] } );
	}

	var country = menus.getSelectedObject(".country");
	var period = menus.getSelectedText(".period");

	if(country && period)
	{
		energy.database.getEnabledCountriesAndPeriod(country.country, period, disableMenuItens);
	}
}


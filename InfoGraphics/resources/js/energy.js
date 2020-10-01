var energy = { };

var firstTimeUpdateAbstract = true;

energy.updateAbstract = function()
{    
	var a = arguments;
    
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
		var svg = d3.select("#visualization svg");
		var w = parseInt(svg.attr("width"));
		var h = parseInt(svg.attr("height"));
		var isNewerVisualization = parseInt(context.view.substring(1,2)) > 2;
		var dy = isNewerVisualization ? 25 : 50;

		if(firstTimeUpdateAbstract)
		{
			if (!isNewerVisualization) {
				h += (context.view == "v11" ? 80 : 50);
			 	svg.attr("height",h);
			}
			firstTimeUpdateAbstract = false;
		}

		var g = svg.append("g")
			.attr("class","imageInformation")
			.attr("transform","translate(0,"+(h-dy)+")")
		;

		g.append("text")
			.attr("class","abstract")
			.attr("y",10)
			.attr("x",20)
			.text(abstract)
		;

		// quit here if showing abstract for the newer visualizations
		if (isNewerVisualization) return; 

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
}


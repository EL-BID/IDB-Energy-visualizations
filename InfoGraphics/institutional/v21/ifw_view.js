var ifw = ifw || { };

ifw.getConfiguration = function()
{
	var resp = { }, lineBreak = { };
	
	resp.lineBreak = lineBreak;

	// Configuration Parameters

	resp.headerRowHeight       = 40    ;
	resp.headerColWidth        = 80    ;
	resp.diameterMarketShare   =  0.55 ;
	resp.diameterPublicPrivate =  0.60 ;
	resp.diameterRegulator     =  0.80 ;
	resp.diameterConsumption   =  0.75 ;
	resp.svgWidth              = 930   ;
	resp.svgHeight             = 500   ;
    
	// How to break Lines in header - \n means line break

	lineBreak["Exploration/Production"] = "Exploration\nProduction";
	lineBreak["Oil Derivatives"] = "Oil\nDerivatives";
	lineBreak["Derivados del petróleo"] = "Derivados del\npetróleo";
	lineBreak["Distribution/Final Sale"] = "Distribution\nFinal Sale";
	lineBreak["Exploración/Producción"] = "Exploración\nProducción";
	lineBreak["Cordinación de Despacho"] = "Cordinación\nde Despacho";
	lineBreak["Dispatch Coordination"] = "Dispatch\nCoordination";
	lineBreak["Distribución/Venta Final"] = "Distribución\nVenta Final";
	lineBreak["Petróleo crudo"] = "Petróleo\nCrudo";
	lineBreak["Derivados de petróleo"] = "Derivados\nde petróleo";
	
	return resp;
}

ifw.getData = function( country, year, sector, svgElement )
{
	function getResponse(error, data)
	{
		if(error)
		{
			alert("Could not load data for " + country + " / " + year);
			return;
		}

		var regulation = { }, role = { }, product = { };

		if(sector == "Hydrocarbon")
		{
			role = 
			{ 
				"Exploration/Production": { }, 
				"Transformation" : { }, 
				"Transportation" : { },
				"Distribution/Final Sale" : { },
				"Imports" : { },
				"Exports" : { },
				"Consumption" : { }
			};

			product = 
			{
				"Natural Gas" : { },
				"Crude Oil" : { },
				"Oil Derivatives" : { },
				"LPG" : { }
			};
		}
		else
		{
			role = 
			{ 
				"Generation": { }, 
				"Transmission" : { }, 
				"Distribution/Final Sale" : { },
				"Dispatch Coordination" : { },
				"Commercialization" : { },
				"Consumption" : { }
			};

			product = 
			{
				"Power" : { }
			};
		}

		for(var i in data)
		{
			var row = data[i];

			if(row.role == "Policy" || row.role == "Regulation")
			{
				regulation[row.player] = { acronym: row.acronym };
			}
		}

		for(var i in product)
		{
			var row = product[i];
			for(var j in role)
			{
				row[j] = { product: i, role: j, regulation : [ ], publicPlayer: [ ], privatePlayer: [ ] };
			} 
		}

		var player = { };

		for(var i in data)
		{
			var row = data[i];

			var p = product[row.product];
			if(p)
			{
				var r = p[row.role];
				if(r)
				{
					if(regulation[row.player] && row.role != "Consumption")
					{
						r.regulation.push(row.player);
					}
					else
					{
						if(!player[row.player])
						{
							player[ row.player ] = { playerName: row.player, acronym: row.acronym, "public": row["public"], maxMarketshare:0, consumptionOnly: row.role == "Consumption" };
						}
						else
						{
							player[ row.player ].consumptionOnly &= row.role == "Consumption";
						}
						var v = row["public"] && row.role != "Consumption" ? r.publicPlayer : r.privatePlayer;
						if(row.marketshare != 0)
						{
							v.push( { role: row.role, player: row.player, marketshare: row.marketshare } );
							if(row.role != "Consumption")
							{
								if(player[row.player].maxMarketshare < row.marketshare)
								{
									player[row.player].maxMarketshare = row.marketshare;
								}
							}
						}
					}
				}
			}
		}

		var vPlayer = [];

		for(var p in player)
		{
			vPlayer.push(player[p]);
		}

		vPlayer.sort(function(a,b){return b.maxMarketshare-a.maxMarketshare});

		var k = 0;
		var l = 0;
		for(var p in vPlayer)
		{
			if(!vPlayer[p].consumptionOnly)
			{
				vPlayer[p].cssClass = "player" + k;
				k++;
			}
			else
			{
				vPlayer[p].cssClass = "consumption" + l;
				l++;
			}
		}

		var regCount = 0;
		for(var i in regulation)
		{
			regCount++;
		}

		var k = 0;
		for(var i in regulation)
		{
			regulation[i].position = k / regCount;
			k++;
		}

		var drawData = { };
		drawData.regulation = regulation;
		drawData.role = role;
		drawData.product = product;
		drawData.player = player;

		ifw.draw(drawData, svgElement);
	}

	var prefix = sector == "Electricity" ? "PW" : "HC";

	d3.json(P + "/institutional/Resources/data/" + prefix + "-" + country + " " + year + ".json", getResponse);

	context.view = "v21";
	context.country = country;
	context.year = year;
	context.product = sector;
    
    institutional.updateAbstract(TL(country),year,sector);

	context.dataFolder = P + "/institutional/Resources/data/";
	context.csvDataFolder = P + "/institutional/Resources/csvData/";        	
	context.fileName = prefix + "-" + country + " " + year + ".zip";
	context.fileList = [ prefix + "-" + country + " " + year + ".json" ];
	context.csvFileList = [ prefix + "-" + country + " " + year + ".csv" ];
}

ifw.label = function()
{
	var text       = function(d,i) { return "" };
	var lineHeight = function(d,i) { return 15 };

	function dataMultilineText()
	{
		return function(d,i)
		{
			var resp = [];
			var vtext = text(d,i).split("\n");
			var lh = lineHeight(d,i);
			var start = ((-vtext.length*lh)/2) + (lh/2);
			for(var i in vtext)
			{
				resp.push( { text:vtext[i], dy:(start+i*lh) } );
			}
			return resp;
		}
	}

	function resp() 
	{
		this.selectAll("text")
			.data(dataMultilineText())
			.enter()
			.append("text")
			.text(function(d){return d.text})
			.attr("dy",function(d){return d.dy})
		;
	}

	resp.text = function(t)
	{
		text = t;
		return resp;
	}

	resp.lineHeight = function(l)
	{
		lineHeight = l;
		return resp;
	}

	return resp;
}

var consumptionClass, playerClass, regulatorsClass;

ifw.draw = function(data, svgElement)
{
	function translate(x,y)
	{
		return "translate(" + x + "," + y + ")";
	}

	var conf = ifw.getConfiguration();

	var svgWidth  = conf.svgWidth;
	var svgHeight = conf.svgHeight;

	var roles = d3.keys(data.role);
	var products = d3.keys(data.product);

	var colWidth = (svgWidth-conf.headerColWidth) / roles.length;
	var rowHeight = (svgHeight-conf.headerRowHeight) / products.length;

	var horizontalHeader = svgElement.append("g")
		.attr("class","horizontalHeader")
	;
	
	horizontalHeader.append("rect")
		.attr("class","background")
		.attr("width",svgWidth)
		.attr("height",conf.headerRowHeight)
	;

	var colTitles = ifw.label().text(function(d) { return conf.lineBreak[TL(d)] || TL(d) });

	horizontalHeader.selectAll(".colheader")
		.data(roles)
		.enter()
		.append("g")
		.attr("class","colheader")
		.attr("transform",function(d,i) { return translate(conf.headerColWidth+colWidth/2+i*colWidth,conf.headerRowHeight/2) })
		.call(colTitles)
	;

	var verticalHeader = svgElement.append("g")
		.attr("class","verticalHeader")
		.attr("transform",translate(0,conf.headerRowHeight))
	;
	
	verticalHeader.append("rect")
		.attr("class","background")
		.attr("width",conf.headerColWidth)
		.attr("height",svgHeight-conf.headerRowHeight)
	;

	var rowTitles = ifw.label().text(function(d) { return conf.lineBreak[TL(d)] || TL(d) });

	verticalHeader.selectAll(".rowheader")
		.data(products)
		.enter()
		.append("g")
		.attr("class","rowheader")
		.attr("transform",function(d,i) { return translate(conf.headerColWidth-5,(i+0.5)*rowHeight) })
		.call(rowTitles)
	;

	var cellsArea = svgElement.append("g")
		.attr("class","cellsArea")
		.attr("transform",translate(conf.headerColWidth,conf.headerRowHeight))
	;
		
	var productsData = d3.values(data.product)

	var rows = cellsArea.selectAll(".row")
		.data(productsData)
		.enter()
		.append("g")
		.attr("transform",function(d,i) { return translate(0,i*rowHeight) })
		.attr("class","row")
	;

	rows.append("rect")
		.attr("class","background")
		.attr("height",rowHeight)
		.attr("width",svgWidth-conf.headerColWidth);
	;

	function marketSharePieChart()
	{
		function arcRadius(d)
		{
			var d = d.data.role == "Consumption" ? conf.diameterConsumption : conf.diameterMarketShare;
			return Math.min(colWidth,rowHeight)*0.5*d;
		}

		var arc = d3.svg.arc().outerRadius(arcRadius);

		var pie = d3.layout.pie().sort(null).value( function(d) { return d.marketshare } );

		function dataFunction(d)
		{
			var d2 = [].concat(d.publicPlayer, d.privatePlayer);
			return pie(d2);
		}

		var marketshare = this.selectAll("marketshare")
			.data(dataFunction)
			.enter()
			.append("g")
			.attr("class","marketshare")
			.attr("transform",translate(colWidth/2,rowHeight/2));
		;
/**
		var playerClassRange = [];
		for(var i = 0; i < 30; i++)
		{
			playerClassRange.push("player"+i);
		}

		playerClass = d3.scale.ordinal()
	    		.range(playerClassRange)
		;
**/
		var consumptionClassRange = [];
		for(var i = 0; i < 30; i++)
		{
			consumptionClassRange.push("consumption"+i);
		}

		consumptionClass = d3.scale.ordinal()
	    		.range(consumptionClassRange)
		;


		function getPathClass(d)
		{
			var player = d.data.player;
			if(d.role == "Consumption")
			{				
				if(data.player[player] && data.player[player].cssClass)
				{
					return data.player[player].cssClass;
				}
				else
				{
					return consumptionClass(player)
				}
			} 
			else
			{
				return data.player[player].cssClass;
			}
		}


		marketshare.append("path")
			.attr("d",function(d) { return arc(d) })
			.attr("class", getPathClass)
		;
	}

	function publicPrivatePieChart()
	{
		var arc = d3.svg.arc().outerRadius(Math.min(colWidth,rowHeight)*0.5*conf.diameterPublicPrivate);

		var pie = d3.layout.pie().sort(null).value( function(d) { return d.playerCount } );

		function dataFunction(d)
		{
			var resp = [ ];
			var publicCount = 0;
			for(var i in d.publicPlayer)
			{
				publicCount += d.publicPlayer[i].marketshare;
			}
			if(publicCount > 0)
			{
				resp.push( { type: 'public', playerCount: publicCount } );
			}
			var privateCount = 0;
			for(var i in d.privatePlayer)
			{
				privateCount += d.privatePlayer[i].marketshare;
			}
			if(privateCount > 0)
			{
				resp.push({ type: 'private', playerCount: privateCount });
			}
			return resp.length > 0 ? pie(resp) : [];
		}

		var publicPrivate = this.selectAll("publicPrivate")
			.data(dataFunction)
			.enter()
			.append("g")
			.attr("class","publicPrivate")
			.attr("transform",translate(colWidth/2,rowHeight/2));
		;

		publicPrivate.append("path")
			.attr("d",function(d) { return arc(d) })
			.attr("class", function(d) { return d.data.type } )
		;
	}

	function regulators()
	{
		var radiusRegulator = Math.min(colWidth,rowHeight)*0.5*conf.diameterRegulator;

		function regulatorsData(d)
		{
			if(d.publicPlayer.length == 0 && d.privatePlayer.length == 0)
			{
				return [];
			}

			var allRegulators = data.regulation;
			var currentRegulator = d.regulation;
			var resp = [ ];
			var startAngle = -Math.PI;
			for(var i in currentRegulator)
			{
				var o = { };
				o.regulator = currentRegulator[i];
				var angle = startAngle - allRegulators[o.regulator].position * 2*Math.PI;
				o.tx = (-Math.sin(angle)*radiusRegulator)+colWidth/2;
				o.ty = (+Math.cos(angle)*radiusRegulator)+rowHeight/2;
				o.angle = ((angle+Math.PI)*180)/(Math.PI);
				resp.push(o);
			}

			return resp;
		}		

		var regulator =	this.selectAll(".regulator")
			.data(regulatorsData)
			.enter()
	      	.append("g")
			.attr("class", "regulator" )
			.attr("transform", function(d) { return translate(d.tx,d.ty) + "rotate(" + d.angle + ")" } )
		;

		var regulatorsClassRange = [];
		for(var i = 0; i < 30; i++)
		{
			regulatorsClassRange.push("regulator"+i);
		}

		regulatorsClass = d3.scale.ordinal()
	    		.range(regulatorsClassRange)
		;

        /*
		regulator.append("path")
			.attr("stroke-width", "4")
			.attr("stroke","red")
			.attr("d", "M0,6 l-6,-12 h12 Z")
		;
        */

		regulator.append("path")
			.attr("class", function(d) { return regulatorsClass(d.regulator) })
//			.attr("stroke-width", "1.5")
//			.attr("stroke","white")
			.attr("d", "M0,8 l-8,-16 h16 Z")
		;

	}

	function popup(d,col,lin)
	{
		svgElement.selectAll("g.popup").remove();

		if(d.publicPlayer.length + d.privatePlayer == 0)
		{
			svgElement.selectAll(".cell").classed("disabled",false);
			return;
		} 

		var clickedCell = this;
		svgElement.selectAll(".cell").classed("disabled", function(d) { return this != clickedCell });
		
		var popup = svgElement.append("g")
			.attr("class","popup")
		;

		var titleBackground = popup.append("rect");

		var background = popup.append("rect");

		var y = 0;
		var dy = 20;

		popup.append("text")
			.text(TL(d.product))
			.attr("class","h1")
			.attr("dy",y)
		;

		y+=dy;

		popup.append("text")
			.text(TL(d.role))
			.attr("class","h2")
			.attr("dy",y)
		;

		y+=dy+10;

		if(d.role == "Consumption")
		{			
			popup.append("text")
				.text(TL("Players"))
				.attr("class","h3")
				.attr("dy",y)
			;
			y+=dy;
		}

		var numberFormatFunction = d3.format(",.1f");

		var k = 0;		
		
		for(var i in d.publicPlayer)
		{
			if(i == 0 && d.role != "Consumption")
			{			
				popup.append("text")
					.text(d.publicPlayer.length == 1 ? TL("Public Player") : TL("Public Players"))
					.attr("class","h3")
					.attr("dy",y)
				;
				y+=dy;
			}

			var perc = numberFormatFunction(d.publicPlayer[i].marketshare*100);

			var player = d.publicPlayer[i].player;

			var cssClass;

			if(d.role == "Consumption")
			{
				if(data.player[player] && data.player[player].cssClass)
				{
					cssClass = data.player[player].cssClass;
				}
				else
				{
					cssClass = consumptionClass(player)
				}
			} 
			else
			{
				cssClass = data.player[player].cssClass;
			}

			popup.append("circle")
				.attr("cx",8)
				.attr("cy",y-1)
				.attr("r",6)
				.attr("fill","none")
				.attr("stroke","red")
				.attr("stroke-width",1.5)
			;

			popup.append("circle")
				.attr("class",cssClass)
				.attr("cx",8)
				.attr("cy",y-1)
				.attr("r",4)
			;

			var texto = player + " (" + perc + "%)";

			popup.append("text")
				.text(texto)
				.attr("y",y)
				.attr("x",18)
			;

			y += dy;
		}

		for(var i in d.privatePlayer)
		{
			if(i == 0 && d.role != "Consumption")
			{			
				popup.append("text")
					.text(d.privatePlayer.length == 1 ? TL("Private Player") : TL("Private Players"))
					.attr("class","h3")
					.attr("dy",y)
				;
				y+=dy;
			}

			var perc = numberFormatFunction(d.privatePlayer[i].marketshare*100);

			var player = d.privatePlayer[i].player;

			var cssClass;

			if(d.role == "Consumption")
			{
				if(data.player[player] && data.player[player].cssClass)
				{
					cssClass = data.player[player].cssClass;
				}
				else
				{
					cssClass = consumptionClass(player)
				}
			} 
			else
			{
				cssClass = data.player[player].cssClass;
			}

			popup.append("circle")
				.attr("class",cssClass)
				.attr("cx",8)
				.attr("cy",y-1)
				.attr("r",5)
			;

			var texto = player + " (" + perc + "%)";

			popup.append("text")
				.text(texto)
				.attr("y",y)
				.attr("x",18)
			;

			y += dy;
		}


		if(d.regulation.length > 0)
		{

			popup.append("text")
				.text(TL("Government Agency"))
				.attr("class","h3")
				.attr("dy",y)
			;

			y += dy;


			for(var i in d.regulation)
			{
				var regulation = d.regulation[i];
				var cssClassRegulation = regulatorsClass(regulation);

				popup.append("path")
					.attr("class",cssClassRegulation)
					.attr("stroke-width", "1.5")
					//.attr("stroke","red")
					.attr("d","M0,0L10,0L5,10Z")
					.attr("transform","translate(3," + (y-6) + ")")
				;

				popup.append("text")
					.text(d.regulation[i])
					.attr("y",y)
					.attr("x",18)
				;

				y += dy;
			}
		}

		var bb = popup.node().getBBox();

		function closePopup()
		{
			svgElement.selectAll(".cell").classed("disabled",false);
			svgElement.selectAll("g.popup").remove();
		}

		titleBackground
			.attr("y",bb.y-5)
			.attr("x",bb.x-5)
			.attr("width",bb.width+10)
			.attr("height",50)
			.attr("fill","rgb(0,106,148)")
			.on("click", closePopup)
		;

		background
			.attr("y",50+bb.y-5)
			.attr("x",bb.x-5)
			.attr("width",bb.width+10)
			.attr("height",bb.height+10-50)
			.attr("fill","rgb(255,255,255)")
		;

		popup
			.append("line")
			.attr("x1",bb.x-4)
			.attr("y1",50+bb.y-5)
			.attr("x2",bb.x-4)
			.attr("y2",50+bb.y-5+bb.height+10-50)
			.attr("stroke","#e1e1e1")
			.attr("stroke-width",2)
		;

		popup
			.append("line")
			.attr("x1",bb.x-4+bb.width+8)
			.attr("y1",50+bb.y-5)
			.attr("x2",bb.x-4+bb.width+8)
			.attr("y2",50+bb.y-5+bb.height+10-50)
			.attr("stroke","#e1e1e1")
			.attr("stroke-width",2)
		;

		popup
			.append("line")
			.attr("x1",bb.x-4)
			.attr("y1",50+bb.y-5+bb.height+10-50)
			.attr("x2",bb.x-4+bb.width+8)
			.attr("y2",50+bb.y-5+bb.height+10-50)
			.attr("stroke","#e1e1e1")
			.attr("stroke-width",2)
		;

		bb = popup.node().getBBox();

		var mat = this.getCTM();
		var bb2 = this.getBBox();

		var tx, ty;
	
		if(col < 3)
		{
			tx = mat.e + bb2.width;
		}
		else
		{
			tx = mat.e - bb.width;
		}

		if(products.length == 1)
		{
			ty = -75 + mat.f + (bb2.height-bb.height)/2;
		}
		else if(lin < 2)
		{
			ty = -75 + mat.f + (bb2.height/2);
		}
		else
		{
			ty = -75 + mat.f - (bb.height - bb2.height/2);
		}

		popup
			.attr("transform","translate(" + tx + "," + ty + ")")
		;

	}

	var cells = rows.selectAll(".cell")
		.data(function(d){ return d3.values(d) })
		.enter()
		.append("g")
		.attr("class","cell")
		.attr("transform", function(d,i) { return translate(i*colWidth,0) })
		.on("click", popup);
	;

	cells.append("rect")
		.attr("class","background")
		.attr("width",colWidth)
		.attr("height",rowHeight)
	;

	cells.call(publicPrivatePieChart);
	cells.call(marketSharePieChart);
	cells.call(regulators);

	svgElement.append("line")
		.attr("x1", 0)
		.attr("x2", conf.headerColWidth)
		.attr("y1", conf.headerRowHeight+1)
		.attr("y2", conf.headerRowHeight+1)
		.attr("class", "headerseparator")
	;

	svgElement.append("line")
		.attr("x1", conf.headerColWidth + 4*colWidth)
		.attr("x2", conf.headerColWidth + 4*colWidth)
		.attr("y1", 0)
		.attr("y2", conf.headerRowHeight)
		.attr("class", "headerseparator")
	;

	svgElement.append("line")
		.attr("x1", conf.headerColWidth + 6*colWidth)
		.attr("x2", conf.headerColWidth + 6*colWidth)
		.attr("y1", conf.headerRowHeight)
		.attr("y2", 0)
		.attr("class", "headerseparator")
	;

	svgElement.append("line")
		.attr("x1", conf.headerColWidth + 4*colWidth)
		.attr("x2", conf.headerColWidth + 4*colWidth)
		.attr("y1", conf.headerRowHeight)
		.attr("y2", svgHeight)
		.attr("class", "separator")
	;

	svgElement.append("line")
		.attr("x1", conf.headerColWidth + 6*colWidth)
		.attr("x2", conf.headerColWidth + 6*colWidth)
		.attr("y1", conf.headerRowHeight)
		.attr("y2", svgHeight)
		.attr("class", "separator")
	;

	svgElement.append("line")
		.attr("x1", conf.headerColWidth + 7*colWidth)
		.attr("x2", conf.headerColWidth + 7*colWidth)
		.attr("y1", conf.headerRowHeight)
		.attr("y2", svgHeight)
		.attr("class", "separator")
	;

	svgElement.append("line")
		.attr("x1", conf.headerColWidth)
		.attr("x2", svgWidth)
		.attr("y1", svgHeight)
		.attr("y2", svgHeight)
		.attr("class", "separator")
	;

}

/*
ifw.reload = function(country, year, sector, selection)
{
	var conf = ifw.getConfiguration();

	d3.select(selection).select("svg").remove();

	var svg = d3.select(selection)
		.append("svg:svg")
	    .attr("class","datavis")		
		.attr("width", conf.svgWidth)
		.attr("height", conf.svgHeight)
	;

	ifw.getData(country, year, sector, svg);
}
*/

ifw.reload = function(country, year, sector, selection)
{
	selection.selectAll("*").remove();
	ifw.getData(country, year, sector, selection);
}


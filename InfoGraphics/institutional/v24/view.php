<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/institutional/v24/style.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/institutional/Resources/css/idbmenus.css" />

<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/lib/institutional.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/lib/database.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/lib/threeLetter.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/Resources/js/arrayutil.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/Resources/js/lcgchart.js"></script>        
<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/Resources/js/idbmenus.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/Resources/js/iconpath.js"></script>
        
<?php

function urlArg($name,$default) {
    if (array_key_exists($name, $_GET)) return $_GET[$name];
    return $default;
}

$dataFolder = "$rootdir/institutional/Resources/data";
$csvDataFolder = "$rootdir/institutional/Resources/csvData";

$defaultYear = urlArg ("year", $defaultYear);
$defaultCountry = urlArg ("country", "Mexico");
$defaultSector = urlArg ("sector", "Hydrocarbon");

?>

<script>

	context.view = "v24";

    var defaultCountry = "<?php echo $defaultCountry;?>";
	var defaultSector = "<?php echo $defaultSector;?>";

	var dataFolder = P + "/institutional/Resources/data";
	var csvDataFolder = P + "/institutional/Resources/csvData";
    var countryInterface, sectorInterface;
    
	function main(selector)
	{    
            
        var svgWidth              = 930   ;
        var svgHeight             = 800   ;
        var height                = 650   ;
        
   	    /* Create the svg element */
	    var theSVG = d3.select(selector)
            .append("svg:svg")
            .attr("class","datavis")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
        ;

        var theVIS = theSVG
            .append("svg:g")
            .attr("id","chart")
            .attr ("transform", "translate(0,"+(svgHeight-height)/2+")");    
        ;
            
		var interfaces = idb.menuBar (theSVG, theVIS, [idb.countryInstitutionalWithThreeLetters, idb.institutionalSector]);
        countryInterface = interfaces[0];
        sectorInterface = interfaces[1];
            
        countryInterface.select([defaultCountry]);
        sectorInterface.select(defaultSector);
            
        sectorInterface.onChange = function(){chart(theVIS);};
        countryInterface.onChange = function(){selectCurrentCountry(theVIS);};
        
        chart(theVIS);            
	}

	function enableItens(jsondata)
	{
		var countries = [ "ALL" ];
        for(var i in jsondata)
        {
            var countryName = jsondata[i].country;
            countries.push(threeLetter[countryName] + " - " + countryName);
        }            
        countryInterface.active(countries);
	}

	function chartHydrocarbon(selector, jsondata)
	{
		enableItens(jsondata);

		var product = [ "Crude Oil", "Natural Gas", "LPG", "Oil Products" ];
		var destination = [ "Exploration/Production", "Imports", "Exports", "Distribution/Final Sale"]; 

		var width = 930;
		var itemSize = 25;
		var itemPerRow = 6;
		var colSpc = 10;
		var countries = d3.values(threeLetter);
		var colWidth = itemSize * itemPerRow;
		var rowHeight = (itemSize * countries.length) / itemPerRow;
		var height = (rowHeight*destination.length) + 250;
		var dx = (width-((colWidth+colSpc)*product.length))/2;
            
		var countriesNames = d3.keys(threeLetter);

		var map = { };

		for(var i in jsondata)
		{
			var row = jsondata[i];
			var k = row.country + "-" + row.product + "-" + row.role;
			map[k] = row.open ? "yes" : "no";
		}

		function getClass(d,i,j)
		{
			var countryName = countriesNames[i];
			var prod = product[~~(j/destination.length)];
			var role = destination[j % destination.length];
			var k = countryName + "-" + prod + "-" + role;
			var v = map[k];
			if(!v)
			{
				return "item ";
			}
			return "item " + v;
		}

		var svg = selector;

		var columns = svg.selectAll(".column")
			.data(product)
			.enter()
			.append("g")
			.attr("class","column")
			.attr("transform", function(d,i) { return "translate(" + (dx+(colWidth+colSpc)*i) + ", 0)" })
		;

		columns.append("text")
			.text(function(d) { return TL(d) })
			.attr("x",colWidth/2)
			.attr("y",35)
			.attr("class","colHeader")
			.attr("text-anchor", "middle")
		;

		var rows = columns.selectAll(".row")
			.data(destination)
			.enter()
			.append("g")
			.attr("class","row")
			.attr("transform", function(d,i) { return "translate(0," + (60+(rowHeight+10+2*colSpc)*i) + ")" })
		;

		svg.selectAll(".rowHeader")
			.data(destination)
			.enter()
			.append("text")
			.text(function(d) { return TL(d) })
			.attr("y",function(d,i) { return 60 + rowHeight/2 + (rowHeight+10+2*colSpc)*i })
			.attr("x",(dx+(colWidth+colSpc)*product.length))
			.attr("class","rowHeader")
			.attr("text-anchor", "start")
		;

		var cell = rows.append("g");

		var item = cell.selectAll(".item")
			.data(countries)
			.enter()
			.append("g")
			.attr("class", getClass)
		;

		item.append("rect")
			.attr("x", function(d,i) { return (i%itemPerRow) * itemSize } ) 
			.attr("y", function(d,i) { return ~~(i/itemPerRow) * itemSize })
			.attr("width",itemSize)
			.attr("height",itemSize)
		;

		item.append("text")
			.text(function(d) { return d })
			.attr("x", function(d,i) { return itemSize/2 + (i%itemPerRow) * itemSize } ) 
			.attr("y", function(d,i) { return itemSize/2 + ~~(i/itemPerRow) * itemSize })
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "middle")
		;

		item.each(function(d,i,j) { if(j==3) { d3.select(this).remove() } });

		var legend = svg.append("g")
			.attr("class", "legend")
			.attr("transform", "translate(" + (width-170) + ", " + (height-70) + ")");
		;

		legend.append("rect")
			.attr("width",20)
			.attr("height",20)
			.attr("x", 0)
			.attr("y", 0)
			.attr("class","yes")
		;

		legend.append("rect")
			.attr("width",20)
			.attr("height",20)
			.attr("x", 40)
			.attr("y", 0)
			.attr("class","no")
		;

		legend.append("rect")
			.attr("width",20)
			.attr("height",20)
			.attr("x", 80)
			.attr("y", 0)
			.attr("class","noData")
		;

		legend.append("text")
			.text(TL("yes"))
			.attr("text-anchor","middle")
			.attr("x", 10)
			.attr("y", 35)
		;

		legend.append("text")
			.text(TL("no"))
			.attr("x", 50)
			.attr("text-anchor","middle")
			.attr("y", 35)
		;

		legend.append("text")
			.text(TL("no data"))
			.attr("text-anchor","middle")
			.attr("x", 90)
			.attr("y", 35)
		;

		institutional.updateAbstract();

	}


	function chartElectricity (selector, jsondata)
	{
		enableItens(jsondata);

		var destination = [ "Generation", "Transmission", "Dispatch Coordination", "Distribution/Final Sale"]; 
		var product = [ "Electricity" ];

		var width = 930;
		var itemSize = 25;
		var itemPerRow = 6;
		var colSpc = 30;
		var countries = d3.values(threeLetter);
		var colWidth = itemSize * itemPerRow;
		var rowHeight = (itemSize * countries.length) / itemPerRow;
		var height = (rowHeight*product.length) + 200;
		var dx = (width-((colWidth+colSpc)*destination.length))/2;

		var countriesNames = d3.keys(threeLetter);

		var map = { };

		for(var i in jsondata)
		{
			var row = jsondata[i];
			var k = row.country + "-" + row.role;
			map[k] = row.open ? "yes" : "no";
		}

		function getClass(d,i,j)
		{
			var countryName = countriesNames[i];
			var role = destination[~~(j / product.length)];
			var k = countryName + "-" + role;
			var v = map[k];
			if(!v)
			{
				return "item electricity";
			}
			return "item electricity " + v;
		}

		var svg = selector;

		var columns = svg.selectAll(".column")
			.data(destination)
			.enter()
			.append("g")
			.attr("class","column")
			.attr("transform", function(d,i) { return "translate(" + (dx+(colWidth+colSpc)*i) + ", 0)" })
		;

		columns.append("text")
			.text(function(d) { return TL(d) })
			.attr("x",colWidth/2)
			.attr("y",35)
			.attr("class","colHeader")
			.attr("text-anchor", "middle")
		;

		var rows = columns.selectAll(".row")
			.data(product)
			.enter()
			.append("g")
			.attr("class","row")
			.attr("transform", function(d,i) { return "translate(0," + (60+(rowHeight+2*colSpc)*i) + ")" })
		;

		var cell = rows.append("g");

		var item = cell.selectAll(".item")
			.data(countries)
			.enter()
			.append("g")
			.attr("class", getClass)
		;

		item.append("rect")
			.attr("x", function(d,i) { return (i%itemPerRow) * itemSize } ) 
			.attr("y", function(d,i) { return ~~(i/itemPerRow) * itemSize })
			.attr("width",itemSize)
			.attr("height",itemSize)
		;

		item.append("text")
			.text(function(d) { return d })
			.attr("x", function(d,i) { return itemSize/2 + (i%itemPerRow) * itemSize } ) 
			.attr("y", function(d,i) { return itemSize/2 + ~~(i/itemPerRow) * itemSize })
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "middle")
		;

		var legend = svg.append("g")
			.attr("class", "legend electricity")
			.attr("transform", "translate(" + (width-170) + ", " + (height-50) + ")");
		;

		legend.append("rect")
			.attr("width",20)
			.attr("height",20)
			.attr("x", 0)
			.attr("y", 0)
			.attr("class","yes")
		;

		legend.append("rect")
			.attr("width",20)
			.attr("height",20)
			.attr("x", 40)
			.attr("y", 0)
			.attr("class","no")
		;

		legend.append("rect")
			.attr("width",20)
			.attr("height",20)
			.attr("x", 80)
			.attr("y", 0)
			.attr("class","noData")
		;

		legend.append("text")
			.text(TL("yes"))
			.attr("text-anchor","middle")
			.attr("x", 10)
			.attr("y", 35)
		;

		legend.append("text")
			.text(TL("no"))
			.attr("x", 50)
			.attr("text-anchor","middle")
			.attr("y", 35)
		;

		legend.append("text")
			.text(TL("no data"))
			.attr("text-anchor","middle")
			.attr("x", 90)
			.attr("y", 35)
		;

		institutional.updateAbstract();

	}

	function selectCurrentCountry(selector)
	{
		var country = countryInterface.selectedData()[0].substring(0,3);
        if(country == "ALL")
		{
			selector.selectAll("g.item").style("opacity",function(d) { return "1" } );
		}
		else
		{
			selector.selectAll("g.item").style("opacity",function(d) { return d == country ? null : "0.3" } );
		}
	}

	function chart(selector)
	{
		var product = sectorInterface.selectedData()[0];
		context.dataFolder = P + '/institutional/Resources/data/';
		context.csvDataFolder = P + '/institutional/Resources/csvData/';		        	

        selector.selectAll("*").remove();
        if(product == "Hydrocarbon")
		{
			d3.json (dataFolder + '/hydrocarbon.json', function(data) 
			{
		    	context.product = "Hydrocarbon";
				context.fileName = 'hydrocarbon.zip';
				context.fileList = [ 'hydrocarbon.json' ];
				context.csvFileList = [ 'hydrocarbon.csv' ];
				chartHydrocarbon(selector, data) 
			});	
		}
		else
		{
			d3.json (P + '/institutional/Resources/data/electricity.json', function(data) 
			{ 
		    	context.product = "Electricity";
				context.fileName = 'electricity.zip';
				context.fileList = [ 'electricity.json' ];
				context.csvFileList = [ 'electricity.csv' ];
				chartElectricity(selector, data)
			});	
		}
        institutional.updateAbstract(context.product);

	}

</script>


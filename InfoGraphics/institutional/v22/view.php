<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/institutional/v22/style.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/institutional/v22/timeline.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/institutional/Resources/css/idbmenus.css" />

<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/lib/institutional.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/lib/threeLetter.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/v22/timeline.js"></script>
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
$defaultCountry = urlArg ("source", "Mexico");
$defaultSector = urlArg ("sector", "Hydrocarbon");

?>

<script>

	context.view = "v22";
    var defaultCountry = "<?php echo $defaultCountry;?>";;
	var dataFolder = "<?php echo $dataFolder;?>";
    
	var languageSufix = "<?php echo $language;?>";
	if(languageSufix == "es")
	{
		languageSufix = ".es";
	}
	else
	{
		languageSufix = "";
	}

	function main(selector)
	{

        d3.json (dataFolder + "/country-timeline.json", function (data) 
        {
            chart(selector,data);
        });
	}

	function chart(selector, data)
	{        
        var svgWidth              = 930   ;
        var svgHeight             = 540   ;
        var height                = 460   ;
                    
   	    /* Create the svg element */
	    var theSVG = d3.select(selector)
            .append("svg:svg")
            .attr("class","datavis")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
        ;
            
        insertDefs(theSVG);

        var theVIS = theSVG
            .append("svg:g")
            .attr("id","ifchart")
            .attr ("transform", "translate(0,"+(svgHeight-height)+")");    
        ;
            
		var interfaces = idb.menuBar (theSVG, theVIS, [idb.countryInstitutional]);
        var countryInterface = interfaces[0];

		function load()
		{
            var country = countryInterface.selectedData()[0];
            loadTimeline(theVIS,country + languageSufix);
		   	context.country = country;
			context.dataFolder = P + '/institutional/Resources/data/';
			context.csvDataFolder = P + '/institutional/Resources/csvData/';		        	
			context.fileName = 'timeline-' + country + languageSufix + ".zip";
			context.fileList = [ 'timeline-' + country + languageSufix + ".json" ];
			context.csvFileList = [ 'timeline-' + country + languageSufix + ".csv" ];
            institutional.updateAbstract(country);
            
		}

        countryInterface.onChange = load;

        var activeCountries = [ ];
        for(var i in data)
        {
            activeCountries.push(data[i].country);
        }
        countryInterface.active(activeCountries);        
        countryInterface.select([defaultCountry]);            

        load();
            

	} /* END OF CHART FUNCTION */

</script>


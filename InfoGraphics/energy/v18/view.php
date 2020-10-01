
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/v18/style.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/lib/css/menu-product.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/lib/css/menu-sector.css" />
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/resources/css/idbmenus.css" />

<script type="text/javascript" src="<?php echo $rootdir;?>/energy/v18/view.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/energy/lib/energy.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/energy/lib/database.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/shortnames.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/arrayutil.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/productjson.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/lcgchart.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/flowpath.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/electricityjsonutil.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/electricitysankey.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/idbmenus.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/iconpath.js"></script>

<?php

function urlArg($name,$default) {
    if (array_key_exists($name, $_GET)) return $_GET[$name];
    return $default;
}

$dataFolder = "$rootdir/energy/Resources/data";
$csvDataFolder = "$rootdir/energy/Resources/csvData";
$normalizingDataFolder = "$rootdir/energy/Resources/NormalizingData";
$iconFolder = "$rootdir/energy/v15/";
$defaultDestination = urlArg ("flow","Supply");
$defaultPeriod = urlArg ("period", $defaultYear);
$defaultProduct = urlArg ("source", "Oil Products");
$defaultCountry = urlArg ("country", "Dominican Republic");
$defaultUnits = urlArg ("units", "percent");

?>

<script>

var width = 950; /* width of the design */
var svgheight = 650; /* height of the svg */
var height = 500; /* height of the chart */

var unitsTitlePos = [15,15];
var unitsTitle = "Energy units";
var unitsMenuPos = [15,30];
var unitsMenuSize = [50,30];
var units = ["kBOE/day", "GWh/year"];
var energyUnits = 0;

var leftUnitsPos = [130,30];
var rightUnitsPos = [800,30];
var middleUnitsPos = [(130+800)/2,30];
var leftUnitsLegend = units[0];
var rightUnitsLegend = units[1];
var middleUnitsLegend = units[1];

context.view = "v18";

var dataFolder = "<?php echo $dataFolder;?>";
var csvDataFolder = "<?php echo $csvDataFolder;?>";
var normalizingDataFolder = "<?php echo $normalizingDataFolder;?>";

var defaultCountry = "<?php echo $defaultCountry;?>";
var defaultPeriod =  "<?php echo $defaultPeriod;?>";

function main(selector)
{

	d3.json (dataFolder + "/countryperiod.json", function (data) 
	{
		chart(selector,data);
	});
}


</script>
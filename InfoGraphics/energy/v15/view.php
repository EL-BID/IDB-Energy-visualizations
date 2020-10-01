
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/v15/style.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/resources/css/idbmenus.css" />

<script type="text/javascript" src="<?php echo $rootdir;?>/energy/lib/energy.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/energy/lib/database.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/arrayutil.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/shortnames.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/lcgchart.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/idbmenus.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/iconpath.js"></script>
<script src="<?php echo $rootdir;?>/energy/v15/js/visualizacao_v2.js" charset="utf-8"></script>

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
$defaultCountry = urlArg ("country", "LAC");
$defaultUnits = urlArg ("units", "percent");

?>


<script type="text/javascript">
	
context.view = "v15";

var dataFolder = "<?php echo $dataFolder;?>";
var csvDataFolder = "<?php echo $csvDataFolder;?>";
var iconFolder = "<?php echo $iconFolder;?>";

var defaultCountry = "<?php echo $defaultCountry;?>";
var defaultProduct = "<?php echo $defaultProduct;?>";
var defaultFlow = TL("<?php echo $defaultDestination;?>");
var defaultUnits = "<?php echo $defaultUnits;?>";
var defaultPeriod =  "<?php echo $defaultPeriod;?>";

var width = 950; /* width of the design */
var svgheight = 650; /* height of the svg */
var height = 500; /* height of the chart */

function main(selector) {

	d3.json (dataFolder + "/countryperiod.json", function (data) 
		{
			chart(selector, data, defaultCountry, defaultPeriod, defaultProduct);
		});
}

</script>

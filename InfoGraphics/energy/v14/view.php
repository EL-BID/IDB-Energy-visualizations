
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/v14/style.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/lib/css/menu-product.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/lib/css/menu-sector.css" />
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/resources/css/idbmenus.css" />

<script type="text/javascript" src="<?php echo $rootdir;?>/energy/v14/view.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/energy/lib/energy.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/energy/lib/database.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/shortnames.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/arrayutil.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/productjson.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/lcgchart.js"></script>
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
$defaultDestination = urlArg ("flow","Supply");
$defaultPeriod = urlArg ("period", "Years");
$defaultProduct = urlArg ("source", "All Primary");
$defaultCountry = urlArg ("source", "Central America");
$defaultUnits = urlArg ("units", "percent");

?>

<script>

var dataFolder = "<?php echo $dataFolder;?>";
var csvDataFolder = "<?php echo $csvDataFolder;?>";
var normalizingDataFolder = "<?php echo $normalizingDataFolder;?>";
var defaultCountry = "<?php echo $defaultCountry;?>";
var defaultProduct = "<?php echo $defaultProduct;?>";
var defaultFlow = TL("<?php echo $defaultDestination;?>");
var defaultUnits = "<?php echo $defaultUnits;?>";
var defaultPeriod =  "<?php echo $defaultPeriod;?>";

context.view = "v14";

function main(selector)
{
    chart(selector);
}

</script>
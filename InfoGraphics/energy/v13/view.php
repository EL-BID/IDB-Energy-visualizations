<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/v13/style.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/lib/css/menu-product.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/lib/css/menu-sector.css" />
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/resources/css/idbmenus.css" />

<script type="text/javascript" src="<?php echo $rootdir;?>/energy/v13/view.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/energy/lib/energy.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/energy/lib/database.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/shortnames.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/arrayutil.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/productjson.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/lcgchart.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/twoletter.js"></script>
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
$defaultDestination = urlArg ("flow","Final Consumption");
$defaultPeriod = urlArg ("period", $defaultYear);
$defaultProduct = urlArg ("source", "Oil Products");
$defaultCountry = urlArg ("country", "Chile,Venezuela,Brazil,Colombia,Ecuador,Peru");
$defaultUnits = urlArg ("units", "kboe");

?>

<script>

var dataFolder = "<?php echo $dataFolder;?>";
var csvDataFolder = "<?php echo $csvDataFolder;?>";
var normalizingDataFolder = "<?php echo $normalizingDataFolder;?>";
var defaultCountries = "<?php echo $defaultCountry;?>".split(",");
var defaultProduct = "<?php echo $defaultProduct;?>";
var defaultFlow = TL("<?php echo $defaultDestination;?>");
var defaultUnits = "<?php echo $defaultUnits;?>";
 
context.view = "v13";

function main(selector)
{
    chart(selector);
}

</script>

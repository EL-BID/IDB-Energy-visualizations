
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/v12/style.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/lib/css/menu-product.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/lib/css/menu-sector.css" />
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/resources/css/idbmenus.css" />

<script type="text/javascript" src="<?php echo $rootdir;?>/energy/v12/view.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/energy/lib/energy.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/energy/lib/database.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/shortnames.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/arrayutil.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/productjson.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/lcgchart.js"></script>        
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/idbmenus.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/iconpath.js"></script>

<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/amgroups.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/threeletter.js"></script>

<?php

function urlArg($name,$default) {
    if (array_key_exists($name, $_GET)) return $_GET[$name];
    return $default;
}

$dataFolder = "$rootdir/energy/Resources/data";
$csvDataFolder = "$rootdir/energy/Resources/csvData";
$normalizingDataFolder = "$rootdir/energy/Resources/NormalizingData";
$defaultCountry = urlArg ("country","LAC");
$defaultPeriod = urlArg ("period", $defaultYear);
$defaultProduct = urlArg ("source", "Solar & Wind");
$defaultUnits = urlArg ("units", "gdp");

?>

<script>

var dataFolder = "<?php echo $dataFolder;?>";
var csvDataFolder = "<?php echo $csvDataFolder;?>";
var defaultCountry = "<?php echo $defaultCountry;?>";
var defaultProduct = "<?php echo $defaultProduct;?>";
var defaultPeriod = "<?php echo $defaultPeriod;?>";
var defaultUnits = "<?php echo $defaultUnits;?>";
var normalizingDataFolder = "<?php echo $normalizingDataFolder;?>";
context.view = "v12";

function main(selector)
{

    /* Load the file containing a list of all available countries and periods and load the menus */
    d3.json (dataFolder +  "/countryperiod.json", function (data) 
    {
        chart(selector,data);
    });
}

</script>


<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/Resources/css/idbsankey.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/Resources/css/idbmenus.css" />

<script type="text/javascript" src="<?php echo $rootdir;?>/energy/lib/energy.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/energy/v11/view.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/energy/lib/database.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/shortnames.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/arrayutil.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/flowjsonutil.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/lcgchart.js"></script>        
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/idbmenus.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/iconpath.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/flowpath.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/idbsankey.js"></script>


<?php

function urlArg($name,$default) {
    if (array_key_exists($name, $_GET)) return $_GET[$name];
    return $default;
}

$dataFolder = "$rootdir/energy/Resources/data";
$csvDataFolder = "$rootdir/energy/Resources/csvData";
$defaultCountry = urlArg ("country","LAC");
$defaultPeriod = urlArg ("period", $defaultYear);
$defaultProduct = urlArg ("source", "All Products");
$defaultUnits = urlArg ("units", "gdp");

?>

<script>
context.view = "v11";

var dataFolder = "<?php echo $dataFolder;?>";
var csvDataFolder = "<?php echo $csvDataFolder;?>";
var defaultCountry = "<?php echo $defaultCountry;?>";
var defaultProduct = "<?php echo $defaultProduct;?>";
var defaultPeriod = "<?php echo $defaultPeriod;?>";
    
function main(selector) {
        
    d3.json (dataFolder + "/countryperiod.json", function (data) {
        chart(selector,data);
    });

}

</script>



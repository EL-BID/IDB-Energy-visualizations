
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/energy/v17/style.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/resources/css/idbmenus.css" />
<script type="text/javascript" src="<?php echo $rootdir;?>/energy/v17/view.js"></script>     
<script type="text/javascript" src="<?php echo $rootdir;?>/energy/lib/energy.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/arrayutil.js"></script>        
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/shortnames.js"></script>        
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
$defaultPeriod = urlArg ("period", $defaultYear);
$defaultProduct = urlArg ("source", "Biocomb. & Waste");
$defaultCountry = urlArg ("country", "Nicaragua");
$defaultUnits = urlArg ("units", "percent");

?>


<script type="text/javascript">

context.view = "v17";

var dataFolder = "<?php echo $dataFolder;?>";
var csvDataFolder = "<?php echo $csvDataFolder;?>";
var iconFolder = "<?php echo $iconFolder;?>";

var defaultCountry = "<?php echo $defaultCountry;?>";
var defaultProduct = "<?php echo $defaultProduct;?>";
var defaultPeriod =  "<?php echo $defaultPeriod;?>";

function main(selector)
{

    d3.json (dataFolder + "/countryperiod.json", function (data) 
    {
        chart(selector,data);
    });
        
}
            
</script>

<?php

include "translation-$language" . ".php";

?>

<script type="text/javascript">
	
	var context = {};
	var P = '<?php echo $rootdir?>';
	var ENERGY_IMAGE_SOURCE_TEXT = TL("ENERGY_IMAGE_SOURCE_TEXT");
	var ENERGY_IMAGE_SOURCE_TEXT2 = TL("ENERGY_IMAGE_SOURCE_TEXT2");
	var ENERGY_IMAGE_SOURCE_URL  = "http://www.iadb.org/en/topics/energy/energy-database";
	var INSTITUTIONAL_IMAGE_SOURCE_TEXT = TL("INSTITUTIONAL_IMAGE_SOURCE_TEXT");
	var INSTITUTIONAL_IMAGE_SOURCE_URL  = "http://www.iadb.org/en/topics/energy/energy-database";

</script>



<link rel="stylesheet" href="<?php echo $rootdir;?>/resources/css/index.css" type="text/css" media="screen" />	
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/d3.v3.min.js" charset="utf-8"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/FileSaver.js" charset="utf-8"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/canvg.js" charset="utf-8"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/StackBlur.js" charset="utf-8"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/SaveImageNew.js" charset="utf-8"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/rgbcolor.js" charset="utf-8"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/localization.js" charset="utf-8"></script>

<?php



$icons = array(
	"menu" => "mini_f1_tb.jpg",
	"v11" => "mini_f1_tb.jpg",
	"v12" => "mini_f2_tb.png",
	"v13" => "mini_f3_tb.png",
	"v14" => "mini_f4_tb.jpg",
	"v15" => "mini_f5_tb.png",
	"v16" => "mini_f6_tb.png",
	"v17" => "mini_f7_tb.png",
	"v18" => "mini_f8_tb.png",

	"v21" => "mini_i1_tb.png",
	"v22" => "mini_i2_tb.png",
	"v24" => "mini_i4_tb.png",

	"v31" => "mini_t1_tb.png",
	"v41" => "mini_e1_tb.png",
	"v51" => "mini_b1_tb.png"
);


$pageImage = $icons["menu"];
$pageTitle = "Main Menu";
$viewName = $_GET["view"];

if (array_key_exists($viewName, $icons)) {
	$pageImage = $icons[$viewName];
	if (strpos ("v11,v12,v13,v14,v15,v16,v17,v18", $viewName) !== FALSE) {
		include "energy/index.php";
	}
	else if (strpos ("v21,v22,v24", $viewName) !== FALSE) {
		include "institutional/index.php";
	}
	else if ($viewName == "v31") {
		include "trade/index.php";
	}
	else if ($viewName == "v41") {
		include "expenditure/index.php";
	}
	else if ($viewName == "v51") {
		include "biofuels/index.php";
	}
	else if ($viewName == "menu") {
		include "mainmenu.php";
	}
	else echo "not found: " . $viewName;	
}
else {
	include "mainmenu.php";
}
?>
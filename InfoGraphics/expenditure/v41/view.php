
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/resources/css/idbmenus.css" />
<link rel="stylesheet" type="text/css" href="<?php echo $rootdir;?>/expenditure/v41/style.css">

<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/energy.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/lcgchart.js"></script>        
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/idbmenus.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/iconpath.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/amgroups.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/d3.tip.v0.6.3.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/d3-queue.v2.min.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/expenditure/v41/view.js"></script>


<?php

function urlArg($name,$default) {
    if (array_key_exists($name, $_GET)) return $_GET[$name];
    return $default;
}

$defaultPeriod = urlArg ("period", $defaultYear);
$defaultCountry = urlArg ("country", "Argentina");
$defaultProduct = urlArg ("source", "All Sources");
$defaultFlow = urlArg ("flow", "Exports");
$defaultScale = urlArg ("scale", "variable");

?>

<script>


  context.view = "v41";


  var defaultCountry = "<?php echo $defaultCountry;?>";
  var defaultProduct = "<?php echo $defaultProduct;?>";
  var defaultPeriod = "<?php echo $defaultPeriod;?>";;


  /* Folder for data */
  var DATA = "<?php echo $rootdir;?>"+"/expenditure/data";

  /* Dimensions of the drawing */
  var svgheight = 665; /* height of the svg */
  var width = 950; /* width of the svg canvas */
  var height = 600; /* Height of visualization canvas */
  var svgVerticalTranslation = (svgheight-height)*1;

  var theSVG, theVIS;
  var years =  d3.range(2014,2014+1);  /* All years we have data for */

  function main(selector)
  {

    /* Create the svg element */
    theSVG = d3.select(selector)
      .append("svg:svg")
      .attr("class","datavis")
      .attr("width", width)
      .attr("height", svgheight)
    ;


    theVIS = theSVG
      .append("svg:g")
      .attr("id","thechart")
      .attr ("transform", "translate(0,"+svgVerticalTranslation+")");    
    ;


    expenditureVisualization ();
  }


</script>


<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/resources/css/idbmenus.css" />
<link rel="stylesheet" type="text/css" href="<?php echo $rootdir;?>/biofuels/v51/style.css">

<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/energy.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/lcgchart.js"></script>        
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/idbmenus.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/iconpath.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/amgroups.js"></script>

<script type="text/javascript" src="<?php echo $rootdir;?>/biofuels/js/getset.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/biofuels/js/flowpath.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/biofuels/js/sankey.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/biofuels/v51/view.js"></script>

<?php

function urlArg($name,$default) {
    if (array_key_exists($name, $_GET)) return $_GET[$name];
    return $default;
}

$defaultPeriod = urlArg ("period", 2013);
$defaultCountry = urlArg ("country", "Argentina");
$defaultProduct = urlArg ("source", "All Sources");

?>

<script>

    context.view = "v51";

    var defaultCountry = "<?php echo $defaultCountry;?>";
    var defaultProduct = "<?php echo $defaultProduct;?>";
    var defaultPeriod = "<?php echo $defaultPeriod;?>";;


    /* Folder for data */
    var DATA = "<?php echo $rootdir;?>"+"/biofuels/data";

    var width = 950; /* width of the design */
    var svgheight = 660; /* height of the svg */
    var height = 480; /* height of the chart */

    var theSVG, theVIS;

    function main(selector) {
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
        .attr ("transform", "translate(0,"+((svgheight-height)/2)+")");    
        ;

        visualization ();

    }

</script>
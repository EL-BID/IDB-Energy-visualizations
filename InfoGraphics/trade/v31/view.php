

<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/trade/v31/tradeMap2.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/resources/css/idbmenus.css" />

<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/d3.geo.projection.v0.min.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/topojson.v1.min.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/circlepath.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/CountrySynonyms.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/trade/v31/view.js"></script>

<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/energy.js"></script>
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

$defaultPeriod = urlArg ("period", $defaultYear);
$defaultCountry = urlArg ("country", "Venezuela");
$defaultProduct = urlArg ("source", "Crude Oil");
$defaultFlow = urlArg ("flow", "Exports");
$defaultScale = urlArg ("scale", "variable");

?>

<script>

	context.view = "v31";

    var dataFolder = P + "/trade/data";
    var csvDataFolder = P + "/trade/data";
    var mapDataFolder = P + "/trade/mapdata";
    var defaultCountry = "<?php echo $defaultCountry;?>";
    var defaultProduct = "<?php echo $defaultProduct;?>";
    var defaultPeriod = "<?php echo $defaultPeriod;?>";
    var defaultFlow = "<?php echo $defaultFlow;?>";
    var defaultScale = "<?php echo $defaultScale;?>";
    
    /* Dimensions of the drawing */
    var svgheight = 620; /* height of the svg */
    var width = 950; /* width of the svg canvas */
    var height = 570; /* Height of visualization canvas */
    var margin = 25;

    var theSVG, theVIS;


    /* Layout for the country grid */
    var countryGrid = {
        rows : 2,
        cols : 5,
        marginLeft: 120, 
        marginRight : 20,
        marginTop: 130, 
        marginBottom : 35,
        colSep: 4,
        labelSep: 10,
        labelHeight: 90, 
    };

    /* Layout for the by product totals visualization */
    var productGrid = {
        marginLeft : 120,
        marginRight : 40,
        marginTop : 50,
        marginBottom : 35,
        totalsHeight : 20,
        totalsLineSep : 5,
        importExportSep : 10,
        prodLabelHeight : 25, 
        gap: 2,
    };

    /* Area ratio between the balls and the drawing */
    var areaRatio = 0.07;

    /* Minimum size of a ball */
    var minimumRadius = 5;

    /* Source product names used in the data */
    var prod = ["Crude, NGL and feedstocks",
              "Coal and coal products",
              "Combustible renewables and waste",
              "Electricity",
              "Oil Products",
              "Gas", 
              "Peat"];

    /* Equivalent names in the product menu */
    var menuProdNames = ["Crude Oil",
                       "Coal",
                       "Biocomb. & Waste",
                       "Electricity",
                       "Oil Products",
                       "Gas", 
                       "Peat"];

    /* Variant product names for legends */             
    var shortProd = function (p) {
        if (p == prod[0]) return "Crude Oil";
        if (p == prod[1]) return "Coal";
        if (p == prod[2]) return "CRW";
        return p;
    };

    /* All country names we have data for */
    var countries =  ["Argentina", "Dominican Republic", "Nicaragua",
                    "Bahamas", "Ecuador", "Panama", 
                    "Barbados", "El Salvador", "Paraguay", 
                    "Belize", "Guatemala", "Peru", 
                    "Bolivia", "Guyana", "Suriname",
                    "Brazil", "Haiti", "Trinidad & Tobago", 
                    "Chile", "Honduras", "Uruguay",
                    "Colombia", "Jamaica", "Venezuela",
                    "Costa Rica", "Mexico"];
    countries.sort();

    /* All years we have data for*/
    years = d3.range(1990,2014+1);

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
            .append("svg:g").attr("transform", "translate("+margin+",0)")
            .append("svg:g")
            .attr("id","thechart")
            .attr ("transform", "translate(0,"+((svgheight-height)*1)+")");    
            ;

        width -= margin*2;

        tradeMapVisualization();
    };

</script>


<!DOCTYPE html>
<html lang="en">
<head>
	<?php
	define('P','http://localhost/~claudio/bidvis/IDBVis');
	define('RESOURCES', "/Resources");  // root folder for subfolders  js, css, img 
	?>

    <meta charset="UTF-8">
    <title>Energy expenditure</title>

    <link type="text/css"rel="stylesheet" href="<?php echo P.RESOURCES;?>/css/idbmenus.css" />
    <link rel="stylesheet" type="text/css" href="style.css">

	<script type="text/javascript" src="<?php echo P.RESOURCES;?>/js/d3.v3.min.js"></script>
    <script type="text/javascript" src="<?php echo P.RESOURCES;?>/js/lcgchart.js"></script>        
    <script type="text/javascript" src="<?php echo P.RESOURCES;?>/js/idbmenus.js"></script>
    <script type="text/javascript" src="<?php echo P.RESOURCES;?>/js/iconpath.js"></script>
    <script type="text/javascript" src="<?php echo P.RESOURCES;?>/js/amgroups.js"></script>

<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
<script src="http://labratrevenge.com/d3-tip/javascripts/d3.tip.v0.6.3.js"></script> <!-- Encontrado em: http://bl.ocks.org/Caged/6476579 -->
<script src="https://d3js.org/d3-queue.v2.min.js"></script>
    <script src="view.js" charset="utf-8"></script>
</head>	
<body>
<div id="visualization"></div>
<script type="text/javascript">

  // Folder for data
  DATA = "../data";

  // Dimensions of the drawing
  var svgheight = 650; /* height of the svg */
  var width = 935; /* width of the svg canvas */
  var height = 600; /* Height of visualization canvas */
  var svgVerticalTranslation = (svgheight-height)*1;

  /* Create the svg element */
  var theSVG = d3.select("#visualization")
      .append("svg:svg")
      .attr("class","datavis")
      .attr("width", width)
      .attr("height", svgheight)
  ;

  var theVIS = theSVG
      .append("svg:g")
      .attr("id","thechart")
      .attr ("transform", "translate(0,"+svgVerticalTranslation+")");    
  ;

  var years =  d3.range(2014,2014+1)  // All years we have data for

  defaultCountry = "Argentina";
  defaultPeriod = "2014";

  expenditureVisualization ();
</script>
</body>
</html>	
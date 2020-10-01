
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/institutional/v21/institutional.css" /> 
<link type="text/css"rel="stylesheet" href="<?php echo $rootdir;?>/institutional/Resources/css/idbmenus.css" />

<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/lib/institutional.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/lib/database.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/lib/threeLetter.js"></script>

<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/Resources/js/shortnames.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/Resources/js/arrayutil.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/Resources/js/lcgchart.js"></script>        
<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/Resources/js/idbmenus.js"></script>
<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/Resources/js/iconpath.js"></script>

<script type="text/javascript" src="<?php echo $rootdir;?>/institutional/v21/ifw_view.js"></script>


<?php

function urlArg($name,$default) {
    if (array_key_exists($name, $_GET)) return $_GET[$name];
    return $default;
}

$dataFolder = "$rootdir/institutional/Resources/data";
$csvDataFolder = "$rootdir/institutional/Resources/csvData";

$defaultYear = urlArg ("year", $defaultYear);
$defaultCountry = urlArg ("source", "Mexico");
$defaultSector = urlArg ("sector", "Hydrocarbon");

?>


<script type="text/javascript">

var dataFolder = "<?php echo $dataFolder;?>";
var csvDataFolder = "<?php echo $csvDataFolder;?>";

var defaultCountry = "<?php echo $defaultCountry;?>";
var defaultYear =  "<?php echo $defaultYear;?>";
var defaultSector = "<?php echo $defaultSector;?>";

function main(selector)
{    

    d3.json (dataFolder + "/countryyear.json", function (data) 
    {
        chart(selector,data);
    });
        
}
        
function chart(selector, data)
{
    var svgWidth              = 930   ;
    var svgHeight             = 650   ;
    var height                = 500   ;
    
	    /* Create the svg element */
    var theSVG = d3.select(selector)
        .append("svg:svg")
        .attr("class","datavis")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
    ;

    var theVIS = theSVG
        .append("svg:g")
        .attr("id","ifchart")
        .attr ("transform", "translate(0,"+(svgHeight-height)/2+")");    
    ;
        
	var interfaces = idb.menuBar (theSVG, theVIS, [idb.countryInstitutional, idb.institutionalSector, idb.yearInstitutional]);
    var countryInterface = interfaces[0];
    var sectorInterface = interfaces[1];
    var yearInterface = interfaces[2];       
        
    function load()
    {
        var country = countryInterface.selectedData()[0];
        var sector = sectorInterface.selectedData();
        var year = yearInterface.selectedData() || defaultYear;
        ifw.reload(country, year, sector, theVIS);
    }

    countryInterface.onChange = function () {
        
        var country = countryInterface.selectedData()[0];
        var year = yearInterface.selectedData();
        var activeYears = [ ];
        var mostRecent = 0;
        for(var i in data)
        {
            if(data[i].country == country)
            {
                if(data[i].year > mostRecent)
                {
                    mostRecent = data[i].year;
                }
                activeYears.push(data[i].year);
            }
        }
        yearInterface.active(activeYears);
        yearInterface.select(mostRecent);
        load ();
    };

    var activeCountries = [ ];
    for(var i in data)
    {
        activeCountries.push(data[i].country);
    }
    countryInterface.active(activeCountries);        
    countryInterface.select([defaultCountry]);
        
    sectorInterface.select(defaultSector);
    sectorInterface.onChange = load;
        
    yearInterface.select(defaultYear);
    yearInterface.onChange = load;    

    load();
}

</script>


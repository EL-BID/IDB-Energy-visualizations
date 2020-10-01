<?php

$PageTitle = "IDB - DataVis Home";
$ViewTitle  = TL("Index");

include "viewnames.php";

?>

<link rel="stylesheet" href="<?php echo $rootdir;?>/resources/css/index.css" type="text/css" media="screen" />

<script type="text/javascript" src="<?php echo $rootdir;?>/resources/js/d3.v3.min.js"></script>
<script type="text/javascript">

	function createMenus()
	{
	}

	function init()
	{
	}
				 
</script>

<style type="text/css">

@font-face {
	font-family: 'GothamMedium';
	font-style: normal;
	font-weight: normal;
	src: local('GothamNarrow-Medium'), url('<?php echo $rootdir;?>/resources/css/GothamNarrow-Medium.woff') format('woff');
}

@font-face {
	font-family: 'GothamBold';
	font-style: normal;
	font-weight: normal;
	src: local('Gotham-Bold'), url('<?php echo $rootdir;?>/resources/css/Gotham-Bold.woff') format('woff');
}

.indexPanel {
 	font-family: 'GothamMedium',Verdana,Arial;
	width:950px;
	background-color: #f0f0f0;
    margin: auto;
}

.indexCategory {
	width:450;
}

.indexCategoryTitle {
	font-family: 'GothamBold',Verdana,Arial;
	font-size: 14px;
	width: 426px;
	background-color: #0079a5; /*#878787;*/
	color: white;
	padding: 12px 12px 4px 12px;
	text-transform: uppercase;
}

.indexVisualization {
	text-decoration: none;
	font-family: 'GothamMedium',Verdana,Arial;
	height:145px;
	float:left;
	background-size: 600px;
	font-size: 12px;
	color:#0079a5; /*#26518B;*/
	text-transform: uppercase;
	padding: 3px;
}

.twoSlots {
	width: 434px;
}

.oneSlot {
	width: 211px;
}

.indexPanel * {
	border-collapse: separate;
	box-sizing: content-box;
}


table.indexCategory {
	width: 450px;
	border-collapse: separate;
	box-sizing: content-box;
	border-spacing: 2px;

	background-color:#0079a5; /* #D9D9D9;*/
	border:1px solid #0079a5; /* #D9D9D9;*/
}

table.indexCategory tr {
	border-collapse: separate;
	box-sizing: content-box;
}

table.indexCategory td {
	border-collapse: separate;
	box-sizing: content-box;
	border:1px solid #0079a5; /* #D9D9D9;*/
	padding:1px;
}

</style>

<div class="indexPanel">
    <table style="margin:0px auto; padding-top:10px; padding-bottom:10px;">
        <tr>
            <td rowspan="4" class="indexCategory" style="padding: 1px 16px 1px 1px">
                <div class="indexCategory">
                    <div class="indexCategoryTitle"><?php echo TL("Energy Flow"); ?>
                    </div>
                </div>
                <table class="indexCategory">
                    <tr>
                        <td colspan="2">
                            <a href="?view=v11" class="indexVisualization twoSlots" style="background-image:url(<?php echo $rootdir;?>/img/thumbnail/bkg_v11.png)">
						<?php echo $viewNames["v11"]; ?>
					</a>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <a href="?view=v12" class="indexVisualization oneSlot" style="background-image:url(<?php echo $rootdir;?>/img/thumbnail/bkg_v12.png);background-size: 300px;">
					    <?php echo $viewNames["v12"]; ?>
					</a>
                        </td>
                        <td>
                            <a href="?view=v14" class="indexVisualization oneSlot" style="background-image:url(<?php echo $rootdir;?>/img/thumbnail/bkg_v14.png);background-size: 300px;">
					    <?php echo $viewNames["v14"]; ?>
					</a>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <a href="?view=v13" class="indexVisualization twoSlots" style="background-image:url(<?php echo $rootdir;?>/img/thumbnail/bkg_v13.png);height:116px;">
					    <?php echo $viewNames["v13"]; ?>
					</a>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <a href="?view=v16" class="indexVisualization oneSlot" style="background-image:url(<?php echo $rootdir;?>/img/thumbnail/bkg_v16.png);background-size: 300px;">
					    <?php echo $viewNames["v16"]; ?>
					</a>
                        </td>
                        <td>
                            <a href="?view=v17" class="indexVisualization oneSlot" style="background-image:url(<?php echo $rootdir;?>/img/thumbnail/bkg_v17.png);border-left:0px;background-size: 300px;">
					    <?php echo $viewNames["v17"]; ?>
					</a>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <a href="?view=v51" class="indexVisualization twoSlots" style="background-image:url(<?php echo $rootdir;?>/img/thumbnail/bkg_v51.png);background-size: 400x;">
						<?php echo $viewNames["v51"]; ?>
					</a>
                        </td>
                    </tr>
                </table>
            </td>
            <td rowspan="1" valign="top">
                <div class="indexCategory">
                    <div class="indexCategoryTitle"><?php echo TL("Electricity");?>
                    </div>
                </div>
                <table class="indexCategory">
                    <tr>
                        <td>
                            <a href="?view=v15" class="indexVisualization oneSlot" style="background-image:url(<?php echo $rootdir;?>/img/thumbnail/bkg_v15.png);background-size: 280px;">
					    <?php echo $viewNames["v15"]; ?>
					</a>
                        </td>
                        <td>
                            <a href="?view=v18" class="indexVisualization oneSlot" style="background-image:url(<?php echo $rootdir;?>/img/thumbnail/bkg_v18.png);border-left:0px;background-size: 300px;">
					    <?php echo $viewNames["v18"]; ?>
					</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td></td>
        </tr>
        <tr>
            <td rowspan="1" valign="middle">
                <div class="indexCategory">
                    <div class="indexCategoryTitle"><?php echo TL("Energy Economics");?>
                    </div>
                </div>
                <table class="indexCategory">
                    <tr>
                        <td>
                            <a href="?view=v31" class="indexVisualization oneSlot" style="background-image:url(<?php echo $rootdir;?>/img/thumbnail/bkg_v31.png);background-size: 300px;">
					    <?php echo $viewNames["v31"]; ?>
					</a>
                        </td>
                        <td>
                            <a href="?view=v41" class="indexVisualization oneSlot" style="background-image:url(<?php echo $rootdir;?>/img/thumbnail/bkg_v41.png);border-left:0px;background-size: 300px;">
					    <?php echo $viewNames["v41"]; ?>
					</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td rowspan="1" valign="bottom">
                <div class="indexCategory">
                    <div class="indexCategoryTitle"><?php echo TL("Institutional Framework");?>
                    </div>
                </div>
                <table class="indexCategory">
                    <tr>
                        <td colspan="2">
                            <a href="?view=v21" class="indexVisualization twoSlots" style="background-image:url(<?php echo $rootdir;?>/img/thumbnail/bkg_v21.png);background-size: 600px;">
					    <?php echo $viewNames["v21"]; ?>
					</a>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <a href="?view=v22" class="indexVisualization oneSlot" style="background-image:url(<?php echo $rootdir;?>/img/thumbnail/bkg_v22.png);background-size: 220px;">
					    <?php echo $viewNames["v22"]; ?>
					</a>
                        </td>
                        <td>
                            <a href="?view=v24" class="indexVisualization oneSlot" style="background-image:url(<?php echo $rootdir;?>/img/thumbnail/bkg_v24.png);border-left:0px;background-size: 250px;">
					    <?php echo $viewNames["v24"]; ?>
					</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>  
 

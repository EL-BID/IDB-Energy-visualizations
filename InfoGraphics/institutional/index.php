<?php

include "$rootdir/viewnames.php";

$viewTitle = $viewNames[$viewName];

?>

<style type="text/css">

	body {
		font-family: Arial, Helvetica, sans-serif;
	}

	.block{
		max-width:950px;
		border: 0px;
		background-color: white;
	}

	.block td {
		border: 0px;
		padding: 0px;
	}

	.block tr {
		border: 0px;
		padding: 0px;
	}

	a, a:visited {
		color:#808184;
		font-style: normal;
		text-decoration: none;
	}

	#title { color: #333; text-decoration: underline; }

	a:hover {
		color: #39F;
	}

	#content {
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: moz-none;
		-ms-user-select: none;
		user-select: none;
	}
	.breadcrumbs {
		float:right;
		}
		
	.text a {
		color:#0071BC;
	}
</style>

<?php

$defaultYear = 2013;
include "$rootdir/institutional/$viewName/view.php"

?>

<script type="text/javascript">

	setLocalization ("<?php echo $language;?>");

	function createMenus()
	{
		function menuItemClick()
		{
			var thisSelection = d3.select(this);
			var thisIsActive = thisSelection.classed("active");
			d3.selectAll("li.popup").classed("active",false);
			if(!thisIsActive)
			{
				thisSelection.classed("active", true);
			}
		}

		var liPopup = d3.selectAll(".menu li.popup")
			.on("click", menuItemClick)
		;
	}

	function init()
	{
		var viewName = "<?php echo $viewName;?>";
		d3.select("img." + viewName).attr("src","<?php echo $rootdir;?>/resources/img/buttons/nav_cur.png");
		createMenus();
		if(main)
		{
			main("#visualization");
		}
		d3.select("." + viewName).classed("selected",true);
		context.rdfDataFolder = "<?php echo $rootdir;?>/institutional/Resources/rdfData/";        	
		context.rdfFileList = [ "institutional.ttl" ];
	}

</script>


<div class="navbar">

	<div class="innernavbar" style="height:48px;overflow:hidden;">

		<div class="title">
			<?php echo $ViewTitle;?>
		</div>

		<ul class="menu" style="margin:10px 0px;">

			<li class="index menuitem" onclick="location.href='?view=menu'">
				<span><?php echo TL("Index");?></span>
			</li>

			<li class="menuitem energy popup">
				<span><?php echo TL("Energy Flow");?></span>
				<ul class="submenu">
					<li class="v11 first" onclick="location.href='?view=v11'"><?php echo $viewNames["v11"];?></li>
					<li class="v12" onclick="location.href='?view=v12'"><?php echo $viewNames["v12"];?></li>
					<li class="v13" onclick="location.href='?view=v13'"><?php echo $viewNames["v13"];?></li>
					<li class="v14" onclick="location.href='?view=v14'"><?php echo $viewNames["v14"];?></li>
					<li class="v16" onclick="location.href='?view=v16'"><?php echo $viewNames["v16"];?></li>
					<li class="v17" onclick="location.href='?view=v17'"><?php echo $viewNames["v17"];?></li>
					<li class="v51 last" onclick="location.href='?view=v51'"><?php echo $viewNames["v51"];?></li>
				</ul>
			</li>

			<li class="menuitem electricity popup">
				<span><?php echo TL("Electricity");?></span>
				<ul class="submenu">
					<li class="v15" onclick="location.href='?view=v15'"><?php echo $viewNames["v15"];?></li>
					<li class="v18 last" onclick="location.href='?view=v18'"><?php echo $viewNames["v18"];?></li>
				</ul>
			</li>

			<li class="menuitem economics popup">
				<span><?php echo TL("Energy Economics");?></span>
				<ul class="submenu">
					<li class="v31" onclick="location.href='?view=v31'"><?php echo $viewNames["v31"];?></li>
					<li class="v41 last" onclick="location.href='?view=v41'"><?php echo $viewNames["v41"];?></li>
				</ul>
			</li>

			<li class="institutional menuitem popup">
				<span><?php echo TL("Institutional");?></span>
				<ul class="submenu">
					<li class="v21 first" onclick="location.href='?view=v21'"><?php echo $viewNames["v21"];?></li>
					<li class="v22" onclick="location.href='?view=v22'"><?php echo $viewNames["v22"];?></li>
					<li class="v24 last" onclick="location.href='?view=v24'"><?php echo $viewNames["v24"];?></li>
				</ul>
			</li>

		</ul>

		<div id="HowToUseButton" class="button">
			<a class="eicPopup" href="#howTo#">
				<img align="absmiddle" src="<?php echo $rootdir;?>/img/help.png">
				<span><?php echo TL("How to Use");?></span>		
			</a>
		</div>

		<div style="clear:both;"></div>

	</div>

</div>


<div class="block" bgcolor="rgb(255,255,255)">

	<div id="visualization" style="min-height:370px;">
	</div>


	<div class="button" style="float:left;cursor:pointer;padding-left:10px;" onclick="saveImage()">
		<img align="absmiddle" src="<?php echo $rootdir;?>/img/download.png">
		<span><?php echo TL("Download Image");?></span>
	</div>

	<div class="button" style="float:left;cursor:pointer;padding-left:10px;" onclick="saveImageSvg()">
		<img align="absmiddle" src="<?php echo $rootdir;?>/img/download.png">
		<span><?php echo TL("Download Svg");?></span>
	</div>
</div>

<script>

	function showDownloadFileType()
	{
		var sel = d3.select("#downloadFileType");
		var display = sel.style("display");
		if(display == "none")
		{
			sel.style("display","block");
		}
		else
		{
			sel.style("display","none");
		}
	}

	function downloadData(fileList,dataFolder)
	{

		var IEAPage = "#forbiddenFileURL#";

		var form = d3.select("body")
		.append("form")
		.attr("method","post")
		.attr("action",DATA_DOWNLOADER)
		;

		form.append("input")
		.attr("type","hidden")
		.attr("name","fileList")
		.attr("value",fileList.join(","))
		;

		form.append("input")
		.attr("type","hidden")
		.attr("name","rootDir")
		.attr("value",dataFolder)
		;

		form.append("input")
		.attr("type","hidden")
		.attr("name","downloadName")
		.attr("value", context.fileName)
		;

		form.append("input")
		.attr("type","hidden")
		.attr("name","IEAPage")
		.attr("value",IEAPage)
		;

		form[0][0].submit();

		form.remove();
	}

	function downloadJsonData()
	{
		d3.select("#downloadFileType").style("display","none");
		if(context.fileList)
		{
			downloadData(context.fileList,context.dataFolder);
		}
	}

	function downloadCsvData()
	{
		d3.select("#downloadFileType").style("display","none");
		if(context.csvFileList)
		{
			downloadData(context.csvFileList,context.csvDataFolder);
		}
	}

	function downloadRdfData()
	{
		d3.select("#downloadFileType").style("display","none");
		if(context.rdfFileList)
		{
			downloadData(context.rdfFileList,context.rdfDataFolder);
		}
	}

	init();

</script>


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>IDB Info Charts</title>
	<script type="text/javascript" src="jquery.min.js"></script>
</head>
<body>

<?php
$rootdir = "../InfoGraphics";
?>

<div style="margin:auto;background-color:#E5E5E5;position:fixed;min-height:53px;width:100%;z-index:998;">
</div>

<div align="center" style="margin:auto;background-color:#E5E5E5;position:fixed;
left:50%;margin-left:-640px;z-index:999;">

	<div id="EIC" align="center" style="margin:auto;">
		<?php echo "<img  src='$rootdir/img/IDBHeader.png' alt='IDB Logo'>" ?>
	</div>
	
</div>

<div style="background-color:#C4C4C4;">
		<div style="margin:auto;background-color:#E5E5E5;min-height:53px;width:100%;">
		</div>

	<div align="center" style="margin:auto;min-width:1280px;width:1280px;background-color:#F7F7F7">
		<?php echo "<img src='$rootdir/img/EnergyDatabaseHeader.png' alt='Energy Database'>" ?>
	
		<div id="content" align="center" style="width:950px; margin:auto;">

		<?php
			$language = "en";
			include "$rootdir/main.php";
		?>

		</div>
	</div>	
	<div align="center" width="1280">
		
		<?php echo "<img  align=center width=1280 src='$rootdir/img/IDB_bottom_bar.jpg' style='margin:auto;'>" ?>
		
	</div>
	</div>

</body>
</html>





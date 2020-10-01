
<?php
$viewNames = array(
	"v11" => TL("Energy Matrix"),
	"v12" => TL("Primary Energy Production Comparison"),
	"v13" => TL("Energy Comparison"),
	"v14" => TL("Energy Sources and Flows over Time"),
	"v15" => TL("Electricity Generation and Losses by Source"),
	"v16" => TL("Final Consumption by Sector over Time"),
	"v17" => TL("Final Consumption by Sector and Source"),
	"v18" => TL("Electricity Matrix"),
	"v21" => TL("Institutional Overview"),
	"v22" => TL("Timeline"),
	"v24" => TL("Private Participation in the Market"),

	"v31" => TL("Energy Trade"),

	"v41" => TL("Expenditure by Income"),

	"v51" => TL("Biofuels")
);

echo "<script> var viewNames = {";

foreach ($viewNames as $term => $trans) {
	echo "'$term' : '$trans',\n";
}

echo "}; </script>\n";

?>
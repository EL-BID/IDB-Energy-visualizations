 shortname = {};
shortname["Central America"] = "C_America";
shortname["North America"] = "N_America";
shortname["Southern Cone"] = "S_Cone";
shortname["United Kingdom"] = "UK";
shortname["Costa Rica"]="Costa_Rica";
shortname["Dominican Republic"]="D_Republic";
shortname["El Salvador"]="El_Salvador";
shortname["French Guiana"]="F_Guiana";
shortname["Puerto Rico"]="Puerto_Rico";
shortname["Trinidad and Tobago"]="T_and_Tobago";
shortname["Trinidad & Tobago"]="T_and_Tobago";
shortname["United States"]="USA";
function oneWord (a) {
	for (var i in a) {
		shortname[a[i]] = a[i];
	}
}
oneWord (["Argentina",
  "Andean",
  "Austria",
  "Bahamas",
  "Barbados",
  "Belgium",
  "Belize",
  "Bolivia",
  "Brazil",
  "Canada",
  "Caribbean",
  "Chile",
  "China",
  "Colombia",
  "Croatia",
  "Cuba",
  "Denmark",
  "Ecuador",
  "Europe",
  "Finland",
  "France",
  "Germany",
  "Guatemala",
  "Guyana",
  "Haiti",
  "Honduras",
  "India",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Korea",
  "LAC",
  "Mexico",
  "Netherlands",
  "Nicaragua",
  "Norway",
  "Panama",
  "Paraguay",
  "Peru",
  "Portugal",
  "Slovenia",
  "Spain",
  "Suriname",
  "Sweden",
  "Switzerland",
  "USA",
  "Uruguay",
  "Venezuela",
  "World"]);
shortname["1971-1974"]="1971_1974";
shortname["1984-1987"]="1984_1987";
shortname["1999-2002"]="1999_2002";
shortname["2005-2008"]="2005_2008";
for (var i = 1971; i < 2030; i++) shortname[""+i] = ""+i;
shortname["Coal and coal products"]="Coal";
shortname["Coal"]="Coal";
shortname["Peat"]="Peat";
shortname["Crude, NGL and feedstocks"]="Crude";
shortname["Crude Oil"]="Crude";
shortname["Comb. Renew."] = "CRW";
shortname["Natural Gas"]="Gas";
shortname["Gas"]="Gas";
shortname["Nuclear"]="Nuclear";
shortname["Hydro"]="Hydro";
shortname["Geothermal"]="Geothermal";
shortname["Solar/Wind/Other"]="Solar";
shortname["Solar & Wind"]="Solar";
shortname["Solar Wind"]="Solar";
shortname["Solar"]="Solar";
shortname["Biocombustibles"] = "CRW";
shortname["Biocomb. & waste"] = "CRW";
shortname["Biocomb. & Waste"] = "CRW";
shortname["Biocomb."] = "CRW";
shortname["Combustible renewables and waste"]="CRW";
shortname["Biocombustibles and waste"]="CRW";
shortname["Oil"]="Oil_Products";
shortname["Oil Products"]="Oil_Products";
shortname["Electricity"]="Electricity";
shortname["Heat"]="Heat";
shortname["All Products"]="All_Products";
shortname["All products"]="All_Products";
shortname["All primary"]="All_Primary";
shortname["All Primary"]="All_Primary";
shortname["Primary Total"]="All_Primary";
shortname["Production"]="Production";
shortname["Imports"]="Imports";
shortname["Exports"]="Exports";
shortname["Oil Products"]="Oil_Products";
shortname["Electricity"]="Electricity";
shortname["Heat and Waste"]="H_Waste";
shortname["Industry"]="Industry";
shortname["Transport"]="Transport";
shortname["Residential"]="Residential";
shortname["Commercial"]="Commercial";
shortname["Other"]="Other";
shortname["Final Consumption"]="Consumption";
shortname["Total Consumption"]="Consumption";
shortname["Consumption"]="Consumption";
shortname["Supply"]="Supply";
shortname["Transformation"]="Transformation";
shortname["Electricity output in GWh"]="Electricity_Output";
shortname["Hydrocarbon Heat and Waste"]="Hydrocarbon_HW";
shortname["Electricity Heat and Waste"]="Electricity_HW";

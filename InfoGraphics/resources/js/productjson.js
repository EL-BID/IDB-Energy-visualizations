// 
// Given the json for a country/period and a product name,
// returns an object with the amount produced, imported, 
// exported, consumed and transformed
function productInfo (data, product) {
	//var pdata = getFiltered(data, 'product', product);
	var pdata = data;
	var ret = {
		produced: 
			getSum (getFiltered(pdata,'flow','Production'), 'value'),
		imports: 
			getSum (getFiltered(pdata,'flow','Imports'), 'value'),
		exports:
			getSum (getFiltered(pdata,'flow','Exports'), 'value'),
		consumed:
			getSum (getFiltered(pdata,'flow','Total Consumption'), 'value'),
		transformed: 
			getSum (getFiltered(pdata,'flow','Oil Products'), 'value') +
			getSum (getFiltered(pdata,'flow','Electricity'), 'value')	
	};
	return ret;
}



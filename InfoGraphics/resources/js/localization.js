/*
 *
 * This source contains functions that depend on the localization - Usually en or es (English or Spanish)
 *
 */

function setLocalization (lang) {
	var numberFormat =  d3.format;

	if (lang == "es") {
		var spanish_locale = {
		  "decimal": ",",
		  "thousands": ".",
		  "grouping": [3],
		  "currency": ["$", ""],
		  "dateTime": "%a %b %e %X %Y",
		  "date": "%m/%d/%Y",
		  "time": "%H:%M:%S",
		  "periods": ["AM", "PM"],
		  "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
		  "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		  "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		  "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
		};
		numberFormat = d3.locale(spanish_locale).numberFormat;		
	}
	var wholeNumberFormat = numberFormat (",.0f");
	var fracNumberFormat = numberFormat (",.1f");
	var fracNumberFormat2 = numberFormat (",.2f");


	Number.prototype.numberFormat = numberFormat;
	Number.prototype.energyFormat = function (fmt) { 
		if (fmt == undefined) return Math.abs(this)>=1 ? wholeNumberFormat (this) : 
									(Math.abs(this*10) >= 1 ? fracNumberFormat(this) : fracNumberFormat2(this));
		return numberFormat(fmt) (this);
	} ;
};



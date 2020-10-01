var templates = { };

templates.requestCount = 0;
templates.responseCount = 0;

// include JS script 
templates.includeScript = function(jsURL, callback)
{
	if(callback)
	{
		templates.callback = callback;
	}

	templates.requestCount++;
		
	function scriptError()
	{
		console.log("error in load script " + jsURL + "!");
	}

	d3.select("head")
		.append("script")
		.attr("type", "text/javascript")
		.attr("charset","utf-8")
		.attr("async",true)
		.on("error",scriptError)
		.attr("src",jsURL)
	;
}

// include style
templates.includeCSS = function(cssURL)
{
	d3.select("head")
		.append("link")
		.attr("rel", "stylesheet")
		.attr("type", "text/css")
		.attr("href",cssURL)
	;
}

templates.notifyLoaded = function(jsURL)
{
	templates.responseCount++;
	if(templates.requestCount == templates.responseCount)
	{
		templates.requestCount = 0;
		templates.responseCount = 0;
		if(templates.callback)
		{
			templates.callback();
		}
	}
}

templates.resourceWait = function()
{
	var count = 0;
	var callback = null;

	function callbackForResources()
	{
		count--;
		if(callback && count == 0)
		{
			callback();
		}
	}

	var result = function()
	{
		count++;
		return callbackForResources;
	}

	result.onReady = function(c)
	{
		callback = c;
		if(count == 0)
		{
			callback();
		}
	}

	return result;
}

templates.loadHtmlFragment = function(selection, url)
{
	var sel = d3.select(selection);
	if(sel.empty())
	{
		throw "selection " + selection + " not found in document";
	}
	else
	{
		function f(error, documentFragment)
		{
			if(error)
			{
				throw "error loading url " + url + ": " + error;
			}
			else
			{
				sel.html(documentFragment);
			}
		}
		sel.text("");
		d3.text(url, f);
	}
}

templates.loadImage = function(selection, url)
{
	var sel = d3.select(selection);
	if(sel.empty())
	{
		throw "selection " + selection + " not found in document";
	}
	else
	{
		sel.text("").append("img").attr("src",url);
	}
}




var decadeWidth = 120;
var decadeHeight = 30;
var decadeTextDx = 5;
var decadeTextDy = 12;
var yearTickHeight = 10;    
var selectedYear = null;
var selectedPage = null;
var firstTime = true;
var legendOffset = [700,-60]; /* Position (x,y) of the legend box w.r.t. the visualization */
var svgWidth = 930;
var svgHeight = 450;

function justifyText(t,width)
{
    var NS = { SVG: "http://www.w3.org/2000/svg", HTML: "http://www.w3.org/1999/xhtm" };

    function removeEmptyElements(a)
    {
        var resp = [];
        for(var i in a)
        {
            if(a[i]!=="")
            {
                resp.push(a[i]);
            }
        }
        return resp;
    }

    var words = removeEmptyElements(t.textContent.split(/\s/));
    t.textContent = "";
    var ts = null;
    var currentLine = "";
    var lineWidth = 0;
    var lineCount = 0;
    var numberOfWords = 0;
    var lineSpacing = 1.2;
    var margin = 10;
    var maxWidth = width-2*margin;

    for(var i in words)
    {
        if(i == 0)
        {
            ts = document.createElementNS(NS.SVG,"tspan");
            lineCount++;
            t.appendChild(ts);
            ts.textContent = words[i];
            var rect = ts.getBoundingClientRect();
            if(rect.height)
            {
                lineSpacing *= rect.height;
            }
            else
            {
                lineSpacing *= 13.5;
            }
            ts.setAttribute("y",0);                  
            ts.setAttribute("x",margin);
            numberOfWords = 1;
            currentLine = words[i];
            ts.textContent = currentLine;
        }
        else
        {
            ts.textContent = currentLine + " " + words[i];
            var width = ts.getComputedTextLength();
            if(width > maxWidth)
            {
                ts.textContent = currentLine;
                width = ts.getComputedTextLength()
                var ws = (maxWidth-width)/(numberOfWords-1);
                ts.setAttribute("style","word-spacing: " + ws + "px;");
                ts = document.createElementNS(NS.SVG,"tspan");
                ts.setAttribute("y",lineSpacing*lineCount);
                ts.setAttribute("x",margin);                        
                lineCount++;
                t.appendChild(ts);
                currentLine = words[i];
                ts.textContent = currentLine;
                numberOfWords = 1;
            }
            else
            {
                currentLine += " " + words[i];
                numberOfWords++;
            }
        }
    }
}

function decadeDraw()
{
    var g = this.append("g")
        .attr("transform",function(d,i){return "translate("+(i*decadeWidth)+",0)"})
        .attr("class","decade")
    ;

    g.append("rect")
        .attr("x",0)
        .attr("y",0)
        .attr("width",decadeWidth)
        .attr("height",decadeHeight)
    ;

    g.append("text")
        .attr("x",decadeTextDx)
        .attr("y",decadeTextDy)
        .text(function(d){return d})
    ;

    var years = [0,1,2,3,4,5,6,7,8,9];

    g.selectAll("line")
        .data(years)
        .enter()
        .append("line")
        .attr("class",function(d){return d==0?"firstYear":null})
        .attr("x1",function(d){return d*(decadeWidth/10)})
        .attr("y1",decadeHeight)
        .attr("x2",function(d){return d*(decadeWidth/10)})
        .attr("y2",function(d){return d==0?0:decadeHeight-yearTickHeight})
    ;
}

function eventsDraw(_,firstDecade)
{   
    function translate(d)
    {
        var tx = ((~~d.key)-(firstDecade*10))*decadeWidth/10;
        var ty = decadeHeight+3;
        return "translate("+tx+","+ty+")";
    }

    var g = this.append("g")
        .attr("transform",translate)
    ;

    function rectClass(d)
    {
        if(d.hydrocarbon && d.power)
        {
            return "both";
        }
        if(d.hydrocarbon)
        {
            return "hydrocarbon";
        }
        if(d.power)
        {
            return "power";
        }
    }

    function dataUpTo5(d)
    {
        if(d.values.length <= 5)
        {
            return d.values;
        }
        else
        {
            return [];
        }
    }

    g.selectAll(".up5")
        .data(dataUpTo5)
        .enter()
        .append("rect")
        .attr("class",rectClass)
        .attr("x",-3)
        .attr("y",function(d,i){return i*(6+2)})
        .attr("width",6)
        .attr("height",6)
    ;

    function dataMoreThan5(d)
    {
        var hc = 0;
        var pw = 0;
        var both = 0;
        var year = 0;
        if(d.values.length > 5)
        {
            for(var i in d.values)
            {
                var e = d.values[i];
                year = e.year;
                if(e.hydrocarbon && e.power)
                {
                    both++;
                }
                if(e.hydrocarbon)
                {
                    hc++;
                }
                if(e.power)
                {
                    pw++;
                }
            }
            var resp = [];
            var y = 0;
            if(hc>0)
            {
                var h = (40*hc)/(hc+both+pw);
                resp.push({cl:"hydrocarbon",y:y,h:h,year:year});
                y+=h;
            }
            if(pw>0)
            {
                var h = (40*pw)/(hc+both+pw);
                resp.push({cl:"power",y:y,h:h,year:year});
                y+=h;
            }
            if(both>0)
            {
                var h = (40*both)/(hc+both+pw);
                resp.push({cl:"both",y:y,h:h,year:year});   
            }
            return resp;
        }
        else
        {
            return [];
        }
    }

    g.selectAll(".gt5")
        .data(dataMoreThan5)
        .enter()
        .append("rect")
        .attr("class",function(d){return d.cl})
        .attr("x",-3)
        .attr("y",function(d){return d.y})
        .attr("width",6)
        .attr("height",function(d){return d.h})
    ; 
}

function lawTextDraw(selectedYear, page, data, parent, callbackPageChange)
{
    var d = null;
    for(var i in data)
    {
        if(~~data[i].key == selectedYear)
        {
            d = data[i].values;
            break;
        }
    }
    if(d)
    {
        var numberOfPages = Math.ceil(d.length/9);
        if(numberOfPages > 1)
        {
            var pages = [];
            for(var i=0; i<numberOfPages; i++)
            {
                pages.push(i);
            }

            var pagesGroup = parent.append("g");

            function pagerClass(d)
            {
                if(d == selectedPage)
                {
                    return "selected";
                }
                else
                {
                    return "notSelected";
                }
            }

            function pagerClick(d)
            {
                callbackPageChange(d);
            }

            var pagesItens = pagesGroup.selectAll("*")
                .data(pages)
                .enter()
                .append("g")
                .attr("class",pagerClass)
                .on("click",pagerClick)
            ;

            pagesItens.append("circle")
                .attr("cx",function(d,i){return i*25})
                .attr("cy",0)
                .attr("r",10)
            ;

            pagesItens.append("text")
                .attr("class",pagerClass)
                .attr("x",function(d,i){return i*25})
                .attr("text-anchor","middle")
                .attr("alignment-baseline","central")
                .text(function(d){return d+1})
            ;

            var newData = [];
            for(var i=page*9; i<((1+page)*9)&&i<d.length; i++)
            {
                newData.push(d[i]);
            }
            d = newData;
        }

        function itemClass(d)
        {
            if(d.hydrocarbon && d.power)
            {
                return "item both";
            }
            if(d.hydrocarbon)
            {
                return "item hydrocarbon";
            }
            if(d.power)
            {
                return "item power";
            }
        }

        var colWidth = d.length > 6 ? 276 : 400;
        var colHeight = 100;

        function itemTranslate(d,i)
        {
            var dx = (~~(i/3))*colWidth;
            var dy = (i%3)*colHeight;
            return "translate("+dx+","+dy+")";
        }

        var itens = parent.selectAll(".item")
            .data(d)
            .enter()
            .append("g")
            .attr("class",itemClass)
            .attr("transform",itemTranslate)
        ;

        var heights = [];                    

        function justifyAndCalculateHeights()
        {
            justifyText(this,colWidth-20);
            heights.push(this.getBBox().height);
        }

        var descriptions = itens.append("text")
            .text(function(d){return d.description})
            .each(justifyAndCalculateHeights);
        ;

        var instruments = itens
            .append("text")
            .attr("class","instrument")
            .text(function(d){return d.instrument})
            .attr("transform",function(d,i){return "translate(10,"+(4+heights[i])+")"})
            .each(function(){justifyText(this,colWidth-30)});
        ;

        var instrumentsIndicator = itens.append("path")
            .attr("transform",function(d,i){return "translate(10,"+(heights[i])+")"})
            .attr("d","M0 -5L0 5 7 0Z")
        ;

        instruments
            .filter(function(d){return d.instrument == ""})
            .remove()
        ;

        instrumentsIndicator
            .filter(function(d){return d.instrument == ""})
            .remove()
        ;

        function openDocument(d)
        {
            var win=window.open(d.url, '_blank');
            win.focus();            
        }
        
        instruments
            .filter(function(d){return d.url != ""})
            .style("text-decoration","underline")
            .style("cursor","pointer")
            .on("click",openDocument)
        ;

        heights = [];

        itens.each(function(){heights.push(this.getBBox().height)});

        itens.append("line")
            .attr("x1",0)
            .attr("x2",0)
            .attr("y1",-10)
            .attr("y2",function(d,i){return heights[i]-10})
        ;

        if(numberOfPages > 1)
        {
            var bbPages = null;
            pagesGroup.each(function(){bbPages = this.getBBox()});

            var bbParent = null;
            parent.each(function(){bbParent = this.getBBox()});

            function translatePageGroup()
            {
                var tx = (bbParent.width-bbPages.width)/2;
                var ty = 270;
                return "translate(" + tx + "," + ty + ")";
            }

            pagesGroup.attr("transform",translatePageGroup);
        }
    }
}

function insertDefs(topLevel)
{
    var defs = topLevel
        .append('defs')
    ;

    defs
        .append('pattern')
            .attr('id', 'diagonalHatch')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 4)
            .attr('height', 4)
        .append('path')
            .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
            .attr('stroke', '#aaa')
            .attr('stroke-width', 2)
    ;

    defs
        .append("clipPath")
        .attr("id","cp1")
        .append("rect")
        .attr("x",60)
        .attr("y",0)
        .attr("width",930-120)
        .attr("height",120)
    ;

}

function loadTimeline(selector, country)
{
    d3.json(P + "/institutional/Resources/data/timeline-" + country + ".json",function(data){
        
        if(data.length == 0)
        {
            // Nothing to do...
            return;
        }       
        var firstYear = d3.min(data,function(d){return ~~d.year});
        var lastYear = d3.max(data,function(d){return ~~d.year});
        selectedYear = lastYear;
        var firstDecade = ~~(firstYear/10);
        var lastDecade = ~~(lastYear/10);

        var decadeArray = [ ];
        for(var i=firstDecade; i<=lastDecade; i++)
        {
            decadeArray.push(i*10);
        }

        // Nest years
        data = d3.nest()
            .key(function(d){return ~~d.year})
            .entries(data)
        ;

        var topLevel = selector;
                
        topLevel.selectAll('*').remove();
        
        var timeline = topLevel.append("g")
            .attr("class","timeline")
            .attr("clip-path","url(#cp1)")
        ;

        function scrollGroupTranslation()
        {
            if(selectedYear)
            {
                var tx = (930/2)-(lastDecade-firstDecade+1)*120*((selectedYear-(firstDecade*10))/((lastDecade+1)*10-(firstDecade*10)));
                var ty = 30;
                return "translate("+tx+","+ty+")";
            }
            else
            {
                return null;
            }
        }

        timeline.append("rect")
            .attr("class","rails")
            .attr("x",0)
            .attr("y",30)
            .attr("height",decadeHeight)
            .attr("width",930)
            .attr("fill","url(#diagonalHatch)")
        ;

        var scrollableGroup = timeline
            .append("g")
            .attr("transform",scrollGroupTranslation)
        ;

        scrollableGroup
            .selectAll(".decade")
            .data(decadeArray)
            .enter()
            .call(decadeDraw)
        ;

        scrollableGroup
            .append("line")
            .attr("x1",0)
            .attr("x2",0)
            .attr("y1",0)
            .attr("y2",decadeHeight)
            .attr("class","timelineLimit")
        ;

        scrollableGroup
            .append("line")
            .attr("x1",((lastDecade-firstDecade)+1)*decadeWidth)
            .attr("x2",((lastDecade-firstDecade)+1)*decadeWidth)
            .attr("y1",0)
            .attr("y2",decadeHeight)
            .attr("class","timelineLimit")
        ;

        var selectedYearText;

        function adjustScroll(newPage)
        {
            selectedPage = newPage || 0;
            if(content)
            {
                content
                    .transition()
                    .duration(400)
                    .style("opacity",0)
                    .each("end",updateContent);
                ;
            }
            else
            {
                updateContent();
            }

            function animateText()
            {
                    var currentValue = +this.textContent;
                    var interpolator = d3.interpolateRound(currentValue,selectedYear);
                    return function(t) { this.textContent = interpolator(t) };
            }

            selectedYearText
                .transition()
                .duration(400)
                .tween('text',animateText)
            ;

            scrollableGroup
                .transition()
                .duration(400)
                .attr("transform",scrollGroupTranslation)
            ;

            if(selectedYear == lastYear)
            {
                nextYearButton
                    .transition()
                    .delay(400)
                    .style("opacity",0)
                ;

                lastYearGroup
                    .transition()
                    .delay(400)
                    .style("opacity",0)
                ;
            }
            else
            {
                nextYearButton
                    .transition()
                    .delay(400)
                    .style("opacity",1)
                ;

                lastYearGroup
                    .transition()
                    .delay(400)
                    .style("opacity",1)
                ;
            }
            
            if(selectedYear == firstYear)
            {
                previousYearButton
                    .transition()
                    .delay(400)
                    .style("opacity",0)
                ;

                firstYearGroup
                    .transition()
                    .delay(400)
                    .style("opacity",0)
                ;
            }
            else
            {
                previousYearButton
                    .transition()
                    .delay(400)
                    .style("opacity",1)
                ;

                firstYearGroup
                    .transition()
                    .delay(400)
                    .style("opacity",1)
                ;
            }
        }

        function onEventClick()
        {
            var x = d3.mouse(this)[0];
            var pos = x / decadeWidth;
            var decade = Math.floor(pos);
            var year = 10*(firstDecade+decade)+Math.round((pos-decade)*10);
            var nearestYear = firstYear;
            for(var i in data)
            {
                var key = +data[i].key;
                var diff1 = Math.abs(nearestYear-year);
                var diff2 = Math.abs(key-year);
                if(diff2 < diff1)
                {
                        nearestYear = key;
                }
            }
            selectedYear = nearestYear;
            adjustScroll();
        }

        scrollableGroup.on("click",onEventClick);

        var allEvents = scrollableGroup
            .append("g")
        ;

        allEvents
            .append("rect")
            .attr("x",0)
            .attr("y",decadeHeight)
            .attr("height",50)
            .attr("width",((lastDecade-firstDecade)+1)*decadeWidth)
            .style("fill","white")

        ;

        allEvents
            .selectAll(".events")
            .data(data)
            .enter()
            .call(eventsDraw,firstDecade)
        ;

        var currentYearPointer = timeline.append("g")
            .attr("class","currentYear")
        ;

        currentYearPointer
            .append("rect")
            .attr("x",(930/2)-30)
            .attr("y",0)
            .attr("width",60)
            .attr("height",30)
        ;

        function lastYearClick()
        {
            if(selectedYear == lastYear)
            {
                return;
            }
            selectedYear = lastYear;
            adjustScroll();
        }
        
        
        function nextYear()
        {
            if(selectedYear == lastYear)
            {
                return;
            }
            var m = lastYear;
            for(var i in data)
            {
                var year = ~~data[i].key;
                if(year > selectedYear && year < m)
                {
                    m = year;
                }
            }
            selectedYear = m;
            adjustScroll();
        }

        function previousYear()
        {
            if(selectedYear == firstYear)
            {
                return;
            }
            var m = firstYear;
            for(var i in data)
            {
                var year = ~~data[i].key;
                if(year < selectedYear && year > m)
                {
                    m = year;
                }
            }
            selectedYear = m;
            adjustScroll();
        }

        function firstYearClick()
        {
            if(selectedYear == firstYear)
            {
                return;
            }
            selectedYear = firstYear;
            adjustScroll();
        }

        
        var lastYearGroup = topLevel
            .append("g")
            .attr("transform","translate("+(930-55)+","+45+")")
            .on("click",lastYearClick)
            .style("opacity",0)
        ;
        
        var lastYearButton = lastYearGroup
            .append("path")
            .attr("class","lastYearButton")
            .attr("d","M0 -8L0 8 10 0 Z M8 -8L8 8 18 0 Z")
        ;
        
        var lastYearText = lastYearGroup
            .append("text")
            .attr("class","limits")
            .attr("x",18)
            .attr("y",5)
            .text(lastYear)
        ;

        var firstYearGroup = topLevel
            .append("g")
            .attr("transform","translate("+(0)+","+45+")")
            .on("click",firstYearClick)
            .style("opacity",0)
        ;
        
        var firstYearButton = firstYearGroup
            .append("path")
            .attr("class","firstYearButton")
            .attr("transform","translate(55,0)")
            .attr("d","M0 -8L0 8 -10 0 Z M-8 -8L-8 8 -18 0 Z")
        ;

        var firstYearText = firstYearGroup
            .append("text")
            .attr("class","limits")
            .attr("x",4)
            .attr("y",5)
            .text(firstYear)
        ;

        var nextYearButton = currentYearPointer
            .append("path")
            .attr("class","rightButton")
            .attr("transform","translate("+(35+930/2)+","+16+")")
            .attr("d","M0 -8L0 8 10 0 Z")
            .on("click",nextYear)
            .style("opacity",0)
        ;

        var previousYearButton = currentYearPointer
            .append("path")
            .attr("class","leftButton")
            .attr("transform","translate("+(-35+930/2)+","+16+")")
            .attr("d","M0 -8L0 8 -10 0 Z")
            .on("click",previousYear)
            .style("opacity",0)
        ;

        currentYearPointer
            .append("line")
            .attr("x1",930/2)
            .attr("x2",930/2)
            .attr("y1",30)
            .attr("y2",60)
        ;

        currentYearPointer
            .append("path")
            .attr("transform","translate("+(930/2)+","+30+")")
            .attr("d","M-5 0L5 0 0 6Z")
        ;

        selectedYearText = currentYearPointer
            .append("text")
            .text(selectedYear)
            .attr("text-anchor","middle")
            .attr("x",930/2)
            .attr("y",24)
        ;

        var content = null;

        function updateContent()
        {                        
            topLevel.selectAll("g.content").remove();
            
            content = topLevel.append("g").attr("class","content");

            lawTextDraw(selectedYear, selectedPage, data, content, adjustScroll);

            function lawsTranslate()
            {
                var w = this.getBBox().width;
                var tx = (930-w)/2;
                var ty = 145;
                return "translate("+tx+","+ty+")";
            }

            content.attr("transform",lawsTranslate);

        }
        
			if(firstTime)
			{                
                    d3.selectAll(".legtext")
                        .text(function(){return this.textContent.trim()})
                    ;
                
                    var svg = topLevel;
                    topLevel
                        .attr("width", svgWidth)
                        .attr("height", svgHeight)
                    ;
                
				    firstTime = false;
				    /* This function places the legend drawing on top of   */
				    /* the main visualization and adjust colors and styles */
				    /* to reflect the currently selected product           */
				    function setLegend() {
                        var el = svg.node();
                        var rect = el.getBoundingClientRect();
                        var offset = [el.offsetLeft,el.offsetTop];
                        var leg = d3.select("#legenddiv");
                        leg
                            .style("left",offset[0]+legendOffset[0]+"px")
                            .style("top",offset[1]+legendOffset[1]+"px")
                            .style("visibility", "visible")
                        ;
				    }

				    setLegend();

				    /* Take care of the mouse events on the legend box so as to  */
				    /* allow the user to drag it to somewhere else on the screen */

				    var legx0 = 0;
				    var legy0 = 0;
				    var mouseX = 0;
				    var mouseY = 0;
				    var dragging = false;
				    d3.select ("#legenddiv")
				        .on ("mousedown", function () {
                            var leg = d3.select(this);
                            legx0 = parseInt (leg.style("left"));
                            legy0 = parseInt (leg.style("top"));
                            mouseX = d3.event.clientX;
                            mouseY = d3.event.clientY;
                            dragging = true;
                        })
				        .on ("mousemove", function () {
                            if (dragging) {                    
                                var leg = d3.select(this);
                                leg.style("left",(legx0+d3.event.clientX-mouseX)+"px")
                                .style("top",(legy0+d3.event.clientY-mouseY)+"px");
                            }
                        })
                        .on ("mouseup", function () {
                            dragging = false;
                            legendOffset [0] += (d3.event.clientX-mouseX);
                            legendOffset [1] += (d3.event.clientY-mouseY);
                        });
				}

        updateContent();
        adjustScroll();
    });
}


/*
 *  This function produces an appropriate function for logging the change in a given
 *  variable. 
 */
function clickLog (name) {
  //
  // ga is a function provided by the idb that logs clicks. If not defined,
  // we are running inside a development environment, so we just log to the console
  //
  var varName = name.slice(0);
  
  return function (v) {
    try {
      ga('send', 'event', {
        eventCategory: 'EN', 
        eventAction: varName,
        eventLabel: v+""
      })
    } catch (err) {
      //console.log ('error calling ga '+err);
    }
  }
  
}



// Define a dummy translation function if not yet defined
if (TL == undefined) TL = function (x) {return x};

// The name space
idb = {};


// Global defaults 
idb.comboPos = [10,10]; // Position of the combo menu bar w.r.t. the svg
idb.comboSize = [930,25]; // Width and height of the combo menu bar
idb.comboTitlePos = [30,17];  // Position of each title within the menu tab 
idb.arrow = "›"; // The arrow symbol separating the title of each menu from its value
idb.roundSize = 4;  // The radius of the rounded corners
idb.dropDownDuration = 500; // Time in milliseconds of the dropdown animation
idb.comboButtonIconX = 5; // X displacement of the dropdown icon 
idb.tabSpacing = []; // Controls the distribution of horizontal space. It's an array of
                    // pixel sizes: one for each tab. If a value is missing, then the remaining
                    // tabs receive an equal share of the remainder space

// Dropdown-specific configurations
idb.institutionalSector = {
  "title" : "Sector",      // What is to be shown at the menu bar
  "dropDownHeight": 120,    // height of the menu dropdown area
  "size" : [900,120],       // Size of the interface
  "position" : [0,30],      // Position of the interface within the dropdown
  "iconScale" : 0.08,       // How much to reduce the product icons w.r.t. their original size
  "all" : "All Products",   // Meaning of the 'all' icon
};

idb.yearInstitutional = {
  "title" : "Year",       // What is to be shown at the menu bar
  "dropDownHeight": 120,    // height of the menu dropdown area
  "timeline": {             // Settings for the timeline menus
    "position" : [20,25],
    "size" : [870, 120],
  }
};

idb.countryInstitutional = {
  "title" : "Country",      // What is to be shown at the menu bar
  "dropDownHeight": 60,    // height of the menu dropdown
  "position" : [0,20],      // position of the interface inside the dropdown
  "size" : [900,65],       // size of the interface
  "multiSel" : false,        // whether the interface is for selecting multiple countries
  "multiSelLimit" : 5,      // how many countries at most, if multisel
  "manageColors" : false,    // selected countries have selectable colors?
};

idb.countryInstitutionalWithThreeLetters = {
  "title" : "Country",      // What is to be shown at the menu bar
  "dropDownHeight": 130,    // height of the menu dropdown
  "position" : [0,20],      // position of the interface inside the dropdown
  "size" : [900,140],       // size of the interface
  "multiSel" : false,        // whether the interface is for selecting multiple countries
  "multiSelLimit" : 5,      // how many countries at most, if multisel
  "manageColors" : false,    // selected countries have selectable colors?
};

idb.product = {
  "title" : "Source",      // What is to be shown at the menu bar
  "dropDownHeight": 120,    // height of the menu dropdown area
  "size" : [900,120],       // Size of the interface
  "position" : [0,30],      // Position of the interface within the dropdown
  "iconScale" : 0.08,       // How much to reduce the product icons w.r.t. their original size
  "all" : "All Products",   // Meaning of the 'all' icon
  "showNonTradeProducts": true, // Setting to false will omit Hydro, Geothermal, Nuclear, Solar
  "showLosses": false,      // Whether to show the losses icon
  "showPeat" : false,        // Whether to show the Peat icon
};

idb.bioproduct = {
  "title" : "Source",      // What is to be shown at the menu bar
  "dropDownHeight": 120,    // height of the menu dropdown area
  "size" : [900,120],       // Size of the interface
  "position" : [0,30],      // Position of the interface within the dropdown
  "iconScale" : 0.08,       // How much to reduce the product icons w.r.t. their original size
  "all" : "All Sources",   // Meaning of the 'all' icon
};

idb.incomeProducts = {
  "title" : "Source",      // What is to be shown at the menu bar
  "dropDownHeight": 120,    // height of the menu dropdown area
  "size" : [900,120],       // Size of the interface
  "position" : [0,30],      // Position of the interface within the dropdown
  "iconScale" : 0.08,       // How much to reduce the product icons w.r.t. their original size
  "all" : "All Sources",   // Meaning of the 'all' icon
  "showNonTradeProducts": true, // Setting to false will omit Hydro, Geothermal, Nuclear, Solar
  "showLosses": false,      // Whether to show the losses icon
  "showPeat" : false,        // Whether to show the Peat icon
};

idb.period = {
  "title" : "Period",       // What is to be shown at the menu bar
  "dropDownHeight": 110,    // height of the menu dropdown area
  "timeline": {             // Settings for the timeline menus
    "position" : [20,45],
    "size" : [870, 120],
  },
  "periodType": {           // Settings for the period type menu
    "position": [20, 22],
    "size": [300,30],
    "active": true
  },
  "play": {                 // Settings for play button
    "position": [10, 94],
    "size": [40,40],
    "iconScale": 0.04,
  },
  "lastYear" : 2016,        // Last year to be shown in the menu
};

idb.country = {
  "title" : "Country",      // What is to be shown at the menu bar
  "dropDownHeight": 200,    // height of the menu dropdown
  "position" : [0,40],      // position of the interface inside the dropdown
  "size" : [900,200],       // size of the interface
  "multiSel" : false,        // whether the interface is for selecting multiple countries
  "multiSelLimit" : 6,      // how many countries at most, if multisel
  "manageColors" : false,    // selected countries have selectable colors?
};

idb.latCountry = {
  "title" : "Countries",      // What is to be shown at the menu bar
  "dropDownHeight": 150,    // height of the menu dropdown
  "position" : [0,45],      // position of the interface inside the dropdown
  "size" : [900,150],       // size of the interface
  "arrow" : "",              // No arrow
  "sampleSize" : 8,          // Size of the sample
};

idb.units = {
  "title" : "Units",
  "dropDownHeight" : 60, 
  "position": [10,30],
  "size": [900,60],
  "percent": false,         // If true, add a '% of Total' option
  "sampleSize" : 8,         // Size of the sample
  "sampleDx" : 10,          // Separation between the sample and the menu label
};

idb.scale = {
  "title" : "Scale",
  "dropDownHeight" : 60, 
  "position": [10,30],
  "size": [900,60],
  "sampleSize" : 8,         // Size of the sample
  "sampleDx" : 10,          // Separation between the sample and the menu label
};

idb.flow = {
  "title" : "Flow",
  "dropDownHeight" : 60, 
  "position": [10,30],
  "size": [900,60],
  "sampleSize" : 8,
  "sampleDx" : 10,
  "onlyTrade" : false,     // Whether to show only imports/exports/both
};

idb.periodType = {
  "title" : "Period",
  "dropDownHeight" : 60, 
  "position": [10,30],
  "size": [900,60],
  "sampleSize" : 8,
  "sampleDx" : 10,
};

idb.rightSide = {
  "title" : "Right side",
  "dropDownHeight" : 60, 
  "position": [10,30],
  "size": [900,60],
  "sampleSize" : 8,
  "sampleDx" : 10,
};



// Defines a menu bar in an svg element or group given by parent (a d3 selection). 
// The menu bar controls dropdown panels which, when shown, also shift down visualization (a d3 selection). 
// The menu bar is populated with dropdown slots which are filled with individual menus
// or other interface elements. Returns an array of interface objects, one for each dropdown definition.
idb.menuBar = function (parent, visualization, dropDownDefs) {

  // Add a drop shadow def into the parent
  var defs = parent.append ("defs");
  var dropfilter = defs.append ("filter").attr ("id", "drop-shadow");
  dropfilter.append ("feGaussianBlur").attr("in", "SourceAlpha").attr ("stdDeviation", "8");
  dropfilter.append ("feOffset").attr("dx", "2").attr ("dy", "3").attr("result", "offsetblur");
  dropfilter.append ("feFlood").attr("flood-color", "rgba(0,0,0,0.2)");
  dropfilter.append ("feComposite").attr("in2", "offsetblur").attr ("operator", "in");
  var feMerge = dropfilter.append ("feMerge");
  feMerge.append ("feMergeNode");
  feMerge.append ("feMergeNode").attr ("in", "SourceGraphic");

  // Compute the maximum dropdown height
  var maxDropDownHeight = 0;
  for (var i = 0; i < dropDownDefs.length; i++) {
    if (dropDownDefs[i].dropDownHeight > maxDropDownHeight) maxDropDownHeight = dropDownDefs[i].dropDownHeight;
  }

  // Define the combo
  lcg.defaults.comboButtonIconX = idb.comboButtonIconX;
  // Compute tab space
  var ts = idb.comboSize[0];
  for (var i in idb.tabSpacing) ts -= idb.tabSpacing[i];
  var tabSize = dropDownDefs.length > idb.tabSpacing.length ? ts / (dropDownDefs.length - idb.tabSpacing.length) : 1;  

  var combo = lcg.DropDownCombo (
    parent, 
    tabSize, 
    idb.comboSize[1], 
    idb.comboSize[0],
    maxDropDownHeight);

  // Place the combo at the right position
  combo.g.attr("transform", "translate("+idb.comboPos[0]+","+idb.comboPos[1]+")");

  // Define the interfaces
  var interfaces = [];

  for (var i = 0; i < dropDownDefs.length; i++) {
    var dd = combo.DropDown (
      dropDownDefs[i].dropDownHeight,
      TL(dropDownDefs[i].title),
      idb.comboTitlePos [0],
      idb.comboTitlePos [1], 
      i == 0 ? [1,0,0,1] : (i == dropDownDefs.length-1 ? [0,1,1,0] : [0,0,0,0]), 
      idb.roundSize,
      idb.tabSpacing[i]);
    if (dropDownDefs[i].arrow == undefined) 
      dd.setArrow (idb.arrow);
    else
      dd.setArrow (dropDownDefs.arrow);

    // Add clicklog to the dropdown setValue method
    //var logFunction = clickLog(dropDownDefs[i].title);
    //var oldSetValue = dd.setValue;
    dd.setValue = function (lf,sv,gv) {
      return function (v) {
        if (v != gv()) {
          lf (v);
          sv (v);
        }
      }
    } (clickLog(dropDownDefs[i].title), dd.setValue, dd.getValue);

    interfaces.push(dropDownDefs[i].interface (dd));
  }

  // Set the dropdown behavior for the visualization
  var visTranslation = lcg.getTranslation (visualization);

  // What happens when one of the dropdown menus is shown
  combo.onDropDown = function (dy) {
      visualization.transition ()
        .duration (idb.dropDownDuration)
        .attr ("transform", "translate ("+ visTranslation[0]+","+(visTranslation[1]+dy/2)+")")
  };

  // What happens when all dropdown menus are hidden
  combo.onRollUp = function () {
      visualization.transition ()
        .duration (idb.dropDownDuration)
        .attr ("transform", "translate ("+ visTranslation[0]+","+(visTranslation[1])+")")
  };

  return interfaces;
}


// Function to set up an interface for selecting the meaning of the right side of 
// visualization 1.8
idb.rightSide.interface = function (dropdown) {
  var interface = {};

  var rightSideMenu = lcg.menu() 
      .parent (dropdown.menu)
      .id ("rightSideMenu")
      .type("radio")    
      .position (idb.rightSide.position)
      .size (idb.rightSide.size)
      .set("direction", "h")     
      .set("rSize", idb.rightSide.sampleSize)       // Size of the sample
      .set ("rSep", idb.rightSide.sampleDx)
      .set("labelOffset", 0)  // Vertical displacement between the sample and the entry label
      .set("entrySep", 30)    // Separation between menu entries 
      .value (function (d,i) { return TL(d); })
      .data (["Consumption by sector", "Generation by source"])
      .select ([0]);          // Select consumption by default

  /* Callback for clicking on a unit */
  function onRightSideClicked () {
    var sel = rightSideMenu.selectedData();
      dropdown.setValue(TL(sel.join()));
    interface.onChange();
  }

  /* Function to manually set units */
  function selectRightSide (d) {
      rightSideMenu.select (function (D,i) { return D == d; });
      onrightSideClicked();
  }

  /* Configure the callback  */
  rightSideMenu.set ("onClick", onRightSideClicked); 

  // How to use this interface externally?
  interface.selectedData = rightSideMenu.selectedData; // Function to return the selected period type
  interface.select = selectRightSide; // Function to select a period type
  interface.active = rightSideMenu.activeData; // Function to set / inquire the active period type
  interface.onChange = function () {};  // Function that gets called when the selection changes

  onRightSideClicked ();

  // Return the interface object
  return interface;
}

// Function to set up an interface for selecting periodization by years or 4-year averages
idb.periodType.interface = function (dropdown) {
  var interface = {};

  var periodTypeMenu = lcg.menu() 
      .parent (dropdown.menu)
      .id ("periodTypeMenu")
      .type("radio")    
      .position (idb.periodType.position)
      .size (idb.periodType.size)
      .set("direction", "h")     
      .set("rSize", idb.periodType.sampleSize)       // Size of the sample
      .set ("rSep", idb.periodType.sampleDx)
      .set("labelOffset", 0)  // Vertical displacement between the sample and the entry label
      .set("entrySep", 30)    // Separation between menu entries 
      .value (function (d,i) { return TL(d); })
      .data (["Years", "Averages"])
      .select (["Years"]);          // Select years by default

  /* Callback for clicking on a unit */
  function onPeriodTypeClicked () {
    var sel = periodTypeMenu.selectedData();
      dropdown.setValue(TL(sel.join()));
    interface.onChange();
  }

  /* Function to manually set units */
  function selectPeriodType (d) {
      periodTypeMenu.select (function (D,i) { return D == d; });
      onPeriodTypeClicked();
  }

  /* Configure the callback for unitsMenu */
  periodTypeMenu.set ("onClick", onPeriodTypeClicked); 

  // How to use this interface externally?
  interface.selectedData = periodTypeMenu.selectedData; // Function to return the selected period type
  interface.select = selectPeriodType; // Function to select a period type
  interface.active = periodTypeMenu.activeData; // Function to set / inquire the active period type
  interface.onChange = function () {};  // Function that gets called when the selection changes

  // Return the interface object
  return interface;
}


// Function to set up an energy units selection interface
idb.flow.interface = function (dropdown) {
  var interface = {};

  var menuData = ["Imports", "Exports"] ;

  if (idb.flow.onlyTrade) {
    menuData = menuData.concat(["Both"]);
  }
  else {
    menuData = menuData.concat(["Production", "Supply", "Final Consumption", "Transformation"]);
  }
  var labelShorten = {
    "Final Consumption" : "Consumption"
  };
  
  var flowMenu = lcg.menu ()
            .parent (dropdown.menu)
            .id ("flowMenu")
            .position (idb.flow.position)
            .size (idb.flow.size)
            .set ("showSample", true)
            .type ("radio")
            .set ("rSize", idb.flow.sampleSize)
            .set ("labelOffset", 0)
            .set ("entrySep", 30)
            .set ("rSep", idb.flow.sampleDx)
            .set ("direction", "h")
            .value (function (d,i) { return TL(d); })
            .data (menuData)
            .select ([menuData[idb.flow.onlyTrade ? 2 : 3]]);

  /* Callback for clicking on a unit */
  function onFlowClicked () {
    var sel = flowMenu.selectedData().join();
    dropdown.setValue(labelShorten[sel] ? TL(labelShorten[sel]) : TL(sel));
    interface.onChange();
  }

  /* Function to manually set units */
  function selectFlow (d) {
      flowMenu.select (function (D,i) { return D == d; });
      onFlowClicked();
  }

  /* Configure the callback for unitsMenu */
  flowMenu.set ("onClick", onFlowClicked); 

  // How to use this interface externally?
  interface.selectedData = flowMenu.selectedData; // Function to return the selected flow
  interface.select = selectFlow; // Function to select a flow
  interface.active = flowMenu.activeData; // Function to set / inquire the active flow
  interface.onChange = function () {};  // Function that gets called when the selection changes

  // Return the interface object
  return interface;
}

// Function to set up an energy units selection interface
idb.units.interface = function (dropdown) {
  var interface = {};

  var menuData = ["kboe", "gdp", "population"];

  if (idb.units.percent) menuData.push("percent");

  var unitsMenu = lcg.menu ()
            .parent (dropdown.menu)
            .id ("unitsMenu")
            .position (idb.units.position)
            .size (idb.units.size)
            .set ("showSample", true)
            .type ("radio")
            .set ("rSize", idb.units.sampleSize)
            .set ("labelOffset", 0)
            .set ("entrySep", 30)
            .set ("rSep", idb.units.sampleDx)
            .set ("direction", "h")
            .value (function (d,i) { return TL(d); })
            .data (menuData);

  /* Callback for clicking on a unit */
  function onUnitsClicked () {
    var sel = unitsMenu.selectedData();
      dropdown.setValue(TL(sel.join()));
    interface.onChange();
  }

  /* Function to manually set units */
  function selectUnits (d) {
      unitsMenu.select (function (D,i) { return D == d; });
      onUnitsClicked();
  }

  /* Configure the callback for unitsMenu */
  unitsMenu.set ("onClick", onUnitsClicked); 

  // How to use this interface externally?
  interface.selectedData = unitsMenu.selectedData; // Functon to return the selected units
  interface.select = selectUnits; // Function to select a unit
  interface.active = unitsMenu.activeData; // Function to set / inquire the active units
  interface.onChange = function () {};  // Function that gets called when the selection changes

  // Return the interface object
  return interface;
}

// Function to set up scale selection interface
idb.scale.interface = function (dropdown) {
  var interface = {};

  var menuData = ["fixed", "variable"];

  var scaleMenu = lcg.menu ()
            .parent (dropdown.menu)
            .id ("scaleMenu")
            .position (idb.scale.position)
            .size (idb.scale.size)
            .set ("showSample", true)
            .type ("radio")
            .set ("rSize", idb.scale.sampleSize)
            .set ("labelOffset", 0)
            .set ("entrySep", 30)
            .set ("rSep", idb.scale.sampleDx)
            .set ("direction", "h")
            .value (function (d,i) { return TL(d); })
            .data (menuData);

  /* Callback for clicking on a scale */
  function onScaleClicked () {
    var sel = scaleMenu.selectedData();
      dropdown.setValue(TL(sel.join()));
    interface.onChange();
  }

  /* Function to manually set scale */
  function selectScale (d) {
      scaleMenu.select (function (D,i) { return D == d; });
      onScaleClicked();
  }

  /* Configure the callback for scaleMenu */
  scaleMenu.set ("onClick", onScaleClicked); 

  // How to use this interface externally?
  interface.selectedData = scaleMenu.selectedData; // Functon to return the selected units
  interface.select = selectScale; // Function to select a scale
  interface.active = scaleMenu.activeData; // Function to set / inquire the active units
  interface.onChange = function () {};  // Function that gets called when the selection changes

  // Return the interface object
  return interface;
}

// Function to set up a country selection interface
idb.country.interface = function (dropdown) {

  var interface = {};


    var groupNames = ["Borrowing Member Countries", "Non-Borrowing Member Countries", "Regions"];
    
    var groupPanels = [[0,1,2],[3,4,5],[6]];

    var menuData =  [ 
        /* Members */
        [ "Argentina", "Bahamas", "Barbados", "Belize", "Bolivia", "Brazil",
          "Chile", "Colombia", "Costa Rica"],  
        [ "Cuba", "Dominican Republic", "Ecuador", "El Salvador",  "Guatemala",
          "Guyana", "Haiti", "Honduras", "Jamaica"],
        [ "Mexico", "Nicaragua",  "Panama", "Paraguay", "Peru", "Suriname", "Trinidad & Tobago",
          "Uruguay", "Venezuela"], 
        
        /* Non Members */
        [ "Austria", "Belgium",  "Canada", "China",  "Croatia", "Denmark", "Finland", "France", "Germany"],
        [ "India", "Israel", "Italy",  "Japan", "Korea",  "Netherlands", "Norway","Portugal", "Slovenia"],
        [ "Spain",  "Sweden", "Switzerland", "United Kingdom", "USA" ], 
        
        /* Regions */
        [ "Andean", "Central America", "Europe", "LAC", "North America", "Southern Cone", "World" ]        
    ];

    var labelShorten = {
        "Dominican Republic" : "Dominican Rep.",
        "Trinidad & Tobago" : "Trinidad & T."
    };

    var countryMenu = lcg.megamenu()
         .parent(dropdown.menu)
         .id ("countryMenu")
         .position(idb.country.position)
         .size (idb.country.size)
         .set ("showSample", false) // No icons or samples before the text
         .type(idb.country.multiSel ? "check" : "radio")  // Select many or only one
         .set ("checkLimit", idb.country.multiSelLimit)   // No of countries selected at a time
         .manageColors (idb.country.manageColors)     // enables submenus to change the colors of the entries
         .set ("direction", "v") // Vertical layout
         .set ("align", "min")       // Left align the entries
         .set ("panelAlign", "dist")  // Center the columns
         .set ("panelSep", 2)     // Separation between columns
         .set ("entrySep", 4)      // Separation between entries
         .set ("entryBackdropPad", [3,3,16,2]) // How much to enlarge the entry backdrop rectangles [left,top,right,bottom])
         .set ("equalSizedPanels", true)
         .value (function (d) {             // Some country names have to be shortened
                return labelShorten[d] ? TL(labelShorten[d]) : TL(d);
              })
         .set ("isTitle", function (d,i) { 
            return false;})
         .data (menuData);

    /* Get geometry of the menu panels */
    var panelPos = [];
    var boxfunc = function (d,i) {
      var j = 0;
      for (j = 0; j < groupPanels.length; j++) {
        if (groupPanels[j].indexOf(i) >= 0) break;
      }
      var sel = d3.select(this)
      var box = sel.node().getBBox();
      if (panelPos[j] == undefined) {
        panelPos[j] = {x: lcg.getTranslation(sel)[0], width: box.width};
      } else {
        panelPos[j].width = lcg.getTranslation(sel)[0]-panelPos[j].x + box.width;
      }
    };
    countryMenu._group.select(".menu").selectAll (".menupanel").each(boxfunc);

    /* Create titles for the country groups */
    var panelTitles = 
      countryMenu._group.select(".menu").selectAll (".paneltitle").data(panelPos).enter()
      .append ("g")
      .attr ("class", "paneltitle")
      .attr ("transform", function (d,i) {
          return "translate ("+d.x+",-8)"
        });

    panelTitles
      .append ("rect")
      .attr ("y", 0)
      .attr ("x", 0)
      .attr ("height", 2)
      .attr ("width", function (d) { return d.width; });

    panelTitles
      .append ("text")
      .attr ("dy", -4)
      .attr ("class", "menutitle")
      .text (function (d,i) { return TL(groupNames[i]); });

    /* Callback for clicking on a country */
    function onCountryClicked () {
      var sel = countryMenu.selectedData();
      if (idb.country.multiSel) {
        /* Get abbreviations for selected countries */
        var abbrev = [];
        for (var i = 0; i < sel.length; i++) {
          abbrev.push(twoLetter[sel[i]]);
        }
        dropdown.setValue(abbrev.join());   
      }
      else {
        var d = sel.join();
        dropdown.setValue(labelShorten[d] ? TL(labelShorten[d]) : TL(d));
      }
      interface.onChange();
    }

    /* Function to manually set a set of countries */
    function selectCountry (d) {
        countryMenu.select (function (D,i) { return d.indexOf(D) >= 0; });
        onCountryClicked();
    }

    /* Configure the callback for countryMenu */
    countryMenu.set ("onClick", onCountryClicked); 

    /* Add a menu to select all / no countries */
    if (idb.country.multiSel) {
        var allNoneMenu = lcg.megamenu()
            .parent(dropdown.menu)
            .id ("allNoneMenu")
            .size ([85,25])
            .position ([idb.country.size[0]-102,idb.country.size[1]-20])
            .set ("showSample", true)
            .set ("rSep", 10)
            .type ("button")
            .set ("labelOffset", 4)
            .set ("direction", "v")
            .set ("panelAlign", "mid")
            .set ("panelSep", 15)
            .set ("samplePos", "left")
            .set ("iconPath", function (d) { return iconpath ["Check"+d]; })
            .set ("entryBackdropPad", [8,3,18,4]) // How much to enlarge the entry backdrop rectangles [left,top,right,bottom])            
            .set ("iconScale", 1.2)
            .value (function (d) { 
                if (d == "None") {
                  return TL("deselect all"); 
                }
                return TL(d);
            })
            .color (function (d) { return "#fff" } )
            .data ([["None"]])
            .onClick (function (d) {
                if (d == "None") {
                    countryMenu.select ([]);
                    onCountryClicked();
                }
            });
    }

    // How to use this interface externally?
    interface.selectedColors = countryMenu.selectedColors; // Function to return the set of colors
    interface.selectedData = countryMenu.selectedData; // Function to return the selected countries
    interface.select = selectCountry; // Function to select a list of countries
    interface.active = countryMenu.activeData; // Function to set / inquire the active countries
    interface.onChange = function () {};  // Function that gets called when the selection changes

    // Return the interface object
    return interface;
}

// Function to set up a country selection interface for latin american countries
idb.latCountry.interface = function (dropdown) {

    var interface = {};

    var groupNames = ["Southern Cone", "Andean", "Caribbean", "Central America & Mexico"];
    var groupPanels = [[0],[1],[2,3],[4,5]];
    var countryGroups = [["Argentina", "Brazil", "Chile", "Paraguay", "Uruguay"], 
                    ["Bolivia", "Colombia", "Ecuador", "Peru", "Venezuela"],
                    ["Barbados", "Bahamas", "Cuba", "Dominican Republic", "Guyana", "Haiti", "Jamaica", "Suriname", "Trinidad & Tobago"], 
                    ["Belize",  "Costa Rica", "El Salvador",  "Guatemala", 
                     "Honduras", "Mexico", "Nicaragua", "Panama"]];

    var emptyTitle = " "; // Note: that is not a space, but a quad space!
    var menuData = [countryGroups[0],
                    countryGroups[1],
                    countryGroups[2].slice(0,5),
                    countryGroups[2].slice(5,9), 
                    countryGroups[3].slice(0,5),
                    countryGroups[3].slice(5,11)];

    var countryGroupColor = [        /* Base colors for comparison countries */
        d3.rgb(207, 72, 39),  /* South Cone */
        d3.rgb(226, 200, 51), /* Andes */
        d3.rgb(73, 192,184),  /* Caribbean */ 
        d3.rgb(144, 199, 62), /* Central */
    ]; 

    var labelShorten = {
        "Dominican Republic" : "Dominican Rep.",
        "Trinidad & Tobago" : "Trinidad & T."
    };

    var countryMenu = lcg.megamenu()
         .parent(dropdown.menu)
         .id ("latcountrymenu")
         .position(idb.latCountry.position)
         .size (idb.latCountry.size)
         .set ("showSample", true) // No icons or samples before the text
         .set ("rSize", idb.latCountry.sampleSize)
         .set ("labelOffset", 4)
         .type("check")  // Select many or only one
         .set ("checkLimit", 100)   // No of countries selected at a time
         .manageColors (idb.latCountry.manageColors)     // enables submenus to change the colors of the entries
         .set ("direction", "v") // Vertical layout
         .set ("isTitle", function (d,i) { return d == emptyTitle || groupNames.indexOf(d) >= 0; })
         .set ("align", "min")       // Left align the entries
         .set ("panelAlign", "dist")  // Center the columns
         .set ("panelSep", 7)     // Separation between columns
         .set ("entrySep", 4)      // Separation between entries
         .set ("entryBackdropPad", [3,3,10,2]) // How much to enlarge the entry backdrop rectangles [left,top,right,bottom])
         .set ("equalSizedPanels", true)
         .value (function (d) {             // Some country names have to be shortened
                return labelShorten[d] ? TL(labelShorten[d]) : TL(d);
              })
         .data (menuData);

    /* Get geometry of the menu panels */
    var panelPos = [];
    var boxfunc = function (d,i) {
      var j = 0;
      for (j = 0; j < groupPanels.length; j++) {
        if (groupPanels[j].indexOf(i) >= 0) break;
      }
      var sel = d3.select(this)
      var box = sel.node().getBBox();
      if (panelPos[j] == undefined) {
        panelPos[j] = {x: lcg.getTranslation(sel)[0], width: box.width};
      } else {
        panelPos[j].width = lcg.getTranslation(sel)[0]-panelPos[j].x + box.width;
      }
    };
    countryMenu._group.select(".menu").selectAll (".menupanel").each(boxfunc);

    /* Create titles for the country groups */
    var panelTitles = 
      countryMenu._group.select(".menu").selectAll (".paneltitle").data(panelPos).enter()
      .append ("g")
      .attr ("class", "paneltitle")
      .attr ("transform", function (d,i) {
          return "translate ("+d.x+",-10)"
        })
      .style ("fill", function (d,i) { return countryGroupColor[i]; });

    panelTitles
      .append ("rect")
      .attr ("y", 0)
      .attr ("x", 0)
      .attr ("height", 2)
      .attr ("width", function (d) { return d.width; });

    panelTitles
      .append ("text")
      .attr ("dy", -4)
      .attr ("class", "menutitle")
      .text (function (d,i) { return TL(groupNames[i]); });

    /* Callback for clicking on a country */
    function onCountryClicked () {
      var sel = countryMenu.selectedData();
      interface.onChange();
    }

    /* Function to manually set a set of countries */
    function selectCountry (d) {
        countryMenu.select (function (D,i) { return d.indexOf(D) >= 0; });
        onCountryClicked();
    }

    /* Returns the colors of each selected country */
    function selectedColors () {
        var ret = [];
        var selCountries = countryMenu.selectedData();
        for (var i = 0; i < selCountries.length; i++) {
            var d = selCountries[i];
            for (var j = 0; j < countryGroups.length; j++) {
              if (countryGroups[j].indexOf(d) >= 0) {
                  ret.push(countryGroupColor[j].toString());
                  break;
              }
            }
        }
        return ret;
    }

    /* Configure the callback for countryMenu */
    countryMenu.set ("onClick", onCountryClicked); 


    /* Add a menu to select all / no countries */
    var allNoneMenu = lcg.megamenu()
            .parent(dropdown.menu)
            .id ("allNoneMenu")
            .size ([150,100])
            .position ([idb.latCountry.size[0]-150,idb.latCountry.size[1]-45])
            .set ("showSample", true)
            .type ("button")
            .set ("labelOffset",4)
            .set ("rSep", 10)
            .set ("direction", "v")
            .set ("panelAlign", "mid")
            .set ("panelSep", 0)
            .set ("samplePos", "left")
            .set ("entrySep", 10)      // Separation between entries
            .set ("iconPath", function (d) { return iconpath ["Check"+d]; })
            .set ("entryBackdropPad", [8,3,20,4]) // How much to enlarge the entry backdrop rectangles [left,top,right,bottom])
            .set ("iconScale", 1.2)
            .value (function (d) { 
                if (d == "None") {
                  return TL("deselect all"); 
                }
                return TL("select all");
            })
            .color (function (d) { return "#fff" } )
            .data ([["All","None"]])
            .onClick (function (d) {
                if (d == "None") {
                    countryMenu.select ([]);
                    onCountryClicked();
                }
                else {
                    countryMenu.select (function(){return true});
                    onCountryClicked();
                }
            });


    // How to use this interface externally?
    interface.selectedColors = selectedColors; // Function to return the set of colors
    interface.selectedData = countryMenu.selectedData; // Functon to return the selected countries
    interface.select = selectCountry; // Function to select a list of countries
    interface.active = countryMenu.activeData; // Function to set / inquire the active countries
    interface.onChange = function () {};  // Function that gets called when the selection changes

    // Return the interface object
    return interface;
}

/* Function to set up a product selection interface */
idb.product.interface = function (dropdown) {

  var interface = {};
  
  var menuData = [[idb.product.all], ["-"], ["Coal"], ["Crude Oil"], ["Gas"]];

  if (idb.product.showNonTradeProducts) {
    menuData = menuData.concat([["Nuclear"], ["Hydro"], ["Geothermal"], ["Solar & Wind"]])
  }

  menuData.push(["Biocomb. & Waste"]);

  if (idb.product.showPeat) {
    menuData = menuData.concat([["Peat"]]);
  }

  menuData = menuData.concat ([["-"], ["Oil Products"], ["Electricity"]]); 

  if (idb.product.showLosses) {
    menuData = menuData.concat ([["-"], ["Losses"]]);
  }
  var productColor = {};
  productColor[idb.product.all] = d3.rgb(144,172,178);
  productColor["Coal"] = d3.rgb(60,60,73);  
  productColor["Crude Oil"] = d3.rgb(50,82,163);
  productColor["Gas"] = d3.rgb(244,81,37);
  productColor["Nuclear"] = d3.rgb(166,106,171);
  productColor["Hydro"] = d3.rgb(71,142,204); 
  productColor["Geothermal"] = d3.rgb(181,6,39);
  productColor["Solar & Wind"] = d3.rgb(252,210,0);
  productColor["Biocomb. & Waste"] = d3.rgb(128,194,80); 
  productColor["Peat"] = d3.rgb(13,180,0); 
  productColor["Oil Products"] = d3.rgb(13,102,110); 
  productColor["Electricity"] = productColor["Losses"] = d3.rgb(204,153,0);
  var abbrev = {};
  abbrev["Crude Oil"] = "Crude";
  abbrev["Solar & Wind"] = "Solar&Wind";
  abbrev["Biocomb. & Waste"] = "Biocomb."; 
  abbrev["Oil Products"] = "Oil Prod."; 
  abbrev["Electricity"] = "Electricity"; 

  var labelSplit = {
      "All Primary" : "All|Primary",
      "All Products" : "All|Products",
      "Solar & Wind" : "Solar &|Wind",
      "Biocomb. & Waste" : "Biocomb.&|Waste",
      "Oil Products" : "Oil|Products",
      "Crude Oil" : "Crude|Oil",
      "Losses": "Heat, Waste &|Losses",
  };

  var productMenu = lcg.megamenu()
     .parent(dropdown.menu)
     .id ("productMenu")
     .position(idb.product.position)
     .size (idb.product.size)
     .set ("showSample", true)
     .type("radio")                // Up to one selected entry is possible 
     .set ("direction", "v")           // Horizontal layout
     .set ("panelAlign", "mid")        // Align the panels (columns) by their centers
     .set ("panelSep", 17)             // Minimum separation between panels (columns)
     .set ("samplePos", "top")         // Put the icon above the legend
     .set ("iconPath", function (d,i) { // Map the data to the path geometries
        return d == idb.product.all ? iconpath["All Products"] : iconpath[d]; 
      })
     .set ("iconScale", idb.product.iconScale) // The path geometries have size 500 -> reduce by this amt
     .value (function (d) {             // Some energy names have to be split in two lines
        return labelSplit[d] ? TL(labelSplit[d]) : TL(d);
      })
     .category (function (d,i,j) {      // Map the panel number to the category 
        return d;
     })
     .color (function (d) {            // Map the category to a color
        return productColor[d]; 
      })
     .data (menuData);


    /* Special highlighting code so that when one product is selected all the remaining
       ones are set with a low opacity - couldn't find a way of doing it with css */
    function highlightProduct () {
        var sel = productMenu.selectedData();
        if (sel.length>0) sel = sel[0]; else sel = "";
        d3.selectAll ("#productMenu .entry")
          .style ("opacity", function (d,i) {
            if (d==sel || sel == idb.product.all) return 1;
            if (d == idb.product.all) return 0.5;
            return 0.2;
          });
    }

    /* Callback for clicking on a Product */
    function onProductClicked (d,i) {
        var sel = productMenu.selectedData();
        if (sel.length>0) sel = sel[0]; else sel = "";  
        dropdown.setValue (TL(abbrev[sel]||sel));
        highlightProduct ();
        interface.onChange();
    }

    /* Returns the colors of the selected Products */
    function selectedColors () {
        var ret = [];
        var sel = productMenu.selectedData();
        for (var i in sel) ret.push (productColor[sel[i]]);
        return ret;
    }

    /* Function to manually set a product */
    function selectProduct (d) {
        d = d.toUpperCase();
        productMenu.select (function (D,i) { return D.toUpperCase() == d; });
        var sel = productMenu.selectedData();
        if (sel.length>0) sel = sel[0]; else sel = "";  
        dropdown.setValue (TL(abbrev[sel]||sel));
        highlightProduct();
    }

    /* Function to return the color for a product */
    function getProductColor (prod) {
        if (productColor[prod] != undefined) return productColor [prod];
        for (i in productColor) {
            if (shortname[i] == prod) return productColor[i];
        }
        return "gray";
    }
    /* Configure the product callback */ 
    productMenu.set ("onClick", onProductClicked); 

    // How to use this interface externally?
    interface.selectedData = productMenu.selectedData; // Function to return the selected products
    interface.selectedColors = selectedColors; // Function to return the set of colors for the selected products
    interface.productColor = getProductColor; // Function to map product names to their color
    interface.select = selectProduct; // Function to select a product
    interface.active = productMenu.activeData; // Function to set / inquire the active products
    interface.onChange = function () {};  // Function that gets called when the selection changes

    // Return the interface object
    return interface;
  }

/* Function to set up a biofuel product selection interface */
idb.bioproduct.interface = function (dropdown) {

  var interface = {};
  
  var menuData = [[idb.bioproduct.all], ["-"], ["Firewood"],  ["Bagasse"], ["Charcoal"],
                  ["Other solid biofuels"], ["-"], ["Biogasoline"], ["Biodiesel"]];

  var productColor = {};
  productColor[idb.bioproduct.all] = d3.rgb(144,172,178);
  var abbrev = {};
  abbrev["Other solid biofuels"] = "Other solid";

  var labelSplit = {
      "Other solid biofuels" : "Other solid|biofuels",
  };

  var productMenu = lcg.megamenu()
     .parent(dropdown.menu)
     .id ("productMenu")
     .position(idb.bioproduct.position)
     .size (idb.bioproduct.size)
     .set ("showSample", true)
     .type("radio")                // Up to one selected entry is possible 
     .set ("direction", "v")           // Horizontal layout
     .set ("panelAlign", "mid")        // Align the panels (columns) by their centers
     .set ("panelSep", 17)             // Minimum separation between panels (columns)
     .set ("samplePos", "top")         // Put the icon above the legend
     .set ("iconPath", function (d,i) { // Map the data to the path geometries
        return d == idb.bioproduct.all ? iconpath["All Products"] : iconpath[d]; 
      })
     .set ("iconClass", function (d,i) {
        var r = d.replace(/ /g, "_");
        return r;
     })
     .set ("iconScale", idb.bioproduct.iconScale) // The path geometries have size 500 -> reduce by this amt
     .value (function (d) {             // Some energy names have to be split in two lines
        return labelSplit[d] ? TL(labelSplit[d]) : TL(d);
      })
     .category (function (d,i,j) {      // Map the panel number to the category 
        return d;
     })
     .color (function (d) {            // Map the category to a color
        if (productColor[d] === undefined) return null;
        return productColor[d]; 
      })
     .data (menuData);


    /* Special highlighting code so that when one product is selected all the remaining
       ones are set with a low opacity - couldn't find a way of doing it with css */
    function highlightProduct () {
        var sel = productMenu.selectedData();
        if (sel.length>0) sel = sel[0]; else sel = "";
        d3.selectAll ("#productMenu .entry")
          .style ("opacity", function (d,i) {
            if (d==sel || sel == idb.bioproduct.all) return 1;
            if (d == idb.bioproduct.all) return 0.5;
            return 0.2;
          });
    }

    /* Callback for clicking on a Product */
    function onProductClicked (d,i) {
        var sel = productMenu.selectedData();
        if (sel.length>0) sel = sel[0]; else sel = "";  
        dropdown.setValue (TL(abbrev[sel]||sel));
        highlightProduct ();
        interface.onChange();
    }

    /* Returns the colors of the selected Products */
    function selectedColors () {
        var ret = [];
        var sel = productMenu.selectedData();
        for (var i in sel) ret.push (productColor[sel[i]]);
        return ret;
    }

    /* Function to manually set a product */
    function selectProduct (d) {
        d = d.toUpperCase();
        productMenu.select (function (D,i) { return D.toUpperCase() == d; });
        var sel = productMenu.selectedData();
        if (sel.length>0) sel = sel[0]; else sel = "";  
        dropdown.setValue (TL(abbrev[sel]||sel));
        highlightProduct();
    }

    /* Function to return the color for a product */
    function getProductColor (prod) {
        if (productColor[prod] != undefined) return productColor [prod];
        for (i in productColor) {
            if (shortname[i] == prod) return productColor[i];
        }
        return "gray";
    }
    /* Configure the product callback */ 
    productMenu.set ("onClick", onProductClicked); 

    // How to use this interface externally?
    interface.selectedData = productMenu.selectedData; // Function to return the selected products
    interface.selectedColors = selectedColors; // Function to return the set of colors for the selected products
    interface.productColor = getProductColor; // Function to map product names to their color
    interface.select = selectProduct; // Function to select a product
    interface.active = productMenu.activeData; // Function to set / inquire the active products
    interface.onChange = function () {};  // Function that gets called when the selection changes

    // Return the interface object
    return interface;
  }




/* Function to set up energy spending products selection interface */
idb.incomeProducts.interface = function (dropdown) {

    var interface = {};

    var menuData = [[idb.incomeProducts.all], ["-"],  ["Transport fuels"], ["Gas"], ["Electricity"], ["Others"]];

    var productColor = {};
    productColor[idb.incomeProducts.all] = d3.rgb(144,172,178);
    productColor["Gas"] = d3.rgb(244,81,37);
    productColor["Others"] = d3.rgb(166,106,171);
    productColor["Transport fuels"] = d3.rgb(13,102,110);
    productColor["Electricity"] = productColor["Losses"] = d3.rgb(204,153,0);
    var abbrev = {};

    var iconReplace = {
      "Transport fuels" : "Oil Products",
    };
    iconReplace[idb.incomeProducts.all] = "All Products";

    var labelSplit = {
        "All Primary" : "All|Primary",
        "All Sources" : "All|Sources",
        "Transport fuels": "Transport|fuels"
    };

    var productMenu = lcg.megamenu()
       .parent(dropdown.menu)
       .id ("productMenu")
       .position(idb.product.position)
       .size (idb.product.size)
       .set ("showSample", true)
       .type("radio")                // Up to one selected entry is possible
       .set ("direction", "v")           // Horizontal layout
       .set ("panelAlign", "mid")        // Align the panels (columns) by their centers
       .set ("panelSep", 17)             // Minimum separation between panels (columns)
       .set ("samplePos", "top")         // Put the icon above the legend
       .set ("iconPath", function (d,i) { // Map the data to the path geometries
          d = iconReplace[d] || d;
          return iconpath[d];
        })
       .set ("iconScale", idb.product.iconScale) // The path geometries have size 500 -> reduce by this amt
       .value (function (d) {             // Some energy names have to be split in two lines
          return labelSplit[d] ? TL(labelSplit[d]) : TL(d);
        })
       .category (function (d,i,j) {      // Map the panel number to the category
          return d;
          return j + (j >= 8 ? -2 : (j >= 1 ? -1 : 0));   // (Panel 1 and 8 have just a separation line)
       })
       .color (function (d) {            // Map the category to a color
          return productColor[d];
        })
       .data (menuData);


      /* Special highlighting code so that when one product is selected all the remaining
         ones are set with a low opacity - couldn't find a way of doing it with css */
      function highlightProduct () {
          var sel = productMenu.selectedData();
          if (sel.length>0) sel = sel[0]; else sel = "";
          d3.selectAll ("#productMenu .entry")
            .style ("opacity", function (d,i) {
              if (d==sel || sel == idb.product.all) return 1;
              if (d == idb.product.all) return 0.5;
              return 0.2;
            });
      }

      /* Callback for clicking on a Product */
      function onProductClicked (d,i) {
          var sel = productMenu.selectedData();
          if (sel.length>0) sel = sel[0]; else sel = "";
          dropdown.setValue (TL(abbrev[sel]||sel));
          highlightProduct ();
          interface.onChange();
      }

      /* Returns the colors of the selected Products */
      function selectedColors () {
          var ret = [];
          var sel = productMenu.selectedData();
          for (var i in sel) ret.push (productColor[sel[i]]);
          return ret;
      }

      /* Function to manually set a product */
      function selectProduct (d) {
          d = d.toUpperCase();
          productMenu.select (function (D,i) { return D.toUpperCase() == d; });
          var sel = productMenu.selectedData();
          if (sel.length>0) sel = sel[0]; else sel = "";
          dropdown.setValue (TL(abbrev[sel]||sel));
          highlightProduct();
      }

      /* Function to return the color for a product */
      function getProductColor (prod) {
          if (productColor[prod] != undefined) return productColor [prod];
          for (i in productColor) {
              if (shortname[i] == prod) return productColor[i];
          }
          return "gray";
      }
      /* Configure the product callback */
      productMenu.set ("onClick", onProductClicked);

      // How to use this interface externally?
      interface.selectedData = productMenu.selectedData; // Function to return the selected products
      interface.selectedColors = selectedColors; // Function to return the set of colors for the selected products
      interface.productColor = getProductColor; // Function to map product names to their color
      interface.select = selectProduct; // Function to select a product
      interface.active = productMenu.activeData; // Function to set / inquire the active products
      interface.onChange = function () {};  // Function that gets called when the selection changes

      // Return the interface object
      return interface;
}

/* Function to set up a period selection interface */
idb.period.interface = function (dropdown) {

    var interface = {};

    // Data
    var year = [];
    for (var y = 1971; y <= idb.period.lastYear; y++) year.push (y);
    var average = [ "1971-1974", "1984-1987", "1999-2002", "2005-2008"];
    var avgGroup = []; 
    for (var iavg = 0; iavg < average.length; iavg++) {
      var avg = average[iavg];
      var a = parseInt (avg.substring(0,4)), b=parseInt(avg.substring(5,9));
      for (var iyear = 0; iyear < year.length; iyear++) {
        var y = year[iyear];
        if (y >= a && y <= b) avgGroup[iyear] = iavg;
      }
    } 

    // Function to format number with 2 digits
    var twoDigits = d3.format("02d");

    // Function to compute the label offset
    var labelOffset = function (d,i) {
        if (d % 10 == 0) return -20;
        return -10;
    };

    // A timeline for selecting years
    var yearMenu = lcg.timeline() 
        .parent(dropdown.menu) // Create timeline inside the menu
        .id ("yearMenu")   // id 
        .position(idb.period.timeline.position)   // Position of the timeline
        .size(idb.period.timeline.size)    // width and height of timeline
        .set ("direction", "h")      // horizontal timeline
        .set ("duration", 0)  // Instantaneous animations
        .set ("padding", 0)
        .set("getLabelOffset", labelOffset)  // Offset of labels w.r.t main line
        .set("selLabelOffset", -30) // Offset of selected labels w.r.t main line
        .set("drawArrows", false) // Don't draw arrows
        .set("thickness", 35)  // thickness
        .set("markOffset", 18) // Displace marks and labels down
        .set("summaryOffset", -40) // Displace the summary box up
        .set("ppu", 18)      // Pixels per unit of time 
        .set("fixedFocus", false)  // Selected time not always at the center of timeline
        .set("markPath", function (d,sel) { // Make decade marks taller
            if (sel) {
              return "M-2,0 v-35 h4 v35 z";
            } else if (d % 10 == 0) {
              return  "M0,0 v-20 h1 v20 z";
            } else {
              return "M0,0 v-10 h1 v10 z";
            }
        })
        .set("value", function (d) {  // Abbreviate non-decade years
          if (d % 10 == 0) return d; 
          return twoDigits (d%100);
        })
        .set("isMajor", function (d,i) { // Tells which years are styled differently with class "major"
          return d % 10 == 0;
        })
        .data(year);       // Allowed years

    // A timeline for selecting 4-year averages
    var averageMenu = lcg.timeline() 
        .parent(dropdown.menu) // Create timeline inside the menu
        .id ("averageMenu")   // id 
        .position(idb.period.timeline.position)   // Position of the timeline
        .size(idb.period.timeline.size)    // width and height of timeline
        .set("direction", "h")      // horizontal timeline
        .set ("duration", 0)  // Instantaneous animations
        .set("getLabelOffset", labelOffset)  // Offset of labels w.r.t main line
        .set("selLabelOffset", -30) // Offset of selected labels w.r.t main line
        .set("drawArrows", false) // Don't draw arrows
        .set("thickness", 35)  // thickness
        .set("markOffset", 17) // Displace marks and labels down
        .set("summaryOffset", -40) // Displace the summary box up
        .set("ppu", 18)      // Pixels per unit of time 
        .set("fixedFocus", false)  // Selected time not always at the center of timeline
        .set("markPath", function (d,sel) { // Make decade marks taller
            if (sel) {
              if (d == 1971 || d == 1984 || d == 1999 || d == 2005)
                return "M0,0 v-35 h"+(18*3+1)+"v35 z";
              return "M0,0";
            } else if (d % 10 == 0) {
              return  "M0,0 v-20 h1 v20 z";
            } else {
              return "M0,0 v-10 h1 v10 z";
            }
        })
        .set("value", function (d) {  // Abbreviate non-decade years
          if (d % 10 == 0) return d; 
          return twoDigits (d%100);
        })
        .set("isMajor", function (d,i) { // Tells which years are styled differently with class "major"
          return d % 10 == 0;
        })
        .set ("grouping", function (d,i) {
          return avgGroup[i];
        })
        .set("isActive", function (d,i) { // Test: make some years inactive
          return avgGroup[i] != undefined;
        })
        .data(year);       // Allowed years

    /* A menu for selecting only one of the two timelines */
    var periodTypeMenu = lcg.menu() 
        .parent (dropdown.menu)
        .id ("periodTypeMenu")
        .type("radio")    
        .position (idb.period.periodType.position)
        .size (idb.period.periodType.size)
        .set("direction", "h")     
        .set("rSize", 10)       // Size of the sample
        .set("rRound", 5)       // A circle
        .set("labelOffset", 0)  // Vertical displacement between the sample and the entry label
        .set("entrySep", 50)    // Separation between menu entries 
        .data ([TL("Years"), TL("Averages")])
        .select ([0]);          // Select years by default

    if (! idb.period.periodType.active) {
      d3.select("#periodTypeMenu").attr ({display: "none"});
    }
    /* Play menu */
    var playMenu = lcg.megamenu() 
        .parent (dropdown.menu)
        .id ("playMenu")
        .type ("check")
        .margin([0,0,0,0])
        .position (idb.period.play.position)
        .size (idb.period.play.size)
        .set ("iconPath", function () { 
                return iconpath["Play"]; 
        })
        .set ("color", function () { return undefined; })
        .set ("iconScale", idb.period.play.iconScale)
        .set ("showSample", true)
        .data ([[""]]);

    /* callback for the year menu */
    function onYearClicked(d,i) {
        var sel = yearMenu.selectedData();
        if (sel.length>0) sel = sel[0]; else sel = "";
        dropdown.setValue (sel);
        interface.onChange ();
    }

    /* callback for the average menu */
    function onAverageClicked(d,i) {
        var sel = averageMenu._summaryLabel();
        dropdown.setValue (sel);
        interface.onChange ();
    }

    /* callback for the period type menu */
    var periodType = 0; // Which timeline is being shown (year = 0, average = 1)
    function onPeriodTypeClicked (d,i) {
        if (i != periodType) cancelAutoPlay();
        periodType = i;
        yearMenu._group.attr ("visibility", i == 0 ? "inherit" : "hidden");
        averageMenu._group.attr ("visibility", i == 1 ? "inherit" : "hidden");
        if (i == 0) {
            onYearClicked();
        }
        else {
            onAverageClicked();
        }
    }
  
    /* Manually select a period (year or average) */
    function selectPeriod (d) {
        var isAverage = (""+d).length > 4;
        if (isAverage) {
            var i = year.indexOf(parseInt(d));
            averageMenu.select([i]);  // Selects the period
            onPeriodTypeClicked("", 1);
            onAverageClicked(d,i);
        } else {
            var i = year.indexOf(parseInt(d+""));
            yearMenu.select ([i]); 
            onPeriodTypeClicked("", 0);
            onYearClicked(d,i);
        }
    }

    /* Returns the selected period of the current timeline */
    function selectedPeriod () {
        if (periodType == 0) {
          return yearMenu.selectedData ();
        }
        else {
          return [averageMenu._summaryLabel()];
        }
    }

    // set or inquire for the active periods
    function activePeriods (d) {
      if (d == undefined) { // return the active periods
        var ret = yearMenu._getActive();
        var activeAverageYears = averageMenu._getActive();
        for (var i = 0; i < average.length; i++) {
          var avg = average[i];
          if (activeAverageYears.indexOf (parseInt(avg)) >= 0) ret.push (avg);
        }
        return ret;
      } 
      else { // set the active periods
        yearMenu._isActive = function (D) { return d.indexOf(""+D) >= 0; };
        yearMenu._setActive ();
        var activeAverageYears = [];
        for (var i = 0; i < d.length; i++) {
          var j = average.indexOf(d[i]);
          if (j >= 0) {
            var avg = average[j];
            var a = parseInt (avg.substring(0,4)), b=parseInt(avg.substring(5,9));
            for (var y = a; y <= b; y++) {
              activeAverageYears.push (y);
            }
          }
        }
        averageMenu._isActive = function (D) { return activeAverageYears.indexOf (D) >= 0 };
        averageMenu._setActive();
      }
    }

    /*
     * playMenu stuff
     */
    var autoPlay = 0; // The variable that holds the id for the autoplay function

    // Stops autoPlay
    function cancelAutoPlay () {
        clearInterval (autoPlay);
        playMenu.select ([]);
        d3.select ("#playMenu .sample path").attr ("d", iconpath["Play"]);
    }

    // Callback for the playmenu
    function onPlayClicked () {
        var timeline = (periodType == 0) ? yearMenu : averageMenu;
        
        if (playMenu.selectedData().length != 0) {
          // Play 
          d3.select ("#playMenu .sample path").attr ("d", iconpath["Stop"]);
          autoPlay = setInterval (function () {
              var next = timeline._nextValue();
              if (next != undefined) {
                timeline.select([year.indexOf(next)]);
                if (periodType == 0) onYearClicked ();
                else onAverageClicked();
              }
              else cancelAutoPlay();
          }, 1000);
        }
        else cancelAutoPlay();
    }

    /* Configure callbacks for yearMenu, averageMenu, periodTypeMenu and playMenu */
    yearMenu.set ("onClick", onYearClicked); 
    averageMenu.set ("onClick", onAverageClicked); 
    periodTypeMenu.set ("onClick", onPeriodTypeClicked);
    playMenu.set ("onClick", onPlayClicked);



    // How to use this interface externally?
    interface.selectedData = selectedPeriod; // Function to return the selected period
    interface.select = selectPeriod; // Function to select a period
    interface.active = activePeriods; // Function to set / inquire the active periods
    interface.onChange = function () {};  // Function that gets called when the selection changes

    selectPeriod ("2005-2008"); 
    selectPeriod (2010);

    // Return the interface object
    return interface;
}

// Function to set up a country (institutional) selection interface
idb.countryInstitutional.interface = function (dropdown) {

  var interface = {};

  var menuData =  [ 
        [ "Costa Rica", "Dominican Republic"], 
        [ "El Salvador", "Guatemala"], 
        [ "Honduras", "Mexico"], 
        ["Nicaragua",  "Panama"]
   ];
    
    var labelShorten = {
        "Dominican Republic" : "Dominican Rep.",
        "Trinidad & Tobago" : "Trinidad & T."
    };

    var countryMenu = lcg.megamenu()
         .parent(dropdown.menu)
         .id ("countryMenu")
         .position(idb.countryInstitutional.position)
         .size (idb.country.size)
         .set ("showSample", false) // No icons or samples before the text
         .type(idb.countryInstitutional.multiSel ? "check" : "radio")  // Select many or only one
         .set ("checkLimit", idb.countryInstitutional.multiSelLimit)   // No of countries selected at a time
         .manageColors (idb.countryInstitutional.manageColors)     // enables submenus to change the colors of the entries
         .set ("direction", "v") // Vertical layout
         .set ("align", "min")       // Left align the entries
         .set ("panelAlign", "dist")  // Center the columns
         .set ("panelSep", 2)     // Separation between columns
         .set ("entrySep", 4)      // Separation between entries
         .set ("entryBackdropPad", [3,3,16,2]) // How much to enlarge the entry backdrop rectangles [left,top,right,bottom])
         .set ("equalSizedPanels", true)
         .value (function (d) {             // Some country names have to be shortened
                return labelShorten[d] ? TL(labelShorten[d]) : TL(d);
              })
         .set ("isTitle", function (d,i) { 
            return false;})
         .data (menuData);

    /* Callback for clicking on a country */
    function onCountryClicked () {
      var sel = countryMenu.selectedData();
      if (idb.country.multiSel) {
        /* Get abbreviations for selected countries */
        var abbrev = [];
        for (var i = 0; i < sel.length; i++) {
          abbrev.push(twoLetter[sel[i]]);
        }
        dropdown.setValue(abbrev.join());   
      }
      else {
        var d = sel.join();
        dropdown.setValue(labelShorten[d] ? TL(labelShorten[d]) : TL(d));
      }
      interface.onChange();
    }

    /* Function to manually set a set of countries */
    function selectCountry (d) {
        countryMenu.select (function (D,i) { return d.indexOf(D) >= 0; });
        onCountryClicked();
    }

    /* Configure the callback for countryMenu */
    countryMenu.set ("onClick", onCountryClicked); 

    // How to use this interface externally?
    interface.selectedColors = countryMenu.selectedColors; // Function to return the set of colors
    interface.selectedData = countryMenu.selectedData; // Function to return the selected countries
    interface.select = selectCountry; // Function to select a list of countries
    interface.active = countryMenu.activeData; // Function to set / inquire the active countries
    interface.onChange = function () {};  // Function that gets called when the selection changes

    // Return the interface object
    return interface;
}

// Function to set up a country (institutional) selection interface
idb.countryInstitutionalWithThreeLetters.interface = function (dropdown) {

  var interface = {};

  var menuData =  [ 
        /* Members */
        [ "ALL" ], [ "-" ],
        [ "ARG - Argentina", "BLZ - Belize", "BOL - Bolivia", "BRA - Brazil", "CHI - Chile", "COL - Colombia"], 
        [ "CRI - Costa Rica", "DOM - Dominican Republic", "ECU - Ecuador", "SLV - El Salvador",  "GTM - Guatemala", "GUY - Guyana" ], 
        [ "HTI - Haiti", "HND - Honduras", "JAM - Jamaica", "MEX - Mexico", "NIC - Nicaragua",  "PAN - Panama"], 
        [ "PRY - Paraguay", "PER - Peru", "SUR - Suriname", "TTO - Trinidad & Tobago", "URU - Uruguay", "VEN - Venezuela"]
    ];

    var labelShorten = {
        "DOM - Dominican Republic" : "DOM - Dominican Rep."
    };

    var countryMenu = lcg.megamenu()
         .parent(dropdown.menu)
         .id ("countryMenu")
         .position(idb.countryInstitutionalWithThreeLetters.position)
         .size (idb.countryInstitutionalWithThreeLetters.size)
         .set ("showSample", false) // No icons or samples before the text
         .type(idb.countryInstitutionalWithThreeLetters.multiSel ? "check" : "radio")  // Select many or only one
         .set ("checkLimit", idb.countryInstitutionalWithThreeLetters.multiSelLimit)   // No of countries selected at a time
         .manageColors (idb.countryInstitutionalWithThreeLetters.manageColors)     // enables submenus to change the colors of the entries
         .set ("direction", "v") // Vertical layout
         .set ("align", "min")       // Left align the entries
         .set ("panelAlign", "dist")  // Center the columns
         .set ("panelSep", 2)     // Separation between columns
         .set ("entrySep", 4)      // Separation between entries
         .set ("entryBackdropPad", [3,3,16,2]) // How much to enlarge the entry backdrop rectangles [left,top,right,bottom])
         .set ("equalSizedPanels", true)
         .value (function (d) {             // Some country names have to be shortened
                return labelShorten[d] ? TL(labelShorten[d]) : TL(d);
              })
         .set ("isTitle", function (d,i) { 
            return false;})
         .data (menuData);

    /* Callback for clicking on a country */
    function onCountryClicked () {
      var sel = countryMenu.selectedData();
      if (idb.country.multiSel) {
        /* Get abbreviations for selected countries */
        var abbrev = [];
        for (var i = 0; i < sel.length; i++) {
          abbrev.push(twoLetter[sel[i]]);
        }
        dropdown.setValue(abbrev.join());   
      }
      else {
        var d = sel.join();
        dropdown.setValue(labelShorten[d] ? TL(labelShorten[d]) : TL(d));
      }
      interface.onChange();
    }

    /* Function to manually set a set of countries */
    function selectCountry (d) {
        countryMenu.select (function (D,i) { return d.indexOf(D) >= 0; });
        onCountryClicked();
    }

    /* Configure the callback for countryMenu */
    countryMenu.set ("onClick", onCountryClicked); 

    // How to use this interface externally?
    interface.selectedColors = countryMenu.selectedColors; // Function to return the set of colors
    interface.selectedData = countryMenu.selectedData; // Function to return the selected countries
    interface.select = selectCountry; // Function to select a list of countries
    interface.active = countryMenu.activeData; // Function to set / inquire the active countries
    interface.onChange = function () {};  // Function that gets called when the selection changes

    // Return the interface object
    return interface;
}

/* Function to set up a instututional product selection interface */
idb.institutionalSector.interface = function (dropdown) {

  var interface = {};
  
  var menuData = [["Hydrocarbon"], ["Electricity"]]; 

  var sectorColor = {};
  sectorColor["Hydrocarbon"] = d3.rgb(63,96,122); 
  sectorColor["Electricity"] = d3.rgb(175,157,51);

  var abbrev = {};
  abbrev["Hydrocarbon"] = "Hydrocarbon"; 
  abbrev["Electricity"] = "Electricity"; 

  var labelSplit = {
  };

  var sectorMenu = lcg.megamenu()
     .parent(dropdown.menu)
     .id ("sectorMenu")
     .position(idb.institutionalSector.position)
     .size (idb.institutionalSector.size)
     .set ("showSample", true)
     .type("radio")                // Up to one selected entry is possible 
     .set ("direction", "v")           // Horizontal layout
     .set ("panelAlign", "mid")        // Align the panels (columns) by their centers
     .set ("panelSep", 20)             // Minimum separation between panels (columns)
     .set ("samplePos", "top")         // Put the icon above the legend
     .set ("iconPath", function (d,i) { // Map the data to the path geometries
        return iconpath[d]; 
      })
     .set ("iconScale", idb.institutionalSector.iconScale) // The path geometries have size 500 -> reduce by this amt
     .value (function (d) {             // Some energy names have to be split in two lines
        return labelSplit[d] ? TL(labelSplit[d]) : TL(d);
      })
     .category (function (d,i,j) {      // Map the panel number to the category 
        return d;
     })
     .color (function (d) {            // Map the category to a color
        return sectorColor[d]; 
      })
     .data (menuData);

    /* Callback for clicking on a Sector */
    function onSectorClicked (d,i) {
        var sel = sectorMenu.selectedData();
        if (sel.length>0) sel = sel[0]; else sel = "";  
        dropdown.setValue (TL(abbrev[sel]||sel));
        interface.onChange();
    }

    /* Returns the colors of the selected sectors */
    function selectedColors () {
        var ret = [];
        var sel = sectorMenu.selectedData();
        for (var i in sel) ret.push (sectorColor[sel[i]]);
        return ret;
    }

    /* Function to manually set a sector */
    function selectSector (d) {
        d = d.toUpperCase();
        sectorMenu.select (function (D,i) { return D.toUpperCase() == d; });
        onSectorClicked (d);
    }

    /* Function to return the color for a sector */
    function getSectorColor (sector) {
        if (sectorColor[sector] != undefined) return productColor [sector];
        for (i in sectorColor) {
            if (shortname[i] == sector) return sectorColor[i];
        }
        return "gray";
    }
    /* Configure the product callback */ 
    sectorMenu.set ("onClick", onSectorClicked); 

    // How to use this interface externally?
    interface.selectedData = sectorMenu.selectedData; // Function to return the selected products
    interface.selectedColors = selectedColors; // Function to return the set of colors for the selected products
    interface.productColor = getSectorColor; // Function to map product names to their color
    interface.select = selectSector; // Function to select a product
    interface.active = sectorMenu.activeData; // Function to set / inquire the active products
    interface.onChange = function () {};  // Function that gets called when the selection changes

    // Return the interface object
    return interface;
}

/* Function to set up a year selection interface */
idb.yearInstitutional.interface = function (dropdown) {

    var interface = {};

    // Data
    var year = [];
    for (var y = 2000; y < 2021; y++) year.push (y);

    // Function to format number with 2 digits
    var twoDigits = d3.format("02d");

    // Function to compute the label offset
    var labelOffset = function (d,i) {
        if (d % 10 == 0) return -20;
        return -10;
    };

    // A timeline for selecting years
    var yearMenu = lcg.timeline() 
        .parent(dropdown.menu) // Create timeline inside the menu
        .id ("yearMenu")   // id 
        .position(idb.yearInstitutional.timeline.position)   // Position of the timeline
        .size(idb.yearInstitutional.timeline.size)    // width and height of timeline
        .set ("direction", "h")      // horizontal timeline
        .set ("duration", 0)  // Instantaneous animations
        .set ("padding", 0)
        .set("getLabelOffset", labelOffset)  // Offset of labels w.r.t main line
        .set("selLabelOffset", -30) // Offset of selected labels w.r.t main line
        .set("drawArrows", false) // Don't draw arrows
        .set("thickness", 35)  // thickness
        .set("markOffset", 18) // Displace marks and labels down
        .set("summaryOffset", -40) // Displace the summary box up
        .set("ppu", 18)      // Pixels per unit of time 
        .set("fixedFocus", false)  // Selected time not always at the center of timeline
        .set("markPath", function (d,sel) { // Make decade marks taller
            if (sel) {
              return "M-2,0 v-35 h4 v35 z";
            } else if (d % 10 == 0) {
              return  "M0,0 v-20 h1 v20 z";
            } else {
              return "M0,0 v-10 h1 v10 z";
            }
        })
        .set("value", function (d) {  // Abbreviate non-decade years
          if (d % 10 == 0) return d; 
          return twoDigits (d%100);
        })
        .set("isMajor", function (d,i) { // Tells which years are styled differently with class "major"
          return d % 10 == 0;
        })
        .data(year);       // Allowed years

    /* callback for the year menu */
    function onYearClicked(d,i) {
        var sel = yearMenu.selectedData();
        if (sel.length>0) sel = sel[0]; else sel = "";
        dropdown.setValue (sel);
        interface.onChange ();
    }

    /* Manually select a period (year or average) */
    function selectPeriod (d) {
        var i = year.indexOf(parseInt(d+""));
        yearMenu.select ([i]); 
        onYearClicked(d,i);
    }

    /* Returns the selected period of the current timeline */
    function selectedPeriod () {
        return yearMenu.selectedData ();
    }

    // set or inquire for the active periods
    function activePeriods (d) {
      if (d == undefined) { // return the active periods
        var ret = yearMenu._getActive();
        return ret;
      } 
      else { // set the active periods
        yearMenu._isActive = function (D) { return d.indexOf(D) >= 0; };
        yearMenu._setActive ();
      }
    }

    /* Configure callbacks for yearMenu */
    yearMenu.set ("onClick", onYearClicked); 

    // How to use this interface externally?
    interface.selectedData = selectedPeriod; // Function to return the selected period
    interface.select = selectPeriod; // Function to select a period
    interface.active = activePeriods; // Function to set / inquire the active periods
    interface.onChange = function () {};  // Function that gets called when the selection changes
    
    selectPeriod(2010);
    // Return the interface object
    return interface;
}
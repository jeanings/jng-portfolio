// Smooth jump-scrolling
document.querySelectorAll("a[href^='#']").forEach(anchor => {
  anchor.addEventListener("click", function(event) {
    event.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth"
    });
  });
});

// Navbar hide on homepage plus change greeting text
(function hideMenu() {
    const currentPath = window.location.pathname;
    const menuItems = document.getElementById("menu");
    const greeting = document.getElementById("greeting");

    if (greeting) { 
      if (currentPath == "/") {
        document.getElementById("navbar").style.display = 'none';
      } else if (currentPath == "/gallery") {
        greeting.textContent = "Gallery";
        menuItems.childNodes[5].style.display = "none";
      } else if (currentPath == "/projects") {
        greeting.textContent = "Projects";
        menuItems.childNodes[7].style.display = "none";
      } else if (currentPath == "/projects/tokaido_urban_hike") {
        greeting.textContent = "Urban Hiking the 東海道";
      } else {
        greeting.textContent = "Page not found!";
      }
    }
  })();
  
  
  
  
  // Button toggles
  (function menuSlide() {
    const menuBtn = document.getElementById("menu-buttons");
    const menuSlider = document.getElementById("menu");
    const menuBtnOpen = document.getElementById("menu-open");
    const menuBtnClose = document.getElementById("menu-close");
    var isMouseDown = false;
    
    // Pulls out menu list on click, closes on click
    menuBtn.addEventListener("click", function() {
      this.focus();
      menuSlider.classList.toggle("slide-toggle");
      menuBtnOpen.classList.toggle("toggle");
      menuBtnClose.classList.toggle("toggle");
      menuSlider.focus();
    });
  
    menuSlider.addEventListener("mousedown", function() {
      isMouseDown = true;
    });
  
    menuSlider.addEventListener("mouseup", function() {
      isMouseDown = false;
    });
  
    menuSlider.addEventListener("mouseleave", function() {
      isMouseDown = false;
    });
  
    menuSlider.addEventListener("blur", function() {
      if (!isMouseDown) {
        menuSlider.classList.remove("slide-left-toggle");
      }
    }, true);    
  })();
  
const houseTileID = "jeanings.cgqch9hv";
const houseSourceLayer = "house_2010-2020-6hlx4i";
const houseSourceName = "houseSource";
const condoTileID = "jeanings.5dotqp2o";
const condoSourceLayer = "condo_2010-2020-5liinx";
const condoSourceName = "condoSource";
const fillTileID = "jeanings.c2jpilpa";
const fillSourceLayer = "japan_city_level-a98ipj";
const fillSourceName = "fillSource";
const vhDefault = window.innerHeight * 0.01;
var mapStartCenter = [137.652, 35.534];
var mapStyle = "mapbox://styles/jeanings/ckh198o7k0bqr19oaymmsjs50";
var screenMode, tooltipToggle, textBubble;
var footage, age, station, mtrl;
var properties;
var sourceLayer, sourceName;
var parameters;
var activeLayer = null;
var houseKeys, condoKeys, mergedKeys;
var hoveredLayerID = null;
var radioSelection = {
  "type": "",
  "footage": "",
  "age": "",
  "station": "",
  "mtrl": ""
};
var selectableRadios = {};
var radioSelected = 0;


/*------------------------------------
  Viewport sizing for mobile browsers.
------------------------------------*/
function adjustMobileHeight() {
  let vhNew = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vhp", `${vhNew}px`);
}

window.addEventListener("load", adjustMobileHeight);
window.addEventListener("resize", () => {
  let vhNew = window.innerHeight * 0.01;
  let vh_difference = vhNew - vhDefault;

  // Set new custom viewport size if resize is substantial enough.
  if (vh_difference > vhDefault * 0.15) {
    adjustMobileHeight;
  }
});


var map = new mapboxgl.Map({
  /*---------------------
    Initial map settings.
  ---------------------*/
  container: "map",
  style: mapStyle,
  interactive: true,
  scrollZoom: true,
  logoPosition: "bottom-right",
  center: mapStartCenter,
  bearing: 0,
  pitch: 55,
  zoom: 8,
  minZoom: 6.5,
  maxZoom: 12
});
  
var nav = new mapboxgl.NavigationControl({
  /*-------------------------
    Side navigation controls.
  -------------------------*/
  showCompass: true,
  showZoom: true,
});

var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  limit: 4,
  mapboxgl: mapboxgl,
  flyTo: {
    maxZoom: 11, // If you want your result not to go further than a specific zoom
  }
});



function getOrientation() {
  /*-----------------------
    Get screen orientation.
  -----------------------*/
  var orientation = window.innerWidth > window.innerHeight ? "landscape" : "portrait";
  return orientation;
}

window.onresize = function() {
  screenMode = getOrientation();
}



map.on("load", function() {
  /*-------------------------
    Do stuff on load.
  --------------------------*/
  var geocoderPlaceholder = document.getElementsByClassName("mapboxgl-ctrl-geocoder--input")[0];
  geocoderPlaceholder.attributes.placeholder.textContent = "検索";
  var radioOptions = document.getElementById("filter-form");
  
  // Get orientation.
  screenMode = getOrientation();
  if (screenMode === "landscape") {
    tooltipToggle = "showHorizontal";
  } else if (screenMode === "portrait") {
    tooltipToggle = "showVertical";
  }

  map.moveLayer("ward-boundary", "road-rail");
  addSource(houseSourceName, houseTileID);
  addSource(condoSourceName, condoTileID);
  addSource(fillSourceName, fillTileID);

  // Layer for city-hover highlighting.
  map.addLayer(
    {
      "id": "city-fills",
      "type": "fill",
      "source": fillSourceName,
      "source-layer": fillSourceLayer,
      "layout": {},
      "paint": {
        "fill-color": "#ffffff",
        "fill-opacity": 0
      }
    },
    "ward-boundary"
  );

  setTimeout(function() {
    houseKeys = getKeys(houseSourceName);
    condoKeys = getKeys(condoSourceName);
    mergedKeys = houseKeys.concat(condoKeys)
  }, 1000);
  
  // Setup radio options "light switch".
  for (let i = 0, options = radioOptions.length; i < options; i++) {
    if (radioOptions[i].name != "type") {
      // Create all keys.
      if (radioOptions[i].type === "radio") {
        selectableRadios[radioOptions[i].id] = "";
      }
    }
  }
});
map.addControl(geocoder, "bottom-right");
// map.addControl(nav, "top-left");



function addSource(sourceName, tileID) {
  /*----------------------
    Add tileset as source.
  ----------------------*/
  // Add source only if doesn't exist.
  if (typeof map.getSource(sourceName) != "undefined") {
    return;
  } else {
    map.addSource(sourceName, {
      type: "vector",
      url: "https://api.mapbox.com/v4/" + tileID + ".json?access_token=" + mapboxgl.accessToken
    });
  }
}



function getKeys(sourceName) {
  /*-------------------------------
    Builds array of keys in source.
  -------------------------------*/
  let toExclude = [
    "N03_001", "N03_002", "N03_003", "N03_004", "N03_007", "geo_region", "prefecture",
    "_color", "_fillColor", "_fillOpacity", "_opacity", "_weight", "city", "city_code"
  ];

  if (map.isSourceLoaded(sourceName) == true) {
    var keysList = Object.keys(map.getSource(sourceName).vectorLayers[0].fields);
    // Remove all non-layer keys.
    keysList = keysList.filter(keys => !toExclude.includes(keys));
    return keysList;
  } else {
    console.log("Can't get tileset property keys, source not loaded:", sourceName);
  }
}



function checkParameters(homeType, parameters) {
  /*--------------------------------
    Clear previous layer, if exists.
  --------------------------------*/
  if (homeType == "detached") {
    if (houseKeys.includes(parameters)) {
      return true;
    } else {
      return false;
    }
  } else if (homeType == "condo") {
    if (condoKeys.includes(parameters)) {
      return true;
    } else {
      return false;
    }
  }
}



document.getElementById("filter-form").onsubmit = function() {
  /*--------------------------------------------
    Get selection from user and parse paramters.
  --------------------------------------------*/
  // let submitAlertText = document.getElementById("submit-tooltip-text");
  // let submitAlertBubble = document.getElementById("speech-box");
  let priceGauge = document.getElementById("price-gauge");
  let geocoder = document.getElementsByClassName("mapboxgl-ctrl-geocoder")[0];
  let radios = document.getElementById("filter-form");
  let searchGlass = document.getElementsByClassName("fas fa-search")[0];
  let parametersExists;
  let checked = checkRadios();
  let filterMenu = document.getElementById("filter-menu");
  let filterOptions = document.getElementsByClassName("filter-options-container");
  let menuSwitch = document.getElementById("collapse");
  let homeIcons = document.getElementById("home-types");
  let searchStats = document.getElementById("search-stats");
  // submitAlertBubble.left = "0rem";


  // Accept if all 5 options are checked, otherwise show reject message.
  if (checked.length == 5) {
    homeType = checked[0].id;
    footage = checked[1].id;
    age = checked[2].id;
    station = checked[3].id;
    mtrl = checked[4].id;

    if (homeType == "detached") {
      sourceLayer = houseSourceLayer;
      sourceName = houseSourceName;
    } else if (homeType == "condo") {
      sourceLayer = condoSourceLayer;
      sourceName = condoSourceName;
    }

    parameters = mtrl + "-" + station + "-" + footage + "-" + age;
    parametersExists = checkParameters(homeType, parameters);
    activeLayer = parameters;

    if (parametersExists == true) {
      // Draw data layer if parameters exists.
      clearLayer();
      drawOnMap(sourceLayer, sourceName, parameters);

      // On portrait screens, collapse menu after valid submission.
      if (getOrientation() === "portrait") {
        filterMenu.classList.remove("open");
        filterMenu.classList.add("close");
        homeIcons.classList.toggle("hide");
        menuSwitch.classList.toggle("close");
        filterOptions[0].classList.toggle("close");
        priceGauge.classList.toggle("slide");
        searchStats.classList.toggle("show");
      }
      
      // Reveal UI elements after valid submission.
      priceGauge.classList.add("show");
      slideFadeIn(".colour-bar-cell");
      slideFadeIn(".info-text");
      fillSearchStats(checked);
      geocoder.classList.add("show");
    }
    //  else if (parametersExists == false) {
    //   // Alert user about insufficient data, so re-try with others.
    //   submitAlertText.textContent = "ごめんなさい！ \
    //     入力した条件に対する データが不足ため、表示できません。";
    //   submitAlertText.classList.add("show");
    //   setTimeout(function() {
    //     submitAlertText.classList.remove("show");
    //   }, 10000);
    // }
  }

  // Reset form.
  Object.values(radios).forEach(radio => {
    if (radio.type === "radio") {
      radio.checked = false;
      if (radio.name != "type") {
        radio.nextElementSibling.style.opacity = 1;
      } 
    }
  });
  searchGlass.classList.remove("show");

  // Reset previously-saved radio selections.
  radioSelection = {
    "type": "",
    "footage": "",
    "age": "",
    "station": "",
    "mtrl": ""
  }

  // Keep site from reloading.
  return false;
}



function checkRadios() {
  /*---------------------------------
    Check number of options selected.
  ---------------------------------*/
  let radios = document.getElementById("filter-form");
  let checked = [];

  for (let i = 0, choices = radios.length; i < choices; i++) {
    if (radios[i].checked == true) {
      checked.push(radios[i]);
    }
  }
  return checked;
}



function slideFadeIn(elements) {
  /*-----------------------
    Slide-fade in elements.
  -----------------------*/
  var duration = 200;
  var delay = 50;

  document.querySelectorAll(elements).forEach(function(element) {
    element.style["animation-duration"] = duration + "ms";
    element.style["animation-delay"] = delay + "ms";
    element.classList.add("slide");
    delay = delay + 75;
  });
}



function fillSearchStats(checked) {
  /*----------------------------------------
    Populates info for map spread stats bar.
  ----------------------------------------*/
  var homeType = checked[0].id;
  var footage = checked[1].parentElement.children[1].innerText;
  var age = checked[2].parentElement.children[1].innerText;
  var station = checked[3].parentElement.children[1].innerText;
  var mtrl = checked[4].parentElement.children[1].innerText;
  var stats = [
    String(footage) + "平米", 
    String(age) + "年", 
    String(station) + "分", 
    String(mtrl)
  ];
  var categories = ["param-footage", "param-age", "param-station", "param-mtrl"];

  if (homeType == "detached") {
    document.getElementById("stats-home").innerText = "🏡";
  } else if (homeType == "condo") {
    document.getElementById("stats-home").innerText = "🏢";
  }

  for (let i = 0, elems = categories.length; i < elems; i++) {
    document.getElementById(categories[i]).innerText = stats[i];
  }
}



function clearLayer() {
  /*--------------------------------
    Clear previous layer, if exists.
  --------------------------------*/
  var sources = [houseSourceName, condoSourceName];
  var toRemove = []

  // Compile list of layers to remove.
  for (let i = 0, items = map.getStyle().layers.length; i < items; i++) {
    var layer = map.getStyle().layers[i];
    if (sources.includes(layer.source)) {
      toRemove.push(layer.id);
    }
  }
  // Remove layers.
  for (let j = 0, targets = toRemove.length; j < targets; j++) {
    map.removeLayer(toRemove[j]);
  }
}



function drawOnMap(sourceLayer, sourceName, parameters) {
  /*-----------------------------------------------------------
    Draw requested data on map, assuming source has been added.
  -----------------------------------------------------------*/
  map.addLayer(
    {
      "id": parameters,
      "source": sourceName,
      "source-layer": sourceLayer,
      "type": "fill",
      "minzoom": 5,
      "filter": [
        "all",
        ["has", parameters]
      ],
      "paint": {
        "fill-color": [
          "interpolate",
          ["linear"],
          ["get", parameters],
          500, "#077bc4",
          750, "#3091a9",
          1000, "#4ba097",
          1250, "#5ca98c",
          1500, "#68af84",
          2000, "#81bd74",
          2500, "#9ecd61",
          3000, "#b2d854",
          3500, "#cae544",
          4000, "#e7f531",
          5000, "#faff24",
          6000, "#fcbd4d",
          7000, "#fca55c",
          8000, "#fd9368",
          9000, "#fd8073",
          10000, "#fd5f87",
          15000, "#fe4797",
          20000, "#fe2ea6",
          40000, "#ff17b4",
          80000, "#ff00c2"
        ],
        // "fill-color-transition": {
        //   "duration": 1500,
        //   "delay": 500
        // },
        "fill-opacity": [
          "case",
          ["boolean",
            ["feature-state", "hover"], false], 1.0,
          0.65  // base state
        ]
        // "fill-opacity-transition": {
        //   "duration": 1500
        // }
      }
    },
    "road-rail"
  );
}



map.on("click", function(event) {
  /*------------------------------------------------
    Get info on clicked region and display on screen.
  -------------------------------------------------*/
  // Only listen to clicks if source/layer has been loaded.
  if ((typeof sourceName != "undefined") && 
      (map.isSourceLoaded(sourceName) == true)) {

    var features = map.queryRenderedFeatures(
      event.point, 
      {layers: [activeLayer]}
    );

    if (features.length > 0) {
      region = features[0].properties.geo_region;
      prefecture = features[0].properties.prefecture;
      city = features[0].properties.city;
      average_price = features[0].properties[parameters];

      var dashRegion = document.getElementById("dash-data-region");
      var dashPrefecture = document.getElementById("dash-data-prefecture");
      var dashCity = document.getElementById("dash-data-city");
      var dashPrice = document.getElementById("dash-data-price");
      
      dashRegion.textContent = region;
      dashPrefecture.textContent = prefecture;
      dashCity.textContent = city;
      if (average_price < 9999) {
        dashPrice.textContent = average_price + "万円";
      } else if (average_price >= 10000) {
        dashPrice.textContent = (average_price/10000).toFixed(2) + "億円";
      }
    }
  }
});



// Initiate popup for function below.
var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

map.on("mousemove", "city-fills", function(event) {
  /*-------------------------------------------------------------
    When user hovers over a city polygon, "highlight" the polygon.
  --------------------------------------------------------------*/
  if (event.features.length > 0) {
    cityUnderCursor = event.features[0].properties.N03_007;
    map.getCanvas().style.cursor = "crosshair";
   
    map.setPaintProperty(
      "city-fills",
      "fill-opacity", 
      [
        "match",
        ["get", "N03_007"],
        cityUnderCursor, 1,
        0
      ]
    );

    // Only listen to clicks if source/layer has been loaded.
    if ((typeof sourceName != "undefined") && 
        (map.isSourceLoaded(sourceName) == true)) {
      
      var queriedFeatures = map.queryRenderedFeatures(
        event.point, 
        {layers: [activeLayer]}
      );

      // Create popup over coloured tiles, and remove popup over dark tiles.
      if (queriedFeatures.length > 0) {
        region = queriedFeatures[0].properties.geo_region;
        prefecture = queriedFeatures[0].properties.prefecture;
        city = queriedFeatures[0].properties.city;
        average_price = queriedFeatures[0].properties[parameters];

        if (average_price < 9999) {
          average_price = average_price + "万円";
        } else if (average_price >= 10000) {
          average_price = (average_price/10000).toFixed(2) + "億円";
        }

        map.getCanvas().style.cursor = "pointer";
        popup.setLngLat(event.lngLat)
          .setHTML(
            "<span class='pop-prefecture'>" + prefecture + "</span>" + "<br>" +
            "<span class='pop-city'>" + city + "</span>" + "<br>" +
            "<span class='pop-price'>" + average_price + "</span>"
          )
          .addTo(map);
      } else if (queriedFeatures.length <= 0) {
        popup.remove();
      }
    }
  }
});



/*------------------------------------
  Various cursor-related events.
------------------------------------*/
map.on("drag", function() {
  map.getCanvas().style.cursor = "grabbing";
});
map.on("dragend", function() {
  map.getCanvas().style.cursor = "grab";
});
map.on("mouseleave", "city-fills", function() {
  map.getCanvas().style.cursor = "grab";
});



map.on("zoomend", function() {
  /*-----------------------------------------------------------------------------------
    Blur textfield on geocoder on mobile browsers (to close keyboard) after loc search.
  -----------------------------------------------------------------------------------*/
  if ((window.innerHeight < 500) && (window.innerWidth < 450)) {
    let geocoder = document.getElementsByClassName("mapboxgl-ctrl-geocoder--input")[0];
    
    setTimeout(function() {
      geocoder.blur();
    }, 1000);
  }
});



document.addEventListener("click", function(event) {
  /*----------------------
    Various clicky actions.
  -----------------------*/
  let clicked = event.target.parentElement.id;
  let citation = document.getElementById("citation-info-text");
  let citationContainer = document.getElementById("citation-box");
  let mail = document.getElementById("mail-info-text");
  let mailContainer = document.getElementById("mail-box");
  let filterMenu = document.getElementById("filter-menu");
  let filterOptions = document.getElementsByClassName("filter-options-container");
  let menuSwitch = document.getElementById("collapse");
  let homeIcons = document.getElementById("home-types");
  let priceGauge = document.getElementById("price-gauge");
  let searchStats = document.getElementById("search-stats");

  // Radio selection filtering.
  if (event.target.type === "radio") {
    radioFilter(event.target.name, event.target.id);
  }

  // Clicks for static buttons.
  if (clicked === "citation-icon" || clicked === "mail-icon") {
    if (filterMenu.classList.contains("close") === false) {
      // Default with filter menu open.
      textBubble = tooltipToggle + "Open";
      if (clicked === "citation-icon") {
        citation.classList.toggle(textBubble);
        mail.classList.remove(textBubble);
      } else if (clicked === "mail-icon") {
        mail.classList.toggle(textBubble);
        citation.classList.remove(textBubble);
      }
    } else if (filterMenu.classList.contains("close") === true) {
      // Closed filter menu./
      textBubble = tooltipToggle + "Close";
      if (clicked === "citation-icon") {
        citationContainer.classList.toggle("toggle");
        citation.classList.toggle(textBubble);
        mail.classList.remove(textBubble);
        mailContainer.classList.remove("toggle");
      } else if (clicked === "mail-icon") {
        mailContainer.classList.toggle("toggle");
        mail.classList.toggle(textBubble);
        citation.classList.remove(textBubble);
        citationContainer.classList.remove("toggle");
      }
    }
  } else if (clicked === "collapse-icon") {
    citationContainer.classList.remove("toggle");
    citation.classList.remove(textBubble);
    mailContainer.classList.remove("toggle");
    mail.classList.remove(textBubble);
    if (filterMenu.classList.contains("close") === true) {
      // Open search menu.
      filterMenu.classList.remove("close");
      filterMenu.classList.add("open");
      homeIcons.classList.remove("hide");
      menuSwitch.classList.toggle("close");
      filterOptions[0].classList.toggle("close");
      priceGauge.classList.toggle("slide");
      searchStats.classList.toggle("show");
    } else if (filterMenu.classList.contains("close") === false ||
      filterMenu.classList.contains("open")) {
        // Close search menu.
        filterMenu.classList.remove("open");
        filterMenu.classList.add("close");
        homeIcons.classList.toggle("hide");
        menuSwitch.classList.toggle("close");
        filterOptions[0].classList.toggle("close");
        priceGauge.classList.toggle("slide");
        searchStats.classList.toggle("show");
    }
  } else {
    citation.classList.remove(textBubble);
    mail.classList.remove(textBubble);
  }
});



function radioFilter(radioKey, radioValue) {
  /*----------------------------------------------------------
    Prefilter available data; grey-out unavailable selections.
  ----------------------------------------------------------*/
  const header = document.getElementById("check-message");
  const checkCursor = document.getElementsByClassName("check-message-cursor")[0];
  const messages = document.getElementsByClassName("search-console-msg");
  let unit;
  let filteredList;
  let checked = checkRadios();
  let selection = document.getElementById(radioValue).nextElementSibling.textContent;
  let newLine = document.createElement("span");
  let parentSpan = document.getElementById("check-message");
  let radioCount = 0;
  let searchGlass = document.getElementsByClassName("fas fa-search")[0];
  
  // Clear messages after submitting form and starting new search.
  if (checked.length === 1 && messages.length === 5) {
    for (let element of document.querySelectorAll(".search-console-msg")) {
      element.remove();
    }
  }
  
  // Remove all "active" class from messages.
  for (let i = 0, lines = messages.length; i < lines; i++) {
    messages[i].classList.remove("active");
  }

  // Update current radio selections and assign text content for "console".
  if (radioKey === "type") {
    radioSelection[radioKey] = radioValue;
    unit = "";
    if (radioValue === "detached") {
      selection = "一戸建て";
    } else if (radioValue === "condo") {
      selection = "マンション";
    }
  } else if (radioKey === "mtrl") {
    radioSelection[radioKey] = radioValue;
    unit = "";
  } else if (radioKey === "footage") {
    radioSelection[radioKey] = "-" + radioValue;
    unit = "平米";
  } else if (radioKey === "age") {
    radioSelection[radioKey] = "-" + radioValue;
    unit = "年";
  } else if (radioKey === "station") {
    radioSelection[radioKey] = "-" + radioValue;
    unit = "分";
  }

  // Update or create new element for search "console".
  let checkId = document.getElementById("search-console-" + radioKey);
  if (checkId == null) {
    // Give new element the needed classes, id, and data attribute.
    newLine.classList.add("search-console-msg");
    newLine.id = "search-console-" + radioKey;
    newLine.setAttribute("data-text", selection + unit);
    // Typing effect in the "console".
    typeIt(newLine);
    parentSpan.insertBefore(newLine, checkCursor);
    newLine.classList.add("active");
  } else {
    // Update element instead.
    checkId.setAttribute("data-text", selection + unit);
    checkId.classList.add("active");
    typeIt(checkId);
  }

  // Updating top line in "console".
  Object.values(radioSelection).forEach(value => {
    if (value != "") {
      radioCount = radioCount + 1;
    }
  });
  
  if (header.firstChild.nodeValue.trim() == "ステータスOK") {
    header.firstChild.nodeValue = "1/5の条件が揃った";
  } else {
    header.firstChild.nodeValue = radioCount + "/5の条件が揃った";
  }

  // Get list of available selections based on current selected radios.
  // If only house type selected, list defaults to base house/condo list. 
  if (radioKey === "type" && radioCount === 1) {
    if (radioValue === "detached") {
      filteredList = houseKeys;
    } else if (radioValue === "condo") {
      filteredList = condoKeys;
    }
  } else {
    // Otherwise, list get filtered with regex.
    filteredList = regexFilter();

    // Current search parameters, for verifying.
    let currentSearch = radioSelection.mtrl + radioSelection.station + 
      radioSelection.footage + radioSelection.age;
    let searchable = filteredList.includes(currentSearch);

    // Light up search glass if combination possible.
    if (radioCount === 5 && searchable === true) {
      searchGlass.classList.add("show");
    } else {
      searchGlass.classList.remove("show");
    }
  }
  
  // Light up or dim selections based on filter.
  selectionBlock(filteredList);
}



function regexFilter() {
  /*----------------------------------------------------------------------
    Active radio filtering with regex, using global radioSelection object.
  ----------------------------------------------------------------------*/
  let filteredSelection;
  let patternSchema = "^(?=.*material)(?=.*station)(?=.*footage)(?=.*age).*$";
  let pattern = patternSchema
    .replace("material", radioSelection.mtrl)
    .replace("station", radioSelection.station)
    .replace("footage", radioSelection.footage)
    .replace("age", radioSelection.age);
  let radioRegex = new RegExp(pattern, "mg");

  // Selection based on the home type's available data.
  if (radioSelection.type === "detached") {
    filteredSelection = filterItems(houseKeys, radioRegex);
  } else if (radioSelection.type === "condo") {
    filteredSelection = filterItems(condoKeys, radioRegex);
  } else {
    // If neither selected, filter based on merged list.
    filteredSelection = filterItems(mergedKeys, radioRegex);
  }

  return filteredSelection;
}



function filterItems(origArray, query) {
  /*-------------------------------------------------------
    Matches "query" to original array.  Can use with regex.
  -------------------------------------------------------*/
  try {
    return origArray.filter(function(item) {
      return item.match(query);
    });
  } catch(error) {
    console.log("filteredItems problem array:", origArray);
    console.log("filteredItems problem query:", query);
    console.error("filteredItems error:", error);
  }
}



function selectionBlock(filteredSelection) {
  /*-------------------------------------------------------------------------------
    Light up / dim filtered parameters and updates them in global selectableRadios.
  -------------------------------------------------------------------------------*/
  // Un-set previous selectableRadios list.
  Object.keys(selectableRadios).forEach(key => {
    selectableRadios[key] = "unlit";
  });

  // Update status of un/available options.
  filteredSelection.forEach(set => {
    let options = set.split("-");

    options.forEach(option => {
      selectableRadios[option] = "lit";
    });
  });

  // Light up / dim options depending on selectable options.
  Object.keys(selectableRadios).forEach(key => {
    let lightSwitch = document.getElementById(key);

    if (selectableRadios[key] === "unlit") {
      lightSwitch.nextElementSibling.style.opacity = 0.3;
    } else if (selectableRadios[key] === "lit") {
      lightSwitch.nextElementSibling.style.opacity = 1;
    }
  });
}



function typeIt(element) {
  /*-------------------------------------------
    Modified typing effect by Brad Traversy: 
    https://www.youtube.com/watch?v=POX3dT-pB4E
  -------------------------------------------*/
  var textString = element.getAttribute("data-text");
  
  new Typer(element, textString);
}



class Typer {
  /*-------------------------------------------
    Modified typing effect by Brad Traversy:   
    https://www.youtube.com/watch?v=POX3dT-pB4E
  -------------------------------------------*/
  constructor(element, textString) {
    this.element = element;
    this.textString = textString;
    this.text = "";
    this.textIndex = 0;
    this.wait = parseInt(2500, 10);
    this.type();
  }

  type() {
    // Add char.
    this.text = this.textString.substring(0, this.text.length + 1);
    // Insert txt into element.
    this.element.innerHTML = `<span class="console-text"><br>${this.text}</span>`;
    // Typing speed.
    let typeSpeed = 100;

    // Continue printing until end of string.
    if (this.text != this.textString) {
      setTimeout(() => 
        this.type(),
        typeSpeed
      );
    }
  }
}




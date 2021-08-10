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
  
var photoDataUrl = "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/photo_data.json";
var photoData;
var dates = [];
var journal;
var startingCoords = [];
var mapStartCenter = [136.905960, 35.182871];
var mapLightRetro = "mapbox://styles/jeanings/ck6n6wkga1h831ipldw1n384v";
var mapDarkAmber = "mapbox://styles/jeanings/ckeib1jyh4md419o3jgyo7101";
var camIcon = "https://storage.googleapis.com/jn-portfolio/projects/tokaido/camera-retro.png";
var themeColour;
var lineColour;
var sourceList = [];
var layerList = [];



var map = new mapboxgl.Map({
  /*---------------------
    Initial map settings.
  ---------------------*/
  container: "map",
  style: mapLightRetro,
  interactive: true,
  scrollZoom: false,
  logoPosition: "bottom-right",
  center: mapStartCenter,
  bearing: 325,
  zoom: 6.25
});

var nav = new mapboxgl.NavigationControl({
  /*-------------------------
    Side navigation controls.
  --------------------------*/
  showCompass: true,
  showZoom: true,
});
map.addControl(nav, "bottom-right");

var spiderifier = new MapboxglSpiderifier(map, {
  /*------------------------------------------------------------
    Credit: https://github.com/bewithjonam/mapboxgl-spiderifier
    Spiderifies gps-stacked clusters.
  -------------------------------------------------------------*/
  animate: true,
  animationSpeed: 750,
  customPin: true,
  circleSpiralSwitchover: 0,
  spiralFootSeparation: 85,
  spiralLengthStart: 55,
  spiralLengthFactor: 10,
  initializeLeg: initializeSpiderLeg
});
var SPIDERFY_FROM_ZOOM = 10;



function initializeSpiderLeg(spiderLeg) {
  /*------------------------------------
    Creates popup for each spidered pin.
  -------------------------------------*/
  var pinElem = spiderLeg.elements.pin;
  var feature = spiderLeg.feature;
  var popup;

  // Shows popup on pin hover (click event fires but not showing popup...)
  pinElem.className = pinElem.className + " fas fa-thumbtack";
  pinElem.addEventListener("mouseenter", createSpiderPopups, false);
  
  function createSpiderPopups(event) {  
    popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: true,
      offset: MapboxglSpiderifier.popupOffsetForSpiderLeg(spiderLeg)
    })
    popup.setHTML(
        "<img class='marker-img' src='" + feature.thumbnail + "'>" +
        "<br><br>" + feature.date
    )
      .addTo(map);
    spiderLeg.mapboxMarker.setPopup(popup);
  };
}



/*-------------------------------------
  Toggle function for light/dark theme.
--------------------------------------*/
const themeToggle = document.querySelector(".theme-toggle input[type='checkbox']");
function switchTheme(event) {
  if (event.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark-mode");
    localStorage.setItem("theme", "dark-mode");       // Save preference for next visit.
    lineColour = "color-alt";
    themeColour = "#ffffff";
    map.setStyle(mapDarkAmber);
  } else {
    document.documentElement.setAttribute("data-theme", "light-mode");
    localStorage.setItem("theme", "light-mode");      // Save preference for next visit.
    lineColour = "color";
    themeColour = "#000000";
    map.setStyle(mapLightRetro);
  }
}
themeToggle.addEventListener("change", switchTheme, false);



/*-----------------------------------
  Retrieve previously selected theme.
------------------------------------*/
const selectedTheme = localStorage.getItem("theme") ? localStorage.getItem("theme") : null;
if (selectedTheme) {
  document.documentElement.setAttribute("data-theme", selectedTheme);
  if (selectedTheme === "dark-mode") {
    themeToggle.checked = true;
    lineColour = "color-alt";
    themeColour = "#ffffff";
    map.setStyle(mapDarkAmber)
    // setTimeout(map.setStyle(mapDarkAmber), 1000);   // Timeout needed for lineColour to get assigned.
  } else if (selectedTheme === "light-mode") {
      themeToggle.checked = "";
      lineColour = "color";
      themeColour = "#000000";
      map.setStyle(mapLightRetro)
      // setTimeout(map.setStyle(mapLightRetro), 1000);
  }
}



function saveSources() {
  /*----------------------------------------------------------
    Saves a list of mapbox source objects for theme reloading.
  -----------------------------------------------------------*/
  sourceList = Object.entries(map.getStyle().sources).filter(item => 
    item[0].indexOf("Source") !== -1
  );
}



function saveLayers() {
  /*----------------------------------------------------------
    Saves an array of mapbox layer objects for theme reloading.
  -----------------------------------------------------------*/
  layerList = map.getStyle().layers.filter(item => 
    (item.id.indexOf("photo") !== -1) || 
    (item.id.indexOf("dayLayer") !== -1)
  );
}



map.on("load", function() {
  // Fetch geojson data.
  var promises = geojsonData.map(url => fetch(url));

  // Get photo data json.
  fetch(photoDataUrl)
    .then(response => response.json())
    .then(data => {
      photoData = data;
      buildMarkerLayer(photoData);
    })
    .catch(error => console.error("Error with fetching photo json data: ", error));
      
  // Resolve all promises on map route data.
  Promise.all(promises)
    .then(responses =>
      Promise.all(responses.map(response =>
        response.json()))
    )
    // Grab starting coordinates for each day, for map jumping.
    .then(data => {
      dates = data;

      for (var i = 0, days = dates.length; i < days; i++) {
        var coords = dates[i].features[0].geometry.coordinates;
        // Filter out any array less than 3 - those are just POIs (should be cleaned out anyway)
        if (coords.length <= 3) {
          startingCoords.push([coords[0], coords[1]]);
        } else {
          startingCoords.push([coords[0][0], coords[0][1]]);
        }
      }
      addJournalCoords();
      loadRouteSources(dates);
    })
    .catch(error => console.error(error));
  
  // Add 3D terrain to map.
  map.addSource("mapbox-dem", {
    "type": "raster-dem",
    "url": "mapbox://mapbox.mapbox-terrain-dem-v1",
    "tileSize": 512,
    "maxzoom": 14
  });
  map.setTerrain({
    "source": "mapbox-dem", 
    "exaggeration": 1.75
  });

});



map.on("styledata", function(event) {
  /*-----------------------------------------
    On style load/change, build marker layer, 
    reload all mapbox sources and layers.
  ------------------------------------------*/

  // Add all sources if they don't currently exist in map instance.
  var tallySources = Object.entries(map.getStyle().sources).filter(item => 
    item[0].indexOf("Source") > 0
  );

  if (tallySources.length < 100) {
    // Source number should be ~120, if under 100 already means sources has been wiped.
    for (var i = 0, sources = sourceList.length; i < sources; i++) {
      map.addSource(sourceList[i][0], sourceList[i][1]);
    }
  }
  
 
  map.on("sourcedata", function(event) {
    if (event.isSourceLoaded) {
      // Add photo marker layers.
      var checkMarkerLayer = map.getStyle().layers.filter(item => 
        item.id.indexOf("photo") != -1
      );

      if (checkMarkerLayer.length === 0) {
        if (photoData != undefined) {
          buildMarkerLayer(photoData);
        }
      }
    }
  });

  // Add route layers, if drawn for the day.
  var checkRouteLayer = map.getStyle().layers.filter(item => 
    item.id.indexOf("dayLayer") != -1
  )
  var routes = layerList.filter(item => 
    item.id.indexOf("dayLayer") != -1
  )

  if (checkRouteLayer.length != routes.length) {
    for (var i = 0, route = routes.length; i < route; i++) {
      var sourceID = routes[i].source;
      var layerID = routes[i].id;
  
      if (!lineColour) {
        lineColour = "color";
      }
  
      map.addLayer({
        "id": layerID,
        "type": "line",
        "source": sourceID,
        "paint": {
          "line-width": 8.0,
          "line-opacity": 0.90,
          "line-color": ["get", lineColour]
        }
      });
    }
  }
});



window.onscroll = function() {
  /*------------------------------------------------------
    On scroll, check for which section is currently shown.
  -------------------------------------------------------*/
  if (journal) {
    var journalEntries = Object.keys(journal);

    for (var i = 0, entries = journalEntries.length; i < entries; i++) {
      var journalEntry = journalEntries[i];
              // 'day1': {
              //   bearing: 0,
              //   center: startingCoords[0],
              //   zoom: 15,
              //   pitch: 60,
              //   curve: curve,
              //   speed: speed,
              //   index: 0
              // }
  
      // Checks if certain id is being shown on screen, ie 'day01'
      if (isElementInView(journalEntry)) {
        setActiveEntry(journalEntry);
        break;
      }
    }
  }
};
  

 
function isElementInView(id) {
  /*------------------------------
    Checks if element in viewport.
  -------------------------------*/
  var element = document.getElementById(id);
  var bounds = element.getBoundingClientRect();
  return bounds.top < window.innerHeight && bounds.bottom > 0;
}


  
var previousEntry = '';
var activeEntry = '';
function setActiveEntry(journalEntry) {
  /*--------------------------------------
    Entry point for jumping between dates.
  ---------------------------------------*/
  var dayTracker = document.getElementsByClassName("day-marker");
  var day, dayMarker;
  var targetDestination = journal[journalEntry];
      // {   
      //   bearing: 0,
      //   center: startingCoords[0],
      //   zoom: 15,
      //   pitch: 60,
      //   curve: curve,
      //   speed: speed,
      //   index: 0
      // }
  
  // Condition when reader still on same journal entry.
  if (journalEntry === activeEntry) {
    previousEntry = activeEntry;
    return;
  }

  // Condition when reader scrolls to new journal entry.
  // Fly to new location and draw route on map.
  if (previousEntry != journalEntry) {
    activeEntry = journalEntry;
  
    // Highlight the current day on "day-progress" bar
    for (var i = 0, j = dayTracker.length; i < j; i++) {
      day = dayTracker[i];
      dayMarker = day.getAttribute("data-tracker");

      if (dayMarker === journalEntry) {
        day.classList.add("toggle");
      } else {
        day.classList.remove("toggle");
      }
    }

    // Draw route on map and fly to it.
    drawDay(journalEntry);
    map.flyTo(targetDestination);
  }
}

  

function loadRouteSources(dates) {
  /*---------------------------------------------
    Loads in all geojson routes on map as source.
  ----------------------------------------------*/
  var sourceID;

  for (var entry = 0, days = dates.length; entry < days; entry++) {
    var segment = 0;

    for (var i = 0, features = dates[entry].features.length; i < features; i++) {
      var dayData = dates[entry];
      var featureSet = dayData.features[i];      
      sourceID = "daySource" + (entry + 1) + "_" + segment;

      // Add all sources from GPS geojason, but don't draw them. 
      map.addSource(sourceID, {
          type: "geojson",
          data: featureSet  // feature set of 1 point only
        }
      );
      segment++;
    }
  }
  // Save all sources for reuse in theme change.
  saveSources();
  saveLayers();
}



function buildMarkerLayer(data) {
  /*-------------------------------
    Build layers for photo markers. 
  --------------------------------*/

  // Reload icon if missing.
  map.on("styleimagemissing", event => {
    if (event.id === "camera-retro") {
      map.loadImage(camIcon, function(error, image) {
        if (error) throw error;
        map.addImage("camera-retro", image);
      });
    }
  });

  // Add image only if missing, or reloading not working.
  setTimeout(function() {
    if (map.listImages().indexOf("camera-retro") < 0) {
      map.loadImage(camIcon, function(error, image) {
        if (error) throw error;
        map.addImage("camera-retro", image, {
          "sdf": "true"
        });
      });
    }
  }, 500);
  

  // Check for theme.
  // console.log("Current theme:", selectedTheme);
  // console.log("Line colour:", lineColour);
  if (lineColour === "color") {
    themeColour = "#000000";
  } else if (lineColour === "color-alt") {
    themeColour = "#ffffff";
  } else if (lineColour === undefined) {
    themeColour = "#000000";
  }
  // console.log("Theme colour:", themeColour);

  // Source for spidered markers.
  if (map.getSource("photoSource") === undefined) {
    map.addSource("photoSource", {
      "type": "geojson",
      "data": data,
      "cluster": true,
      "clusterRadius": 45,
      "clusterMaxZoom": 15
    });
  }

  // Layer for single-point markers.
  map.addLayer({
    "id": "photoMarkers",
    "type": "symbol",
    "source": "photoSource",
    "filter": ["!", ["has", "point_count"]],
    "layout": {
      "icon-allow-overlap": false,
      "icon-anchor": "top-right",
      "icon-image": "camera-retro",      
      "icon-size": 0.35,
      "icon-padding": 15,
      "symbol-z-order": "source"
    },
    "paint": {
      "icon-color": themeColour
    }
  });

  // Layer for spidered marker clusters.
  map.addLayer({
    "id": "photoClusters",
    "type": "symbol",
    "source": "photoSource",
    "filter": ["all", ["has", "point_count"]],
    "layout": {
      "icon-allow-overlap": true,
      "icon-anchor": "top-right",
      "icon-image": "camera-retro",      
      "icon-size": 0.35,
      "icon-padding": 15,
      "symbol-z-order": "source"
    },
    "paint": {
      "icon-color": themeColour
    }
  });

  // Cluster counter.
  map.addLayer({
    "id": "photoClustersCounter",
    "type": "symbol",
    "source": "photoSource",
    "layout": {
      "text-field": "{point_count}",
      "text-font": ["Overpass Mono Bold", "Heebo ExtraBold"],
      "text-size": 24,
      "text-anchor": "bottom-right"
    },
    "paint": {
      "text-color": "#BEBEBE",
      "text-halo-width": 2,
      "text-halo-color": "#3960D6"  // royal blue
      // "text-translate": [-5, 40]
    },
  });

  
  // Clicks on clusters will spiderify into markers.
  // Zooming or panning the map will collapse the spidered cluster.
  map.on("click", "photoClusters", spiderifyClusters);
  map.on("zoomstart", function() {
    spiderifier.unspiderfy();
  });
  map.on("drag", function() {
    spiderifier.unspiderfy();
  })
  

  function spiderifyClusters(event) {
    /*---------------------------
      Main spiderifying function.
    ----------------------------*/
    var features = map.queryRenderedFeatures(event.point, {
      layers: ["photoClusters"]
    });

    spiderifier.unspiderfy();

    // Only spiderify when over specified zoom level.
    if (!features.length) {
      return;
    } else if (map.getZoom() < SPIDERFY_FROM_ZOOM) {
      map.easeTo({
        center: event.lngLat,
        zoom: map.getZoom() + 2
      });
    } else {
      map.getSource("photoSource").getClusterLeaves(
        features[0].properties.cluster_id,    // value of the cluster's cluster_id property.
        100,                                  // max number of features to return.
        0,                                    // features to skip.
        function(err, leafFeatures) {         // callback.
          if (err) {
            return console.error("Error while retrieving leaves of a cluster", err);
          }

          var markers = leafFeatures.map(function(leafFeature) {
            return leafFeature.properties;
          });

          spiderifier.spiderfy(features[0].geometry.coordinates, markers);
        }
      );
    }
  }


  map.on("click", "photoMarkers", function(event) {
    /*-------------------------------------------------
      "Polaroid" styled popup for single photo markers.
    --------------------------------------------------*/
    var thumbnail = event.features[0].properties.thumbnail;
    // var largePhoto = event.features[0].properties.url;
    var date = event.features[0].properties.date;
    // var pixelRatio = window.devicePixelRatio;
    
    new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: true,
      offset: [0, -15]
    })
      .setLngLat(event.lngLat)
      .setHTML(
        "<img class='marker-img' src='" + thumbnail + "'>" +
        "<br><br>" + date
      )
      .addTo(map);
  });

 
  // Change cursor when hovering over photo clusters.
  map.on("mouseenter", "photoClusters", function() {
    map.getCanvas().style.cursor = "ne-resize";
  });
  map.on("mouseleave", "photoClusters", function() {
    map.getCanvas().style.cursor = "";
  });
  
  // Change cursor when hovering over photo markers.
  map.on("mouseenter", "photoMarkers", function() {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "photoMarkers", function() {
    map.getCanvas().style.cursor = "";
  });

  // Event delegation: listen for hovers on marker image.
  document.addEventListener("mouseover", function(event) {
    if (event.target.className.toLowerCase() === "marker-img" || 
        event.target.className.toLowerCase() === "marker-img-hdpi") {
      var initTrans = getComputedStyle(event.target)["transform"];
      var angle = Math.random() * 12 - 5;
      // Rotates image and "explodes" it out of the Polaroid.
      event.target.style.transform = "rotate(" + angle + "deg) scale(1.2)";
      // Returns image into Polaroid.
      event.target.addEventListener("mouseout", function() {
        this.style.transform = initTrans;
      });
    }
  });

  // Event delegation: listen for clicks on marker image.
  document.addEventListener("click", function(event) {
    if (event.target.className.toLowerCase() === "marker-img" || 
        event.target.className.toLowerCase() === "marker-img-hdpi") {
      const polaroid = event.target
      const src = polaroid.src
      const overlay = document.getElementsByClassName("tokaido-overlay")[0];
      const overlayImg = overlay.querySelector("img");

      // Get url for larger-sized image.
      srcPath = src.split("/");
      overlayImgSrc = srcPath[0] + "//" + srcPath[1] + "/" + srcPath[2] + "/" + srcPath[3] + "/" + srcPath[4] + 
        "/" + srcPath[5] + "/" + srcPath[6] + "/large/" + srcPath[8];
      
      // Open gallery-type overlay.
      overlayImg.src = overlayImgSrc;
      overlay.classList.add("open");
      polaroid.style.opacity = "0";
      
      // Close gallery-type overlay.
      document.addEventListener("click", function(event) {
        if (event.target.className.toLowerCase() === "tokaido-overlay-bg") {
          overlay.classList.remove("open");
          polaroid.style.opacity = "1";
        }
      });

      // Listen for Esc keypress to close image overlay.
      window.onkeydown = function(event) {
        if (event.keyCode === 27) {
          overlay.classList.remove("open");
          polaroid.style.opacity = "1";
        }
      };
    }
  });
}



function drawDay(journalEntry) {    // journalEntry == "day1"
  /*----------------------------------------------------
    Plots the day's route while clearing previous day's.
  -----------------------------------------------------*/
  var digit = journalEntry;
  digit = digit.replace("day", "");

  var yesterday = parseInt(digit) - 1;
  var prev = "dayLayer" + yesterday + "_";

  if (yesterday != 0) {
    deleteLayers(prev);
  }
  
  // Compile list of all segments for the day.
  var layer = "dayLayer" + digit + "_";
  var source = "daySource" + digit + "_";
  var segmentList = [];
  var count = 0
  
  while (true) {
    // Break if end of segments, otherwise compile list.
    if (map.getSource(source + count) === undefined) {
      break;
    } else {
      segmentList.push(source + count);
    }
    count++;
  }

  // Draw all segments for the day.
  for (var i = 0, segments = segmentList.length; i < segments; i++) {
    var sourceID = segmentList[i];
    var layerID = layer + i;
    
    if (!lineColour) {
      lineColour = "color";
    }

    map.addLayer({
      "id": layerID,
      "type": "line",
      "source": sourceID,
      "paint": {
        "line-width": 8.0,
        "line-opacity": 0.90,
        "line-color": ["get", lineColour]
      }
    });
    saveLayers();
  }
}



function deleteLayers(target) {
  /*-----------------------------------
    Deletes previous day's route layer.
  ------------------------------------*/
  var layerList = [];
  var count = 0
  
  // Build list of layers of the day.
  while (true) {
    // Break if end of segments, otherwise compile list.
    if (map.getLayer(target + count) === undefined) {
      break;
    } else {
      layerList.push(target + count);
    }
    count++;
  }

  // Delete all targeted layers.
  for (var i = 0, layers = layerList.length; i < layers; i++) {
    map.removeLayer(layerList[i]);
  }
}



function addJournalCoords() {
  /*------------------------------------------
    Helper function: add starting coordinates.
  -------------------------------------------*/
  let viewportWidth = window.innerWidth;
  var curve = 1.65;
  var speed = 0.55;

  // Offsets more for laptops/desktops, less for mobiles/tablets.
  if (viewportWidth > 1100) {
    var offset = [600, 0];
  } else {
    var offset = [150, 0];
  }

  journal = {
    'day1': {
      bearing: 0,
      center: startingCoords[0],
      zoom: 13,
      offset: [150,0],
      pitch: 60,
      curve: curve,
      speed: speed,
      index: 0
    },
    'day2': {
      bearing: 0,
      center: startingCoords[1],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed,
      index: 1
    },
    'day3': {
      bearing: 0,
      center: startingCoords[2],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day4': {
      bearing: 0,
      center: startingCoords[3],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day5': {
      bearing: 0,
      center: startingCoords[4],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day6': {
      bearing: 0,
      center: startingCoords[5],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day7': {
      bearing: 0,
      center: startingCoords[6],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day8': {
      bearing: 0,
      center: startingCoords[7],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day9': {
      bearing: 0,
      center: startingCoords[8],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day10': {
      bearing: 0,
      center: startingCoords[9],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day11': {
      bearing: 0,
      center: startingCoords[10],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day12': {
      bearing: 0,
      center: startingCoords[11],
      zoom: 13,
      offset: [100, 0],
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day13': {
      bearing: 0,
      center: startingCoords[12],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day14': {
      bearing: 0,
      center: startingCoords[13],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day15': {
      bearing: 0,
      center: startingCoords[14],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day16': {
      bearing: 0,
      center: startingCoords[15],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day17': {
      bearing: 0,
      center: startingCoords[16],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day18': {
      bearing: 0,
      center: startingCoords[17],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day19': {
      bearing: 0,
      center: startingCoords[18],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day20': {
      bearing: 0,
      center: startingCoords[19],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day21': {
      bearing: 0,
      center: startingCoords[20],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day22': {
      bearing: 0,
      center: startingCoords[21],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day23': {
      bearing: 0,
      center: startingCoords[22],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day24': {
      bearing: 0,
      center: startingCoords[23],
      zoom: 13,
      offset: [250, 0],
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day25': {
      bearing: 0,
      center: startingCoords[24],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    },
    'day26': {
      bearing: 0,
      center: startingCoords[25],
      zoom: 13,
      offset: offset,
      pitch: 60,
      curve: curve,
      speed: speed
    }
  };
}


var geojsonData = [
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-04-25.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-04-26.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-04-27.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-04-28.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-04-29.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-04-30.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-01.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-02.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-03.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-04.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-05.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-06.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-07.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-08.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-09.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-10.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-11.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-12.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-13.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-14.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-15.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-16.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-17.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-18.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-19.geojson",
  "https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/geojson/2017-05-20.geojson"
];

// Index parallax scroll effect.
(function parallaxScroll() {
  window.addEventListener("scroll", function(event) {
    var depthField, distance, dofOpacity, layer, scrollDepth, scrollFx;
    var maxScrollDist = 400;
    var scrollDist = window.pageYOffset;
    var layers = document.getElementsByClassName("layers");
    // var godzilla = document.getElementById("layer10godzilla");
    // var offsetShow = document.getElementById("offset");
    // offsetShow.textContent = scrollDist;

    for (var i = 0; i < layers.length; i++) {
      layer = layers[i]

      // Elevation parallax effect based on scroll distance.
      distance = layer.getAttribute("data-distance");
      scrollDepth = scrollDist * distance * 0.5;
      scrollFx = "translateY(" + scrollDepth + "px)";
      // scrollFxLat = "translateX(" + scrollDepth - 200 + "px)";
      if (scrollDist < 200) { 
        layer.style.transform = scrollFx;
      }

      // if (scrollDist > 500) {
      //   godzilla.style.transform = scrollFxLat;
      // }

      // Depth focus effect, depthFields (1 to 6):
      //  1 = background apartment complex
      //  2 = elevated roadway, river
      //  3 = fields, middle 2x tallest apartments
      //  4 = middle lowrise apartments
      //  5 = side apartments
      //  6 = foreground
      //  11~66 = blurred versions
      depthField = layer.getAttribute("data-dof");
      if (scrollDist <= 25) {
        if (depthField < 11) {
          dofOpacity = 1;
        } else if (depthField >= 11) {
          dofOpacity = 0;
        }
      // Background apartment row.
      } else if (scrollDist > 25 && scrollDist <= 85) {
          if (depthField == 1) {
            dofOpacity = (maxScrollDist - scrollDist) / maxScrollDist;
        } else if (depthField == 11) {
            dofOpacity = scrollDist / maxScrollDist;
        } else if (depthField > 11) {
            dofOpacity = 0
        } else {
            dofOpacity = 1;
        }
      // Bridge.
      } else if (scrollDist > 85 && scrollDist <= 150) {
          if (depthField <= 2) {
            dofOpacity = (maxScrollDist - scrollDist) / maxScrollDist;
          } else if (depthField >= 11 && depthField <= 22) {
              dofOpacity = scrollDist / maxScrollDist;
          } else if (depthField > 22) {
              dofOpacity = 0
          } else {
              dofOpacity = 1;
          }
      // Middle 2x apartments.
      } else if (scrollDist > 150 && scrollDist <= 225) {
          if (depthField <= 3) {
            dofOpacity = (maxScrollDist - scrollDist) / maxScrollDist;
          } else if (depthField >= 11 && depthField <= 33) {
              dofOpacity = scrollDist / maxScrollDist;
          } else if (depthField > 33) {
              dofOpacity = 0
          } else {
              dofOpacity = 1;
          }
      // Middle lowrise apartments, side.
      } else if (scrollDist > 225 && scrollDist <= 350) {
          if (depthField <= 4) {
            dofOpacity = (maxScrollDist - scrollDist) / maxScrollDist;
          } else if (depthField >= 11 && depthField <= 44) {
              dofOpacity = scrollDist / maxScrollDist;
          } else if (depthField > 44) {
              dofOpacity = 0
          } else {
              dofOpacity = 1;
          }
      // Foreground.
      } else if (scrollDist > 350) {
          if (depthField <= 5) {
            dofOpacity = (maxScrollDist - scrollDist) / maxScrollDist;
          } else if (depthField >= 11 && depthField <= 66) {
              dofOpacity = scrollDist / maxScrollDist;
          } else {
              dofOpacity = 1;
          }
      }
      layer.style.opacity = dofOpacity;
    }
  });
})();

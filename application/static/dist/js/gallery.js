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
  
    if (currentPath == "/") {
      document.getElementById("navbar").style.display = 'none';
    } else if (currentPath == "/gallery") {
      document.getElementById("greeting").textContent = "Gallery";
      menuItems.childNodes[5].style.display = "none";
    } else if (currentPath == "/projects") {
      document.getElementById("greeting").textContent = "Projects";
      menuItems.childNodes[7].style.display = "none";
    } else if (currentPath == "/projects/tokaido_urban_hike") {
      document.getElementById("greeting").textContent = "Urban Hiking the 東海道";
    } else {
      document.getElementById("greeting").textContent = "Page not found!";
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
  
// Button toggles
(function galleryToggle() {
  const galleryBtn = document.getElementById("minimize-gallery-description");
  const galleryText = document.getElementsByClassName("gallery-description");
  
  if (galleryBtn) {
    galleryBtn.addEventListener("click", function() {
      for (var i = 0; i < galleryText.length; i++) {
        galleryText[i].classList.toggle("gallery-text-toggle");
      }
      galleryBtn.classList.toggle("toggle");
    });
  }
})();


// Gallery: changing mainspread picture (event delegation)
document.addEventListener("DOMContentLoaded", function() {
  const poster = document.getElementById("poster");
  const quantized = document.getElementById("quantized");
  const captionText = document.getElementById("caption");
  var caption, fileName, imgPath, thumbPath;
  var pixelRatio = window.devicePixelRatio;

  document.addEventListener("click", function(event) {
    if (event.target.className.toLowerCase() === "swatch-images") {
      if (pixelRatio < 1.5) {
        // Get source image and change both poster and quantized images on click of swatches.
        thumbPath = event.target.src.split("/");
        poster.src = thumbPath[0] + "//" + thumbPath[1] + "/" + thumbPath[2] + "/" + 
            thumbPath[3] + "/" + thumbPath[4] + "/" + thumbPath[6];
        poster.classList.add("fade");
        setTimeout( () => 
          poster.classList.remove("fade"), 500);
        imgPath = poster.src.split("/");
        quantized.src = imgPath[0] + "//" + imgPath[1] + "/" + imgPath[2] + "/" + 
            imgPath[3] + "/" + thumbPath[4] + "/quantized/" + imgPath[5];

        // Keeps viewed swatches popped out.
        event.target.style.opacity = "1";
        event.path[1].style.transition = "1500ms";
        event.path[1].style.background = "none";

        // Match poster image with its caption from Python dict.
        fileName = imgPath[5].split("%20");
        fileName = fileName[0] + " " + fileName[1];
        caption = captions[fileName];
        captionText.textContent = caption;
      } else if (pixelRatio >= 1.5) {
          // Get source image and change both poster and quantized images on click of swatches.
          poster.src = event.target.getAttribute("data-hi-res-src");
          poster.classList.add("fade");
          setTimeout( () => 
            poster.classList.remove("fade"), 500);
          imgPath = poster.src.split("/");
          quantized.src = imgPath[0] + "//" + imgPath[1] + "/" + imgPath[2] + "/" + 
              imgPath[3] + "/" + imgPath[4] + "/quantized/" + imgPath[6];

          // Keeps viewed swatches popped out.
          event.target.style.opacity = "1";
          event.path[1].style.transition = "1500ms";
          event.path[1].style.background = "none";

          // Match poster image with its caption from Python dict.
          fileName = imgPath[6].split("%20");
          fileName = fileName[0] + " " + fileName[1];
          caption = captions[fileName];
          captionText.textContent = caption;
      }
    }
  });
});




// Gallery: Main image sticky/fixed for portrait mode
(function gallerySticky() {
  var screenWidth = window.innerWidth;
  var screenHeight = window.innerHeight;

  if (screenWidth < screenHeight) {
    window.addEventListener("scroll", function(event) {
      var scrollDist = window.pageYOffset;
      // var offsetShow = document.getElementById("offset");
      // offsetShow.textContent = scrollDist;
      if (screenWidth <= 500) {
        var openedDist = 1450;
      } else if (screenWidth > 500) {
        var openedDist = 865;
      }
      var closedDist = 160
      var textClosed;
      var textToggle = document.getElementsByClassName("gallery-text-toggle");
      var poster = document.getElementsByClassName("poster-caption-container");

      if (textToggle.length === 0) {
        textClosed = false;
      } else if (textToggle.length >= 1) {
        textClosed = true;
      }
      
      if (textClosed === true && scrollDist >= closedDist) {
        poster[0].style.position = "fixed";
        poster[0].style.background = "#ffffff85"
        poster[0].style.left = "0"
        poster[0].style.right = "0"
      } else if (textClosed === false && scrollDist >= openedDist) {
        poster[0].style.position = "fixed";
        poster[0].style.background = "#ffffff85"
        poster[0].style.left = "0"
        poster[0].style.right = "0"
      } else {
        poster[0].style.position = "sticky";
        poster[0].style.position = "sticky";
      }
    })
  }
})();

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
  
// Google Map.
let map;

// Instantiating map on Tokaido.
document.addEventListener("DOMContentLoaded", function() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 36.050465, lng: 138.042561 },
    zoom: 8
  });
});

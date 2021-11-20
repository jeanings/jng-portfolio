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
  
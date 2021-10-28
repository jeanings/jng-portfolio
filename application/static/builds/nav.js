// Navbar hide on homepage plus change greeting text
// (function hideMenu() {
//     const currentPath = window.location.pathname;
//     const menuItems = document.getElementById("menu");
  
//     if (currentPath == "/") {
//       document.getElementById("navbar").style.display = 'none';
//     } else if (currentPath == "/gallery") {
//       document.getElementById("greeting").textContent = "Gallery";
//       menuItems.childNodes[5].style.display = "none";
//     } else if (currentPath == "/projects") {
//       document.getElementById("greeting").textContent = "Projects";
//       menuItems.childNodes[7].style.display = "none";
//     } else if (currentPath == "/projects/tokaido_urban_hike") {
//       document.getElementById("greeting").textContent = "Urban Hiking the 東海道";
//     } else {
//       document.getElementById("greeting").textContent = "Page not found!";
//     }
//   })();
  

(function handleMenuItems() {
    /* ------------------------------------------------------------------
        Changes menu targets to 'top' if currently viewing target page.
    ------------------------------------------------------------------ */
    const currentPath = window.location.pathname;
    const projectsLink = document.getElementById("header_menu_list_item_projects");
    const resumeLink = document.getElementById("header_menu_list_item_resume");


    if (currentPath === '/projects') {
        projectsLink.setAttribute('onClick', 'window.location.href="/#"');
    } else if (currentPath === '/resume') {
        resumeLink.setAttribute('onClick', 'window.location.href="/#"');
    }
})();
  
  

(function menuToggle() {
    /* -------------------------------
        Handles menu button toggles.
    ------------------------------- */
    const menu = document.getElementsByClassName("header_menu")[0];
    const menuArrowToggle = document.getElementsByClassName("header_menu_toggle")[0];
    const menuArrowStroke1 = document.getElementById("header_menu_toggle_stroke1");
    const menuArrowStroke2 = document.getElementById("header_menu_toggle_stroke2");
    const menuList = document.getElementById("header_menu_list");

    menuArrowToggle.addEventListener('click', function() {
        menu.classList.toggle("toggle");
        menuArrowToggle.classList.toggle("toggle");
        menuArrowStroke1.classList.toggle("toggle");
        menuArrowStroke2.classList.toggle("toggle");
        menuList.classList.toggle("toggle");
    });
})();



(function blendToggleBackground() {
    /* ------------------------------------------------------------
        Blend menu toggle's background on resume menu item hover.
    ------------------------------------------------------------ */
    const resumeMenuItem = document.getElementById("header_menu_list_item_resume");
    const menuArrowToggle = document.getElementsByClassName("header_menu_toggle")[0];

    resumeMenuItem.addEventListener('mouseover', function() {
        menuArrowToggle.classList.add("resume-hover");
    });

    resumeMenuItem.addEventListener('mouseout', function() {
        menuArrowToggle.classList.remove("resume-hover");
    });

    // For touch devices.
    resumeMenuItem.addEventListener('touchstart', function() {
        menuArrowToggle.classList.add("resume-hover");
    });

    resumeMenuItem.addEventListener('touchend', function() {
        menuArrowToggle.classList.remove("resume-hover");
    });
})();

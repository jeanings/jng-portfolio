// Loading screen
window.onload = function() {
  const loader = document.getElementById("loading");
  const pageIndex = document.getElementById("index-loader");
  const pageOthers = document.getElementById("pages-loader");
  const currentPath = window.location.pathname;

  loader.classList.add("lift");

  if (currentPath == "/") {
    setTimeout(function() {
      pageIndex.classList.add("show");
      loader.classList.add("hide");
    }, 1000);
  }
  //  else if (currentPath == "/gallery") {
  //     setTimeout(function() {
  //       pageOthers.classList.add("show");
  //       loader.classList.add("hide");
  //     }, 100);
  // }
};




// Smooth jump-scrolling
document.querySelectorAll("a[href^='#']").forEach(anchor => {
  anchor.addEventListener("click", function(event) {
    event.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth"
    });
  });
});

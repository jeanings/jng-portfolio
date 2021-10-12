window.onload = function() {
	/* ------------------------
		Loader for main page.
	------------------------ */

	// loader.classList.add("reveal");
	checkImagesLoaded();
	greetUser();
    parallaxScroll();
};


function checkImagesLoaded() {
	/* -------------------------------------------------
		Load all images before lifting loader overlay.
		https://stackoverflow.com/a/60949881/14181584
	------------------------------------------------- */
	const loader = document.getElementsByClassName("loading")[0];
	const container = document.getElementsByClassName("container")[0];
	const images = document.images;

	Promise.all(Array.from(images).map(img => {
		if (img.complete) 
			return Promise.resolve(img.naturalHeight !== 0);

		return new Promise(resolve => {
			img.addEventListener("load", () => resolve(true));
			img.addEventListener("error", () => resolve(false));
		});
	}))
		.then(results => {
			if (results.every(response => response)) {
				loader.classList.add("fade");
				loader.classList.add("hide");
				container.classList.add("fade");
				container.classList.add("show");
			} else
				console.log("Index images loaded; some may be broken.");
				loader.classList.add("fade");
				loader.classList.add("hide");
				container.classList.add("fade");
				container.classList.add("show");
		});
}


function greetUser() {
	/* -------------------------
		Header title/greeting.
	------------------------- */
	const headerGreet = document.getElementById("header_title_text");
	const time = new Date();
	const hour = time.getHours();
	
	if (hour >= 0 && hour < 5) {
		headerGreet.textContent = "Good evening!";
	} else if (hour >= 5 && hour < 12) {
		headerGreet.textContent = "Good morning!";
	} else if (hour >= 12 && hour < 18) {
		headerGreet.textContent = "Good afternoon!";
	} else if (hour >= 18) {
		headerGreet.textContent = "Good evening!";
	}
}


function parallaxScroll() {
	/* --------------------------
		Parallax scroll effect.
	-------------------------- */
	window.addEventListener("scroll", function(event) {
		let layerDistance, layer, scrollDepth, scrollFx;
		let scrollDist = window.pageYOffset;
		let windowWidth = window.innerWidth;
		let windowHeight = window.innerHeight;
		let picFrame = document.getElementsByClassName("index_cityscape")[0];
		let picFrameWidth = getComputedStyle(picFrame).width.replace('px', '');
		let picFrameHeight = getComputedStyle(picFrame).height.replace('px', '');
		let layers = document.getElementsByClassName("index_cityscape_layers");

		// Elevation parallax effect based on scroll distance.
		for (var i = 0; i < layers.length; i++) {
			layer = layers[i]
			layerDistance = layer.getAttribute("data-distance");
			scrollDepth = scrollDist * layerDistance * 0.175;
			scrollFx = 'translateY('.concat(scrollDepth, 'px)');

			if (scrollDist < 800) {
				// Shift layers' y-axis position.
				layer.style.transform = scrollFx;
			}
		}

		// "Zoom" into frame if scrolled more than 150px.
		if (scrollDist >= 150) {
			let zoomPercent = 50 + (scrollDist / windowHeight * 12.5);
			let widenPercent = Math.floor(zoomRatio).toString().concat('%');
			picFrame.style.width = widenPercent;
		} else
			picFrame.style.width = "50%";		
	});
};

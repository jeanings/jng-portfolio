window.onload = function() {
	/* ------------------------
		Loader for main page.
	------------------------ */
	let picFrame = document.getElementsByClassName("index_cityscape")[0];
	let initPicFrameWidthPercent = getComputedStyle(picFrame).width;

	checkImagesLoaded();
    parallaxScroll(initPicFrameWidthPercent);
	aboutTextObserver();
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



function parallaxScroll(initPicFrameWidthPercent) {
	/* --------------------------
		Parallax scroll effect.
	-------------------------- */
	window.addEventListener("scroll", function(event) {
		// let container = document.getElementsByClassName("container show")[0];
		// let scrollHeight = container.scrollHeight;
		let container = document.getElementsByClassName("container show")[0];
		let scrollWidth = container.scrollWidth;
		let scrollHeight = container.scrollHeight;
		let orientation = (window.innerWidth > window.innerHeight) ? 'landscape' : 'portrait';
		let picFrame = document.getElementsByClassName("index_cityscape")[0];
		let layers = document.getElementsByClassName("index_cityscape_layers");
		let layerDistance, layer, scrollDepth, scrollFx;
		let scrollDist = window.pageYOffset;
		let scrollDistHeightRatio = scrollDist / scrollHeight; 
		let zoom = Math.floor(initPicFrameWidthPercent.replace('%', ''));
		
		console.log('inner w', window.innerWidth, 'w', scrollWidth,);


		// Elevation parallax effect based on scroll distance.
		for (var i = 0; i < layers.length; i++) {
			layer = layers[i]
			layerDistance = layer.getAttribute("data-distance");

			if (scrollDistHeightRatio <= 0.4) {
				if (orientation === 'landscape') {
					scrollDepth = scrollDist * layerDistance * 0.20;
				} else if (orientation === 'portrait') {
					scrollDepth = scrollDist * layerDistance * 0.10;
				}
			}

			// Shift layers' y-axis position.
			// console.log('scrollDepth', scrollDepth);
			scrollFx = 'translateY('.concat(scrollDepth, 'px)');
			layer.style.transform = scrollFx;
		}

		// "Zoom" into frame if scrolled more than 150px.
		if (scrollDist >= 150 && scrollDist < scrollHeight * 0.6) {
			let newZoom = zoom + (scrollDist / scrollHeight * 25);
			let widenPercent = Math.floor(newZoom).toString().concat('%');
			picFrame.style.width = widenPercent;
		} else
			picFrame.style.width = initPicFrameWidthPercent;
	});
};



function aboutTextObserver() {
	/* ----------------------------------------------
		Fade-in text gradually as it comes to view.
	---------------------------------------------- */
	let observer;
	let threshold = [0, 0.20, 0.40, 0.60, 0.80, 1];
	let observerOptions = {
		root: null,		// threshold based on null (viewport), not element. 
		rootMargin: '0px',
		threshold: threshold
	};

	// Observer constructor - calls handleObservation when threshold is crossed.
	observer = new IntersectionObserver(handleObservation, observerOptions);

	// Observe targets.
	let para1Elem = document.getElementsByClassName("index_about_text_para1")[0];
	let para2Elem = document.getElementsByClassName("index_about_text_para2")[0];
	let para3Elem = document.getElementsByClassName("index_about_text_para3")[0];
	let para4Elem = document.getElementsByClassName("index_about_text_para4")[0];
	let elemList = [para1Elem, para2Elem, para3Elem, para4Elem];

	elemList.forEach(element => {
		observer.observe(element);
	});
	

	function handleObservation(entries, observer) {
		/* --------------------------------------------
			Observer callback for fading in elements.
		-------------------------------------------- */
		entries.forEach(entry => {
			if (entry.intersectionRatio >= 0.80) {
				entry.target.style.opacity = "1";
			} else if (entry.intersectionRatio < 0.80) {
				entry.target.style.opacity = "0";
			}
		});
	}
}

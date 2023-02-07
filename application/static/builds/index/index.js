window.onload = function() {
	/* ------------------------
		Loader for main page.
	------------------------ */
	let picFrame = document.getElementsByClassName("Index__cityscape")[0];
	let initPicFrameWidthPercent = getComputedStyle(picFrame).width;

    parallaxScroll(initPicFrameWidthPercent);
};


function parallaxScroll(initPicFrameWidthPercent) {
	/* --------------------------
		Parallax scroll effect.
	-------------------------- */
	window.addEventListener("scroll", function(event) {
		let container = document.getElementsByClassName("container")[0];
		let scrollHeight = container.scrollHeight;
		let orientation = (window.innerWidth > window.innerHeight) 
			? 'landscape'
			: 'portrait';
		let picFrame = document.getElementsByClassName("Index__cityscape")[0];
		let layers = document.getElementsByClassName("Index__cityscape__layers");
		let layerDistance, layer, scrollDepth, scrollEffect;
		let scrollDist = window.pageYOffset;
		let scrollDistHeightRatio = scrollDist / scrollHeight; 
		let zoom = Math.floor(initPicFrameWidthPercent.replace('%', ''));
		

		// Elevation parallax effect based on scroll distance.
		for (var i = 0; i < layers.length; i++) {
			layer = layers[i]
			layerDistance = layer.getAttribute("data-distance");

			if (scrollDistHeightRatio <= 0.4) {
				if (orientation === 'landscape') {
					scrollDepth = scrollDist * layerDistance * 0.20;
				} 
				else if (orientation === 'portrait') {
					scrollDepth = scrollDist * layerDistance * 0.10;
				}
			}

			// Shift layers' y-axis position.
			scrollEffect = 'translateY('.concat(scrollDepth, 'px)');
			layer.style.transform = scrollEffect;
		}

		// "Zoom" into frame if scrolled more than 150px.
		if (scrollDist >= 150 
			&& scrollDist < scrollHeight * 0.6) {

			let newZoom = zoom + (scrollDist / scrollHeight * 25);
			let widenPercent = Math.floor(newZoom).toString().concat('%');
			picFrame.style.width = widenPercent;
		} 
		else
			picFrame.style.width = initPicFrameWidthPercent;
	});
};
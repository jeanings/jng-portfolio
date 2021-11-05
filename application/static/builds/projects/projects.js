window.onload = function() {
	/* ------------------------
		Loader for main page.
	------------------------ */
    const loader = document.getElementsByClassName("loading")[0];
	const container = document.getElementsByClassName("container")[0];
    
    loader.classList.add("hide");
    container.classList.add("fade");
    container.classList.add("show");
	// checkImagesLoaded();
};



function checkImagesLoaded() {
	/* -------------------------------------------------
		Load all images before lifting loader overlay.
		https://stackoverflow.com/a/60949881/14181584
	------------------------------------------------- */
	const loader = document.getElementsByClassName("loading")[0];
	const container = document.getElementsByClassName("container")[0];
	// const images = document.images;

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
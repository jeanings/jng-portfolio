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
	fillGrid()
};



function fillGrid() {
	/* -----------------------------------------------------
		Fill in timeline grid with corresponding projects.
	------------------------------------------------------*/
	const styleSheet = document.styleSheets[0];
	const yearIdString = "projects_timeline_year_";
	const quarterElemMap = {
		"Q1": ".projects_timeline_year_grid_jan_apr",
		"Q2": ".projects_timeline_year_grid_apr_jul",
		"Q3": ".projects_timeline_year_grid_jul_oct",
		"Q4": ".projects_timeline_year_grid_oct_dec"
	};
	const rowMap = {
		"1": ".row2",
		"2": ".row3",
		"3": ".row4",
		"4": ".row2",
		"5": ".row3",
		"6": ".row4",
		"7": ".row2",
		"8": ".row3",
		"9": ".row4",
		"10": ".row2",
		"11": ".row3"
	};
	const monthElemMap = {
		"1": ".col1",
		"2": ".col2",
		"3": ".col3"
	};
	const borderStyles = {
		"1": "dotted",
		"2": "dashed",
		"3": "double",
		"4": "groove",
		"5": "ridge",
		"6": "dotted",
		"7": "dashed",
		"8": "double",
		"9": "groove",
		"10": "ridge",
		"11": "dotted"
	}
	var subStackCounter = {};
	let projectColours = {};


	mainProjects.forEach((project, index) => {
		let colour = mainColours[index];
		
		projectColours = {
			...projectColours, 
			[project.title]: colour
		};

		Object.keys(project.year).forEach(yearItem => {
			let yearElem = document.getElementById(yearIdString.concat(yearItem));

			// Create project-specific style class.
			let newClass = ".projects_timeline_year_".concat(
				yearItem, '_', 
				'main_', project._id, '.hover'
			);
			let newStyle = '{'
				// + 'background: ' + colour + ';'
				+ 'border-bottom-width: 1rem !important;'
				+ 'cursor: pointer;'
				+ 'transition: all 300ms ease-in-out;'
				+ '}';
			let classSelector = newClass.replace('.', '').replace('.hover', '');
			styleSheet.insertRule(newClass + newStyle);

			Object.keys(project.year[yearItem]).forEach(quarterItem => {
				let quarterElem = yearElem.querySelector(quarterElemMap[quarterItem]);

				project.year[yearItem][quarterItem].forEach(monthItem => {
					// Draw border "slot" for main project.
					let monthElem = quarterElem.querySelector(monthElemMap[monthItem])
					monthElem.style.borderBottom = colour + ' solid 0.5rem';
					monthElem.style.transition = 'all 300ms ease-in-out';

					// Add project-specific class.
					monthElem.classList.add(classSelector);
				});
			});

			// Add class to project elements.
			let projectElements = document.getElementsByClassName(classSelector);

			Object.values(projectElements).forEach(el => {
				// Add event listeners for all elements of project.
				el.addEventListener('mouseover', () => {
					Object.values(projectElements).forEach(elem => {
						elem.classList.add("hover");
					});	
				});

				// Remove event listeners for all elements of project.
				el.addEventListener('mouseout', () => {
					Object.values(projectElements).forEach(elem => {
						elem.classList.remove("hover");
					});	
				});

				el.addEventListener('click', () => {
					console.log('click: ', el);
				});
			});
		});
	});


	let mainProjectMarker;
	let subProjectBorderWidth = 'var(--sub-proj-border-width)';
	let subProjectBorderWidthHover = 'var(--sub-proj-border-width-hover)';
	let rowCounter = 1;

	subProjects.forEach(project => {
		// Track which main project the current iteration is a component of.
		if (mainProjectMarker === undefined) {
			// Assign initial marker.
			mainProjectMarker = project['componentOf'];
		} else if (mainProjectMarker === project['componentOf']) {
			// Increment row counter if under same main project.
			rowCounter += 1;
		} else if (mainProjectMarker !== project['componentOf']) {
			// Update project marker.
			mainProjectMarker = project['componentOf'];

			// Reset row counter if different main project.
			rowCounter = 1;
		}
		
		// Assign subproject colour.
		let colour = projectColours[project.componentOf];

		Object.keys(project.year).forEach(yearItem => {
			let yearElem = document.getElementById(yearIdString.concat(yearItem));

			// Create project-specific style class.
			let newClass = ".projects_timeline_year_".concat(
				yearItem, '_', 
				'sub_', project._id, '.hover'
			);

			let newStyle = '{'
				+ 'border-bottom-width: ' + subProjectBorderWidthHover + ' !important;'
				+ 'cursor: pointer;'
				+ 'transition: all 300ms ease-in-out;'
				+ '}';

			let classSelector = newClass.replace('.', '').replace('.hover', '');
			styleSheet.insertRule(newClass + newStyle);

			Object.keys(project.year[yearItem]).forEach(quarterItem => {
				let quarterElem = yearElem.querySelector(quarterElemMap[quarterItem]);
				
				project.year[yearItem][quarterItem].forEach(monthItem => {
					let borderStyle = borderStyles[rowCounter].concat(' ', subProjectBorderWidth);
					
					// Draw border "slot" for sub project.
					let monthElem = quarterElem.querySelector(
						rowMap[rowCounter].concat(' ', monthElemMap[monthItem])
					);

					monthElem.style.borderBottom = colour.concat(' ', borderStyle);
					monthElem.style.opacity = "0.85";
					monthElem.style.transition = 'all 300ms ease-in-out';

					// Add project-specific class.
					monthElem.classList.add(classSelector);


					// Keep track of slotted "state".
					// subStackCounter = {...subStackCounter,
					// 	[yearItem]: {
					// 		...subStackCounter[yearItem],
					// 		[quarterItem]: {
					// 			...subStackCounter[yearItem]?.[quarterItem],
					// 			[monthItem]: 'slotted'
					// 		},
					// 	}
					// };
				});
			});

			// Add class to project elements.
			let projectElements = document.getElementsByClassName(classSelector);

			Object.values(projectElements).forEach(el => {
				// Add event listeners for all elements of project.
				el.addEventListener('mouseover', () => {
					Object.values(projectElements).forEach(elem => {
						elem.classList.add("hover");
					});	
				});

				// Remove event listeners for all elements of project.
				el.addEventListener('mouseout', () => {
					Object.values(projectElements).forEach(elem => {
						elem.classList.remove("hover");
					});	
				});

				el.addEventListener('click', () => {
					console.log('click: ', el);
				});
			});
		});
	});
}



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
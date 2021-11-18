window.onload = function() {
	/* ------------------------
		Loader for main page.
	------------------------ */
	loading();
	fillGrid()
	renderNewestProjects();
};



function renderNewestProjects() {
	/* --------------------------------------------------------------------
		Simulate click on newest projects to render them on initial load.
	-------------------------------------------------------------------- */
	const newestMain = mainProjects[mainProjects.length - 1];
	const newestSub = subProjects[subProjects.length - 1];
	const latestYear = Object.keys(mainProjects[mainProjects.length - 1].year).pop();
	const elemStr = "projects_timeline_grid_year_";

	// Get newest projects' elements.
	const newestMainElemStr = elemStr.concat(latestYear, '_', 'main_', newestMain._id);
	const newestSubElemStr = elemStr.concat(latestYear, '_', 'sub_', newestSub._id);
	const newestMainElem = document.getElementsByClassName(newestMainElemStr)[0];
	const newestSubElem = document.getElementsByClassName(newestSubElemStr)[0];

	// Click on elements to render.
	newestMainElem.click();
	newestSubElem.click();	
}



function fillGrid() {
	/* -----------------------------------------------------
		Fill in timeline grid with corresponding projects.
	------------------------------------------------------*/
	const styleSheet = document.styleSheets[0];
	const yearElementIdString = "projects_timeline_grid_year_";
	const quarterElemMap = {
		"Q1": ".projects_timeline_grid_year_axes_jan_apr",
		"Q2": ".projects_timeline_grid_year_axes_apr_jul",
		"Q3": ".projects_timeline_grid_year_axes_jul_oct",
		"Q4": ".projects_timeline_grid_year_axes_oct_dec"
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
	};
	let projectColors = {};
	let projectBorderStyles = {};
	let mainProjectBorderWidth = 'var(--main-proj-border-width)';
	let mainProjectBorderWidthHover = 'var(--main-proj-border-width-hover)';


	mainProjects.forEach((project, index) => {
		let color = mainColours[index];
		
		projectColors = {
			...projectColors, 
			[project.title]: color
		};

		Object.keys(project.year).forEach(yearItem => {
			let yearElem = document.getElementById(yearElementIdString.concat(yearItem));
			let borderStyle = 'solid'.concat(' ', mainProjectBorderWidth);
			let border = color.concat(' ', borderStyle);

			// Save border style per project.
			projectBorderStyles = {
				...projectBorderStyles,
				[project.title]: border
			};
			
			// Create project-specific style class.
			let newClass = ".projects_timeline_grid_year_".concat(
				yearItem, '_', 
				'main_', project._id, '.hover'
			);
			let newStyle = '{'
				+ 'border-bottom-width: 1rem !important;'
				+ 'border-bottom-width: ' + mainProjectBorderWidthHover + ' !important;'
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

					monthElem.style.borderBottom = projectBorderStyles[project.title];
					monthElem.style.transition = 'all 300ms ease-in-out';

					// Add project-specific class.
					monthElem.classList.add(classSelector);

					// Set attributes.
					monthElem.setAttribute("data-id", project._id);
					monthElem.setAttribute("data-category", "main");
				});
			});


			// Add class to project elements.
			let mainContentFrame = document.getElementsByClassName("projects_content_main_frame")[0];
			let mainContentContainer = document.getElementsByClassName("projects_content_main")[0];
			let projectElements = document.getElementsByClassName(classSelector);

			Object.values(projectElements).forEach(element => {
				// Add event listeners for all elements of project.
				element.addEventListener('mouseover', () => {
					Object.values(projectElements).forEach(elem => {
						elem.classList.add("hover");
						mainContentFrame.style.outline = border;
						mainContentContainer.style.opacity = 0.10;
					});	
				});

				// Remove event listeners for all elements of project.
				element.addEventListener('mouseout', () => {
					Object.values(projectElements).forEach(elem => {
						elem.classList.remove("hover");
						mainContentFrame.style.outlineColor = 'transparent';
						mainContentFrame.style.outlineWidth = '0px';
						mainContentContainer.style.opacity = 1;
					});	
				});

				element.addEventListener('click', handleProjectClick);
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
		
		// Assign subproject color (faded project color)./
		let color = projectColors[project.componentOf].slice(0, -4) + '0.55)';


		Object.keys(project.year).forEach(yearItem => {
			let yearElem = document.getElementById(yearElementIdString.concat(yearItem));
			let borderStyle = borderStyles[rowCounter].concat(' ', subProjectBorderWidth);
			let border = color.concat(' ', borderStyle);

			// Save border style per project.
			projectBorderStyles = {
				...projectBorderStyles,
				[project.title]: border
			};

			// Create project-specific style class.
			let newClass = ".projects_timeline_grid_year_".concat(
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
					// Draw border "slot" for sub project.
					let monthElem = quarterElem.querySelector(
						rowMap[rowCounter].concat(' ', monthElemMap[monthItem])
					);

					monthElem.style.borderBottom = projectBorderStyles[project.title];
					monthElem.style.transition = 'all 300ms ease-in-out';

					// Add project-specific class.
					monthElem.classList.add(classSelector);

					// Set attributes.
					monthElem.setAttribute("data-id", project._id);
					monthElem.setAttribute("data-category", "sub");
				});
			});

			// Add class to project elements.
			let subContentFrame = document.getElementsByClassName("projects_content_sub_frame")[0];
			let subContentContainer = document.getElementsByClassName("projects_content_sub")[0];
			let projectElements = document.getElementsByClassName(classSelector);

			Object.values(projectElements).forEach(element => {
				// Add event listeners for all elements of project.
				element.addEventListener('mouseover', () => {
					Object.values(projectElements).forEach(elem => {
						elem.classList.add("hover");
						subContentFrame.style.outline = projectBorderStyles[project.title];
						subContentContainer.style.opacity = 0.10;
					});	
				});

				// Remove event listeners for all elements of project.
				element.addEventListener('mouseout', () => {
					Object.values(projectElements).forEach(elem => {
						elem.classList.remove("hover");
						subContentFrame.style.outlineColor = 'transparent';
						subContentFrame.style.outlineWidth = '0px';
						subContentContainer.style.opacity = 1;
					});	
				});

				element.addEventListener('click', handleProjectClick);
			});
		});
	});



	function handleProjectClick(event) {
		/* -------------------------------------------------------------------
			Clicks on main project bars will render the project's info in the 
			main project content component.
	
			Clicks on Components / Component of of projects will render for
			its children / parent project.
		------------------------------------------------------------------- */
		const id = event.target.getAttribute("data-id");
		const category = event.target.getAttribute("data-category");
		var projectsObj = category == 'main' ? mainProjects : subProjects;
		let mainContentContainer = document.getElementsByClassName("projects_content_main")[0];
		let subContentContainer = document.getElementsByClassName("projects_content_sub")[0];

		const elements = {
			'main': {
				'title': 'projects_content_main_header_title_text',
				'git': 'projects_content_main_header_category_text_git',
				'url': 'projects_content_main_info_item_url_text_url',
				'component': 'projects_content_main_info_item_components_text',
				'date': 'projects_content_main_info_item_date_text',
				'stack': 'projects_content_main_info_item_stack_text',
				'backend': 'projects_content_main_info_item_stack_text_backend',
				'frontend': 'projects_content_main_info_item_stack_text_frontend',
				'description': 'projects_content_main_description_text'
			},
			'sub': {
				'title': 'projects_content_sub_header_title_text',
				'git': 'projects_content_sub_header_category_text_git',
				'url': 0,
				'component': 'projects_content_sub_info_item_componentOf_text',
				'date': 'projects_content_sub_info_item_date_text',
				'stack': 'projects_content_sub_info_item_stack_text',
				'backend': 'projects_content_sub_info_item_stack_text_backend',
				'frontend': 'projects_content_sub_info_item_stack_text_frontend',
				'description': 'projects_content_sub_description_text'
			}
		};
		
	
		if (id) {
			// Progress bar clicks.
			projectsObj.forEach(project => {
				if (project._id == id) 
					updateContent(project, elements[category], category);
			});
			
			// 'Brighten' darkened container on click.
			if (category == 'main')
				mainContentContainer.style.opacity = 1;
			else if (category == 'sub') 
				subContentContainer.style.opacity = 1;
		} else {
			// Content components & componentOf clicks.
			const buttonType = event.target.getAttribute("data-clicksOf");
			const componentTitle = event.target.innerHTML;
			const componentCategory = buttonType == 'components' ? 'sub' : 'main';
			projectsObj = buttonType == 'components' ? subProjects : mainProjects;
		
			projectsObj.forEach(project => {
				if (project.title == componentTitle)
					updateContent(project, elements[componentCategory], componentCategory);
			});
		}
		
			
	
		function updateContent(project, elements, category) {
			/* -----------------------------------------------------------
				Updates current content to clicked .
			---------------------------------------------------------- */
			// Assign all corresponding elements.
			let titleElem = document.getElementById(elements.title);
			let gitElem = document.getElementById(elements.git);
			let urlElem = elements.url !== 0 ? document.getElementById(elements.url) : 0;
			let componentElem = document.getElementById(elements.component);
			let dateElem = document.getElementById(elements.date);
			let backendElem = document.getElementsByClassName(elements.backend)[0];
			let frontendElem = document.getElementsByClassName(elements.frontend)[0];
			let textElem = document.getElementById(elements.description);
			let backendLength = Object.keys(project.stack.backend).length;
			let frontendLength = Object.keys(project.stack.frontend).length;
			let componentKey = category == 'main' ? 'components' : 'componentOf';
			let color = category == 'main'
							? projectColors[project.title]
							: projectColors[project.componentOf];

	
			// Update content. 
			titleElem.innerHTML = project.title;
			titleElem.style.borderBottom = projectBorderStyles[project.title];

			if (project.git !== '') {
				gitElem.children[0].href = project.git;
				gitElem.children[0].style.cursor = 'pointer';
				gitElem.children[0].style.pointerEvents = 'auto';
				gitElem.children[0].children[0].style.fill = color;
				gitElem.children[0].children[0].style.cursor = 'pointer';
				gitElem.children[0].children[0].style.pointerEvents = 'auto';
			} else {
				gitElem.children[0].style.cursor = 'default';
				gitElem.children[0].style.pointerEvents = 'none';
				gitElem.children[0].children[0].style.fill = 'var(--color-bg)';
				gitElem.children[0].children[0].style.cursor = 'default';
				gitElem.children[0].children[0].style.pointerEvents = 'none';
			}

			urlElem.textContent = project.url;
			urlElem.href = project.url;
			dateElem.innerHTML = Object.keys(project.year)[0].concat(' ', project.season);
			textElem.innerHTML = project.objectives;
			updateChildren(componentElem, componentKey, category);
			updateChildren(backendElem, 'backend', category);
			updateChildren(frontendElem, 'frontend', category);

	
	
			function updateChildren(sectionElem, sectionKey, category) {
				/* --------------------------------------
					Create elements for content update.
				-------------------------------------- */
				let newChildren = [];
	

				if (sectionKey == 'backend' || sectionKey == 'frontend') {
					// For stack sections.
					Object.entries(project.stack[sectionKey]).forEach(stackItem => {
						let itemName = stackItem[0];
						let url = stackItem[1];
						let newElem = document.createElement('a');
						let newElemText = document.createTextNode(itemName);

						newElem.setAttribute('href', url);
						newElem.setAttribute('target', '_blank');
						newElem.appendChild(newElemText);
						newChildren.push(newElem);
					});
				} else {
					// For components/component of section.
					if (sectionKey === 'components') {
						Object.entries(project[sectionKey]).forEach(componentItem => {
							let itemName = componentItem[1];
							let newElem = document.createElement('button');
		
							newElem.addEventListener('click', handleProjectClick);
							newElem.setAttribute("data-clicksOf", sectionKey);
							newElem.innerHTML = itemName;
							newChildren.push(newElem);
						});
					} else if (sectionKey === 'componentOf') {
						let itemName = project[sectionKey];
						let newElem = document.createElement('button');
	
						newElem.addEventListener('click', handleProjectClick);
						newElem.setAttribute("data-clicksOf", sectionKey);
						newElem.innerHTML = itemName;
						newChildren.push(newElem);
					}
				}

				// Grid restyling.
				let stackElemStr = category == 'main'
					? sectionElem.className.slice(0, 43)  // 'projects_content_main_info_item_stack_text_'
					: sectionElem.className.slice(0, 42); // 'projects_content_sub_info_item_stack_text_'
				let remainElemStr = sectionKey == 'backend'
					? stackElemStr.concat('frontend')
					: stackElemStr.concat('backend');
				let remainElem = document.getElementsByClassName(remainElemStr)[0];


				if ((sectionKey == 'backend' && backendLength == 0)
					|| (sectionKey == 'frontend' && frontendLength == 0)) {
					// Restyle remaining grid item to take on entire grid if empty stack.
					remainElem.style.gridRow = '1 / -1';
					sectionElem.style.gridRow = '-1 / -1';
				} else {
					// Reset to default grid styling.
					if (sectionKey == 'backend') 
						remainElem.style.gridRow = '2 / -1';
					else if (sectionKey == 'frontend')
						remainElem.style.gridRow = '1 / 2';
				}
				
				// Replace set of children.
				sectionElem.replaceChildren(...newChildren);
			}
		}
	}
}



function loading() {
	/* ---------------------------------------
		Simple delay to show loading screen.
	--------------------------------------- */
	const loader = document.getElementsByClassName("loading")[0];
	const container = document.getElementsByClassName("container")[0];

	setInterval(() => {
		loader.classList.add("fade");
		loader.classList.add("hide");
		container.classList.add("fade");
		container.classList.add("show");
	}, 2000);
}
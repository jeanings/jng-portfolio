const projectSelectorElements = document.getElementsByClassName("Projects__selector__button__image");


/* ---------------------------------------
	Button consctructor for stack items.
--------------------------------------- */
function createStackItemButton(categoryItem) {
	const [ categoryItemName, categoryItemUrl ] = Object.entries(categoryItem)[0];

	// Set up child anchor element.
	itemAnchor = document.createElement("a");
	itemAnchor.setAttribute("href", categoryItemUrl);
	itemAnchor.setAttribute("target", "_blank");
	itemAnchor.innerHTML = categoryItemName;

	// Set up parent button element.
	itemButton = document.createElement("button");
	itemButton.setAttribute("class", "stack__button");
	itemButton.appendChild(itemAnchor);

	return itemButton;
};


/* ---------------------------------------------------
	Updates UI elements with new project properties.
--------------------------------------------------- */
function renderUpdates(projectId) {
	const year = document.getElementById("title-project-year");
	const title = document.getElementById("title-text");
	const titleSeparatorBar = document.getElementById("title-separator");
	const objectives = document.getElementById("content-objectives");
	const description = document.getElementById("content-description");
	const demoVideo = document.getElementById("demo-video");
	const demoVideoSrc = document.getElementById("demo-video-src");

	/* -----------------------------------------------
		Removes all child nodes from parent element.
	----------------------------------------------- */
	function removeAllButtons(container) {
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
	};


	// Get clicked project through projectId.
	let project;
	try {
		if (projects) {
			project = projects.filter(entry => entry._id === projectId)[0];
		}
	} catch (error) {
		console.error(error);
		// global variable 'projects' wasn't set correctly through jinja template,
		// or is undefined due to back-end issues.
	}

	// Update text elements with new entries from clicked project.
	year.innerHTML = project.year;
	title.innerHTML = project.title;
	objectives.innerHTML = project.objectives;
	description.innerHTML = project.description;

	// Update video variables and reload container.
	demoVideo.setAttribute('poster', project.thumb);
	demoVideoSrc.setAttribute('src', project.demo);
	demoVideo.load();
	
	// Update stack item buttons.
	const backendButtonsContainer = document.getElementById("stats-stack-backend");
	const frontendButtonsContainer = document.getElementById("stats-stack-frontend");
	const toolsButtonsContainer = document.getElementById("stats-stack-tools");

	const buttonsContainers = [
		backendButtonsContainer, 
		frontendButtonsContainer, 
		toolsButtonsContainer
	];

	// Remove all current child nodes (buttons) of stack item containers.
	for (let buttonContainer of buttonsContainers) {
		removeAllButtons(buttonContainer);
	}

	const newStack = {
		"stats-stack-backend": project.stack.backend,
		"stats-stack-frontend": project.stack.frontend,
		"stats-stack-tools": project.stack.tools
	};

	let newStackButtonElements = {};

	// Create new stack item buttons.
	for (let stackCategory in newStack) {
		const stackCategoryItemButtons = [];

		Object.values(newStack[stackCategory]).forEach(categoryItem => {
			const categoryItemButton = createStackItemButton(categoryItem);
			stackCategoryItemButtons.push(categoryItemButton);
		});
		
		// Add all items in category to new button elements object.
		newStackButtonElements[stackCategory] = stackCategoryItemButtons;
	}

	// Add new stack buttons to DOM.
	for (let stackCategory in newStackButtonElements) {
		let containerToEdit = buttonsContainers.filter(
			buttonsContainer => buttonsContainer.id === stackCategory)[0];

		Object.values(newStackButtonElements[stackCategory]).forEach(button => {
			containerToEdit.appendChild(button);
		});
	}
};


/* -------------------------------------------------------------
	Handles project selector clicks.
	Passes target project ID to resumeUpdates to be processed.
------------------------------------------------------------- */
function handleProjectSelectorClick(event) {
	const projectId = event.target.dataset.projectId;
	renderUpdates(projectId);
};


/* ------------------------------------------------------
	Add click listeners to project selector thumbnails.
------------------------------------------------------ */
for(let projectSelector of projectSelectorElements) {
	projectSelector.addEventListener('click', handleProjectSelectorClick, false);
};
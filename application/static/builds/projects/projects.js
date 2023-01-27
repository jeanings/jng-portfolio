/* -------------------------------------------------------
	Button consctructor for stack and project URL items.
------------------------------------------------------- */
class ProjectsButton {
	constructor(buttonType, nameUrlPair) {
		const [ name, url ] = Object.entries(nameUrlPair)[0];
		this.name = name;
		this.url = url;
		this.buttonType = buttonType;
		this.className = buttonType + "__button";
	}

	create() {
		let innerHtml = "";

		switch (this.buttonType) {
			case 'stack':
				innerHtml = this.name;
				break;
			case 'access':
				innerHtml = `Open 
					<span class="${this.className + '__language'}">
						(${this.name})
					</span>
				`;
		}

		// Set up child anchor element.
		const itemAnchor = document.createElement("a");
		itemAnchor.setAttribute("href", this.url);
		itemAnchor.setAttribute("target", "_blank");
		itemAnchor.innerHTML = innerHtml;

		// Set up parent button element.
		const itemButton = document.createElement("button");
		itemButton.setAttribute("class", this.className);
		itemButton.appendChild(itemAnchor);

		return itemButton;
	}
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
			const categoryItemButton = new ProjectsButton('stack', categoryItem); 
			stackCategoryItemButtons.push(
				categoryItemButton.create()
			);
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

	// Update live project link buttons.
	const accessLinksContainer = document.getElementById("access-links");
	removeAllButtons(accessLinksContainer);

	let newProjectAccessButtons = [];

	Object.values(project.url).forEach(projectAccessItem => {
		const projectAccessButton = new ProjectsButton('access', projectAccessItem);
		newProjectAccessButtons.push(
			projectAccessButton.create()
		);
	});  

	for (let accessButton of newProjectAccessButtons) {
		accessLinksContainer.appendChild(accessButton);
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
const projectSelectorElements = document.getElementsByClassName("Projects__selector__button__image");
for(let projectSelector of projectSelectorElements) {
	projectSelector.addEventListener('click', handleProjectSelectorClick, false);
};



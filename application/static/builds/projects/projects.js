// window.onload = function() {
// 	/* ------------------------
// 		Loader for main page.
// 	------------------------ */
	
// };


const projectSelectorElements = document.getElementsByClassName("Projects__selector__button__image");

/* ---------------------------------------------------
	Updates UI elements
--------------------------------------------------- */
function renderUpdates(projectId) {
	const year = document.getElementById("title-project-year");
	const title = document.getElementById("title-text");
	const titleSeparatorBar = document.getElementById("title-separator");
	const objectives = document.getElementById("content-objectives");
	const description = document.getElementById("content-description");
	const demoVideo = document.getElementById("demo-video");
	const demoVideoSrc = document.getElementById("demo-video-src");

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



	// const backEndButtons = [];
	// projectDoc.stack.backend.forEach(item => {
	// 	[stackItemName, stackItemUrl] = Object.entries(item)[0];
	// 	let stackButton = createStackItemButton(stackItemName, stackItemUrl);
	// 	backEndButtons.push(stackButton);
	// });

	// const frontEndButtons = [];
	// projectDoc.stack.frontend.forEach(item => {
	// 	[stackItemName, stackItemUrl] = Object.entries(item)[0];
	// 	let stackButton = createStackItemButton(stackItemName, stackItemUrl);
	// 	frontEndButtons.push(stackButton);
	// });

	// const toolsButtons = [];
	// projectDoc.stack.tools.forEach(item => {
	// 	[stackItemName, stackItemUrl] = Object.entries(item)[0];
	// 	let stackButton = createStackItemButton(stackItemName, stackItemUrl);
	// 	toolsButtons.push(stackButton);
	// });

};


/* -------------------------------------------------------------
	Handles project selector clicks.
	Passes target project ID to resumeUpdates to be processed.
------------------------------------------------------------- */
function handleProjectSelectorClick(event) {
	const projectId = event.target.dataset.projectId
	renderUpdates(projectId);
};


/* ------------------------------------------------------
	Add click listeners to project selector thumbnails.
------------------------------------------------------ */
for(let projectSelector of projectSelectorElements) {
	projectSelector.addEventListener('click', handleProjectSelectorClick, false);
};
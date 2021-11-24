import React, { useEffect } from 'react';
import { useAppSelector } from '../hooks';
import { getMediaQueries } from '../App';
import './Navbar.css';



const Navbar: React.FC = () => {
     /* -----------------------------------------------------
        A main component - container for the title header.
    ------------------------------------------------------ */
    // Selector hooks.
    const languageState = useAppSelector(state => state.language);
    const locale = languageState.en === true ? 'en' : 'jp';


    useEffect(() => {
        handleMenuItems();
        menuToggle();
        blendToggleBackground();
    }, []);
  


    function handleMenuItems() {
        /* ------------------------------------------------------------------
            Changes menu targets to 'top' if currently viewing target page.
        ------------------------------------------------------------------ */
        const currentPath = window.location.pathname;
        const projectsLink = document.getElementById("Navbar_menu_list_item_projects")!;
        const resumeLink = document.getElementById("Navbar_menu_list_item_resume")!;
    
    
        if (currentPath === '/projects') {
            projectsLink.setAttribute('onClick', 'window.location.href="/#"');
        } else if (currentPath === '/resume') {
            resumeLink.setAttribute('onClick', 'window.location.href="/#"');
        }
    }
      
      
    function menuToggle() {
        /* -------------------------------
            Handles menu button toggles.
        ------------------------------- */
        const menu = document.getElementsByClassName("Navbar_menu")[0];
        const menuArrowToggle = document.getElementsByClassName("Navbar_menu_toggle")[0];
        const menuArrowStroke1 = document.getElementById("Navbar_menu_toggle_stroke1")!;
        const menuArrowStroke2 = document.getElementById("Navbar_menu_toggle_stroke2")!;
        const menuList = document.getElementById("Navbar_menu_list")!;
    
        menuArrowToggle.addEventListener('click', function() {
            menu.classList.toggle("toggle");
            menuArrowToggle.classList.toggle("toggle");
            menuArrowStroke1.classList.toggle("toggle");
            menuArrowStroke2.classList.toggle("toggle");
            menuList.classList.toggle("toggle");
        });
    }
    
    
    function blendToggleBackground() {
        /* ------------------------------------------------------------
            Blend menu toggle's background on resume menu item hover.
        ------------------------------------------------------------ */
        const resumeMenuItem = document.getElementById("Navbar_menu_list_item_resume")!;
        const menuArrowToggle = document.getElementsByClassName("Navbar_menu_toggle")[0]!;
    
        resumeMenuItem.addEventListener('mouseover', function() {
            menuArrowToggle.classList.add("resume-hover");
        });
    
        resumeMenuItem.addEventListener('mouseout', function() {
            menuArrowToggle.classList.remove("resume-hover");
        });
    
        // For touch devices.
        resumeMenuItem.addEventListener('touchstart', function() {
            menuArrowToggle.classList.add("resume-hover");
        });
    
        resumeMenuItem.addEventListener('touchend', function() {
            menuArrowToggle.classList.remove("resume-hover");
        });
    }


    function handleMenuItemClicks(event: any) {
        /* --------------------------------------
            Handle clicks to redirect to pages.
        -------------------------------------- */
        event.preventDefault();
        const element = event.target.parentElement.id;

        if (element === "Navbar_menu_list_item_about")
            window.location.href = 'https://jeanings.space/#index_about';
        else if (element === "Navbar_menu_list_item_projects")
            window.location.href = 'https://jeanings.space/projects';
        else if (element === "Navbar_menu_list_item_resume")
            window.location.href = 'https://jeanings.space/resume';
    }


    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'Navbar';


    return (
        <main className={getMediaQueries(classBase, locale)}>

            <nav className={getMediaQueries(classBase.concat('_menu'), locale)}>
                <ul id="Navbar_menu_list">

                    <li id="Navbar_menu_list_item_about" onClick={handleMenuItemClicks}>
                        <a href="#"
                            className={getMediaQueries(classBase.concat('_menu_list_name'), locale)}>
                                about</a>
                        <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                            <path d="M314.21 482.32l-56.77-114.74-44.89-57.39a72.82 72.82 0 01-10.13-37.05V144h15.67a40.22 40.22 0 0140.23 40.22v183.36M127.9 293.05v-74.52S165.16 144 202.42 144M370.1 274.42L304 231M170.53 478.36L224 400" 
                                fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
                                <circle cx="258.32" cy="69.48" r="37.26" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
                        </svg>
                    </li>
                    <li id="Navbar_menu_list_item_projects" onClick={handleMenuItemClicks}>
                        <a href="#" 
                            className={getMediaQueries(classBase.concat('_menu_list_name'), locale)}>
                                projects</a>
                        <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                            <path d="M304 384v-24c0-29 31.54-56.43 52-76 28.84-27.57 44-64.61 44-108 0-80-63.73-144-144-144a143.6 143.6 0 00-144 144c0 41.84 15.81 81.39 44 108 20.35 19.21 52 46.7 52 76v24M224 480h64M208 432h96M256 384V256" 
                                fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
                            <path d="M294 240s-21.51 16-38 16-38-16-38-16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
                        </svg>
                    </li>
                    <li id="Navbar_menu_list_item_resume" onClick={handleMenuItemClicks}>
                        <a href="#" 
                            className={getMediaQueries(classBase.concat('_menu_list_name'), locale)}>
                                résumé</a>
                        <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M32 192L256 64l224 128-224 128L32 192z"/>
                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M112 240v128l144 80 144-80V240M480 368V192M256 320v128"/>
                        </svg>
                    </li>

                </ul>

                <div className={getMediaQueries(classBase.concat('_menu_toggle'), locale)}>
                    <div id="Navbar_menu_toggle_stroke1"></div>
                    <div id="Navbar_menu_toggle_stroke2"></div>
                </div>
            </nav>

        </main>
    );
}


export default Navbar;

















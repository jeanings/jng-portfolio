import React, { useState } from 'react';
import { useMediaQueries } from '../../common/hooks';
import './NavBar.css';


/* =======================================================
    Navigation menu for accessing links to main website.
======================================================= */
const NavBar: React.FC = () => {
    const [ menuToggled, setMenuToggle ] = useState(false);
    const [ resumeItemHovered, setResumeItemHover ] = useState(false);
    const classBase: string = "NavBar";


    /* --------------------------------------------------
        Handles menu toggle and applies styling through
        class name assigns.
    -------------------------------------------------- */
    const onToggleClick = (event: React.SyntheticEvent) => {
        menuToggled === true
            ? setMenuToggle(false)
            : setMenuToggle(true);
    };
    

    /* --------------------------------------------------------------------
        Handles matching background of resume and toggle buttons on hover.
    --------------------------------------------------------------------- */
    const onResumeHover = (event: React.SyntheticEvent) => {
        resumeItemHovered === true
            ? setResumeItemHover(false)
            : setResumeItemHover(true);
    };


    /* -------------------------------------------
        Handle clicks to redirect to pages.
        Mainly to capture clicks over svg icons.
    ------------------------------------------- */
    const onMenuItemClicks = (event: React.SyntheticEvent) => {
        event.preventDefault();
        const clickedElem = event.target as HTMLElement;

        switch(clickedElem.id) {
            case "NavBar__menu-about":
                window.location.href = 'https://jeanings.space/#index_about';
                break;
            case "NavBar__menu-projects":
                window.location.href = 'https://jeanings.space/projects';
                break;
            case "NavBar__menu-resume":
                window.location.href = 'https://jeanings.space/resume';
                break;
        }
    }


    return (
        <main 
            className={ useMediaQueries(classBase) }
            role="menubar"
            aria-label="main site navigation menu">
            <nav 
                className={ useMediaQueries(classBase.concat("__", "menu")) 
                    +   // Add styling if toggled
                    (menuToggled === true
                        ? "toggle"
                        : "") }
                role="navigation"
                aria-label="main site navigation">
                <ul 
                    className={
                        menuToggled === true
                            ? "toggle"
                            : "" }
                    id={ classBase.concat("__", "menu") }
                    role="listbox"
                    aria-label="main site links list">
                    
                    <li 
                        id={ classBase.concat("__", "menu", "-", "about") }
                        role="menuitem"
                        aria-label="main site about link"
                        onClick={ onMenuItemClicks }>
                        <a 
                            href="https://jeanings.space/#index_about"
                            className={ useMediaQueries(classBase.concat("__", "menu", "__", "name")) }>
                                about
                        </a>

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="M314.21 482.32l-56.77-114.74-44.89-57.39a72.82 72.82 0 01-10.13-37.05V144h15.67a40.22 40.22 0 0140.23 40.22v183.36M127.9 293.05v-74.52S165.16 144 202.42 144M370.1 274.42L304 231M170.53 478.36L224 400" 
                                fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
                                <circle cx="258.32" cy="69.48" r="37.26" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
                        </svg>
                    </li>

                    <li
                        id={ classBase.concat("__", "menu", "-", "projects") }
                        role="menuitem"
                        aria-label="main site projects link"
                        onClick={ onMenuItemClicks }>
                        <a 
                            href="https://jeanings.space/projects" 
                            className={ useMediaQueries(classBase.concat("__", "menu", "__", "name")) }>
                                projects
                        </a>

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="M304 384v-24c0-29 31.54-56.43 52-76 28.84-27.57 44-64.61 44-108 0-80-63.73-144-144-144a143.6 143.6 0 00-144 144c0 41.84 15.81 81.39 44 108 20.35 19.21 52 46.7 52 76v24M224 480h64M208 432h96M256 384V256" 
                                fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
                            <path d="M294 240s-21.51 16-38 16-38-16-38-16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
                        </svg>
                    </li>

                    <li 
                        id={ classBase.concat("__", "menu", "-", "resume") }
                        role="menuitem"
                        aria-label="main site resume link"
                        onClick={ onMenuItemClicks }
                        onMouseOver={ onResumeHover }
                        onMouseOut={ onResumeHover }>
                        <a 
                            href="https://jeanings.space/resume" 
                            className={ useMediaQueries(classBase.concat("__", "menu", "__", "name")) }>
                                résumé
                        </a>

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M32 192L256 64l224 128-224 128L32 192z"/>
                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M112 240v128l144 80 144-80V240M480 368V192M256 320v128"/>
                        </svg>
                    </li>

                </ul>

                <div 
                    className={ useMediaQueries(classBase.concat("__", "menu-toggle")) 
                        +   // Add styling if toggled
                        (menuToggled === true
                            ? "toggle"
                            : "") 
                        +   // Add background matching with resume button
                        (resumeItemHovered === true
                            ? " ".concat("blend")
                            : "") }
                    role="button"
                    aria-label="open main site navigation menu"
                    onClick={ onToggleClick }>
                    <div 
                        className={
                            menuToggled === true
                                ? "toggle"
                                : "" }
                        id={ classBase.concat("__", "menu-toggle", "__", "stroke1") }>
                    </div>
                    <div 
                        className={
                            menuToggled === true
                                ? "toggle"
                                : "" }
                        id={ classBase.concat("__","menu-toggle", "__", "stroke2") }>
                    </div>
                </div>
            </nav>

        </main>
    );
}


export default NavBar;

















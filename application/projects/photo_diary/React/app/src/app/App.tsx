import React from 'react';
import { useAppSelector, useMediaQueries } from '../common/hooks';
import TimelineBar from '../features/TimelineBar/TimelineBar';
import FilterDrawer from '../features/FilterDrawer/FilterDrawer';
import MapCanvas from '../features/MapCanvas/MapCanvas';
import SideFilmStrip from '../features/SideFilmStrip/SideFilmStrip';
import Toolbar from '../features/Toolbar/Toolbar';
import NavBar from '../features/NavBar/NavBar';
import Login from '../features/Login/Login';
import './App.css';

export const DEV_MODE = process.env.REACT_APP_DEV_MODE;
export const apiUrl: string = DEV_MODE === 'True'
    ? process.env.REACT_APP_API_URL_DEV!
    : process.env.REACT_APP_API_URL!;
export const loginUrl: string = DEV_MODE === 'True'
    ? process.env.REACT_APP_LOGIN_URL_DEV!
    : process.env.REACT_APP_LOGIN_URL!;
export const logoutUrl: string = DEV_MODE === 'True'
    ? process.env.REACT_APP_LOGOUT_URL_DEV!
    : process.env.REACT_APP_LOGOUT_URL!;
export const updateUrl: string = DEV_MODE === 'True'
    ? process.env.REACT_APP_UPDATE_URL_DEV!
    : process.env.REACT_APP_UPDATE_URL!;
export const createUrl: string = DEV_MODE === 'True'
    ? process.env.REACT_APP_CREATE_URL_DEV!
    : process.env.REACT_APP_CREATE_URL!;

/* =====================================================================
    Entry point of application.  Renders the base structure of the app.
===================================================================== */
const App: React.FunctionComponent = () => {
    const isLoaded = useAppSelector(state => state.timeline.responseStatus);
    const classBase: string = 'App';

    /* ------------------
        Media queries.
    ------------------ */
    const root = document.querySelector(":root") as HTMLElement;
    const media = useMediaQueries("root").replace("root ", "");

    switch(media) {
        case 'mobile port':
            root.style.setProperty("--root-font-size", "12px");
            break;
        
        case 'mobile land':
            root.style.setProperty("--root-font-size", "12px");
            break;

        case 'portable port':
            root.style.setProperty("--root-font-size", "15px");
            break;

        case 'portable land':
            root.style.setProperty("--root-font-size", "15px");
            break;

        case 'screen-lt-1080 port':
            root.style.setProperty("--root-font-size", "12px");
            break;

        case 'screen-lt-1080 land':
            root.style.setProperty("--root-font-size", "12px");
            break;

        case 'screen-1080 port':
            root.style.setProperty("--root-font-size", "16px");
            break;

        case 'screen-1080 land':
            root.style.setProperty("--root-font-size", "16px");
            break;

        case 'screen-1440 port':
            root.style.setProperty("--root-font-size", "24px");
            break;

        case 'screen-1440 land':
            root.style.setProperty("--root-font-size", "24px");
            break;

        case 'screen-4k port':
            root.style.setProperty("--root-font-size", "38px");
            break;

        case 'screen-4k land':
            root.style.setProperty("--root-font-size", "38px");
            break;
    };

    
    return (
        <div 
            className={ useMediaQueries(classBase) 
                +   // Add styling for loading: hidden if initial fetch not loaded 
                (isLoaded === 'uninitialized'
                    ? " " + "loading"
                    : "") }>
            <NavBar />
            <TimelineBar />
            <FilterDrawer />
            <MapCanvas />
            <SideFilmStrip />
            <Toolbar />
            <Login />
        </div>
    );
};


export default App;

import React from 'react';
import { useMediaQueries } from '../common/hooks';
import TimelineBar from '../features/TimelineBar/TimelineBar';
import FilterDrawer from '../features/FilterDrawer/FilterDrawer';
import MapCanvas from '../features/MapCanvas/MapCanvas';
import SideFilmStrip from '../features/SideFilmStrip/SideFilmStrip';
import Toolbar from '../features/Toolbar/Toolbar';
import './App.css';

export const DEV_MODE = process.env.REACT_APP_DEV_MODE;
export const apiUrl: string = DEV_MODE === 'True'
    ? process.env.REACT_APP_API_URL_DEV!
    : process.env.REACT_APP_API_URL!;

/* =====================================================================
    Entry point of application.  Renders the base structure of the app.
===================================================================== */
const App: React.FC = () => {
    // CSS Classes
    const classBase: string = 'App';

    return (
        <div className={useMediaQueries(classBase)}>
            <TimelineBar />
            <FilterDrawer />
            <MapCanvas />
            <SideFilmStrip />
            <Toolbar />
        </div>
    )
}


export default App;

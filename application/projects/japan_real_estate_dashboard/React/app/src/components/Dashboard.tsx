import React from 'react';
import { useAppSelector } from '../hooks';
import DashboardMap from '../containers/DashboardMap';
import DashboardCharts from '../containers/DashboardCharts';
import { getMediaQueries } from '../App';
import './Dashboard.css';



const Dashboard: React.FC = () => {
     /* --------------------------------------------------------------------
        A main component - container for the map and chart visualizations.
    --------------------------------------------------------------------- */
    // Selector hooks.
    const languageState = useAppSelector(state => state.language);
    const locale = languageState.en === true ? 'en' : 'jp';


    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'Dashboard';


    return (
        <main className={getMediaQueries(classBase, locale)}>
            <DashboardMap />
            <DashboardCharts />
        </main>
    );
}


export default Dashboard;

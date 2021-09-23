import React from 'react';
import DashboardMap from '../containers/DashboardMap';
import DashboardCharts from '../containers/DashboardCharts';
import './Dashboard.css';



const Dashboard: React.FC = () => {
     /* --------------------------------------------------------------------
        A main component - container for the map and chart visualizations.
    --------------------------------------------------------------------- */
    return (
        <main className="Dashboard">
            <DashboardMap />
            <DashboardCharts />
        </main>
    );
}


export default Dashboard;

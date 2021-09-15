import React from 'react';
import DashboardMap from '../containers/DashboardMap';
import DashboardCharts from '../containers/DashboardCharts';
import './Dashboard.css';



const Dashboard: React.FC = () => {
    return (
        <main className="Dashboard">
            <DashboardMap />
            <DashboardCharts />
        </main>
    );
}


export default Dashboard;

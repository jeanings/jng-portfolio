import React, { useEffect } from 'react';
import DashboardMap from '../containers/DashboardMap';
import './Dashboard.css';



const Dashboard: React.FC = () => {

    return (
        <main className="Dashboard">
            <DashboardMap />

        </main>
    
    );
}


export default Dashboard;

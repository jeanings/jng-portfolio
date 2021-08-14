import React from 'react';
import DashboardCharts from '../containers/DashboardCharts';
import './Dashboard.css';



const Dashboard: React.FC = () => {
    return (
        <main className="Dashboard">
            

            <DashboardCharts />
        </main>
    );
}



export default Dashboard;

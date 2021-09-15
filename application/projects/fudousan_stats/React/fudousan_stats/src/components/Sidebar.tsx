import React from 'react';
import SidebarTabs from '../containers/SidebarTabs';
import SidebarOptions from '../containers/SidebarOptions';
import SidebarRegions from '../containers/SidebarRegions';
import './Sidebar.css';



const Sidebar: React.FC = () => {    
    return (
        <aside className='Sidebar'>
            <>
                <SidebarTabs />
                <SidebarOptions />
                <SidebarRegions />
            </>        
        </aside>
    );
}

export default Sidebar;

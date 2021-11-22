import React from 'react';
import SidebarTabs from '../containers/SidebarTabs';
import SidebarOptions from '../containers/SidebarOptions';
import SidebarRegions from '../containers/SidebarRegions';
import { useMediaQuery } from 'react-responsive';
import './Sidebar.css';



const Sidebar: React.FC = () => {
    /* -----------------------------------------------------
        A main component - container for the sidebar menu.
    ----------------------------------------------------- */
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

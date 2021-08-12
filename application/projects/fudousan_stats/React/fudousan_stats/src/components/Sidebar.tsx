import React from 'react';
import SidebarTabs from '../containers/SidebarTabs';
import SidebarOptions from '../containers/SidebarOptions';
import './Sidebar.css';



const Sidebar: React.FC = () => {    
    return (
        <aside className='Sidebar'>
            <>
                <SidebarTabs />
                <SidebarOptions />
            </>        
        </aside>
    );
}

export default Sidebar;

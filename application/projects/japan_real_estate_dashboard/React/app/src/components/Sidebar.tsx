import React from 'react';
import { useAppSelector } from '../hooks';
import SidebarTabs from '../containers/SidebarTabs';
import SidebarOptions from '../containers/SidebarOptions';
import SidebarRegions from '../containers/SidebarRegions';
import { getMediaQueries } from '../App';
import './Sidebar.css';



const Sidebar: React.FC = () => {
    /* -----------------------------------------------------
        A main component - container for the sidebar menu.
    ----------------------------------------------------- */
    const languageState = useAppSelector(state => state.language);
    const locale = languageState.en === true ? 'en' : 'jp';


    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'Sidebar';


    return (
        <aside className={getMediaQueries(classBase, locale)}>
            <>
                <SidebarTabs />
                <SidebarOptions />
                <SidebarRegions />
            </>        
        </aside>
    );
}


export default Sidebar;

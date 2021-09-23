import React, { useEffect } from 'react';
import { useAppDispatch } from './hooks';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { mongoDbFetchRegions } from './slices/menuApiSlice';
import { PayloadAction } from '@reduxjs/toolkit';
import './App.css';



const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    /* ---------------------------------
      Initial render menu item request.
    --------------------------------- */
    const initParam: object = {'country': 'j'};
    
    dispatch(mongoDbFetchRegions(initParam));
  }, []);

  
  return (
    <div className='App'>
      <Header />
      <Sidebar />
      <Dashboard />
    </div>
  );
}


export default App;

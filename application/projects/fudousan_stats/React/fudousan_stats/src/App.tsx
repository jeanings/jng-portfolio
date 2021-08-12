import React, { useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { PayloadAction } from '@reduxjs/toolkit';
import './App.css';




const App: React.FC = () => {
 
  return (
    <div className='App'>
      <Header />
      <Sidebar />
      <Dashboard />
    </div>
  );
}


export default App;
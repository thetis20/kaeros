import React, { useEffect, useState } from 'react';
import './App.css';
import './theme.css';
import Dashboard from './component/Dashboard/Dashboard';
import Session from './component/Session/Session';

function App() {

  switch (window.electronAPI.mode) {
    case 'main':
      return <Dashboard />;
    case 'session':
      return <Session />;
    default:
      return 'loading...';
  }
}

export default App;

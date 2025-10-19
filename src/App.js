import React, { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import Dashboard from './component/Dashboard/Dashboard';
import Time from './component/Time/Time';
import Dubbing from './component/Dubbing/Dubbing';
import Gallery from './component/Gallery/Gallery';

function App() {

  switch (window.electronAPI.mode) {
    case 'main':
      return <Dashboard />;
    case 'time':
      return <Time />;
    case 'dubbing':
      return <Dubbing />;
    case 'gallery':
      return <Gallery />;
    default:
      return 'loading...';
  }
}

export default App;
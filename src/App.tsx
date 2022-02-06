import React from 'react';
import logo from './logo.svg';
import Cropper from '@/pages/cropper';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* <img src={logo} className="App-logo" alt="logo" /> */}
      <Cropper />
    </div>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './client/components/Home';
import LoginPage from './client/components/LoginPage';
import RegisterPage from './client/components/RegisterPage';
import GameMenu from './client/components/GameMenu'; // Import GameMenu
import MapMenu from './client/components/MapMenu'; // Import MapMenu

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/gamemenu" element={<GameMenu />} /> 
        <Route path="/mapmenu" element={<MapMenu />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import DemoIntake from './pages/DemoIntake';
import DemoResults from './pages/DemoResults';

gsap.registerPlugin(ScrollTrigger);

function App() {
  return (
    <Router>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo" element={<DemoIntake />} />
          <Route path="/demo/results" element={<DemoResults />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;

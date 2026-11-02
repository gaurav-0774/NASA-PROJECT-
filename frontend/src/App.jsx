// App.jsx — Root application component with routing and page transitions
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { MissionProvider } from './context/MissionContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import BodyMap from './pages/BodyMap';
import LogData from './pages/LogData';
import Charts from './pages/Charts';
import Tasks from './pages/Tasks';
import Alerts from './pages/Alerts';
import Learn from './pages/Learn';
import MoodCheckin from './pages/MoodCheckin';

export default function App() {
  const location = useLocation();

  return (
    <MissionProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/body-map" element={<BodyMap />} />
            <Route path="/log" element={<LogData />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/mood" element={<MoodCheckin />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </MissionProvider>
  );
}

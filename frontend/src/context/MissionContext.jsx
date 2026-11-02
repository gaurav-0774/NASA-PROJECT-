// context/MissionContext.jsx — Global mission state context providing environment, mission day, and health summary
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const MissionContext = createContext(null);

const ENVIRONMENTS = [
  { id: 'iss', name: 'ISS (Low Earth Orbit)', color: '#22d3ee' },
  { id: 'spacecraft', name: 'Spacecraft (Deep Space)', color: '#f97316' },
  { id: 'lunar', name: 'Lunar Base', color: '#a78bfa' },
  { id: 'mars', name: 'Mars Base / Surface', color: '#ef4444' },
];

export function MissionProvider({ children }) {
  const [environment, setEnvironment] = useState('iss');
  const [missionDay, setMissionDay] = useState(30);
  const [healthSummary, setHealthSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHealthSummary();
      setHealthSummary(res.data);
      if (res.data.latestLog?.day) {
        setMissionDay(res.data.latestLog.day);
      } else if (res.data.mission_day) {
        setMissionDay(res.data.mission_day);
      }
      if (res.data.environment) {
        setEnvironment(res.data.environment);
      }
    } catch (err) {
      console.error('Failed to load health summary:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  const value = {
    environment,
    setEnvironment,
    missionDay,
    setMissionDay,
    healthSummary,
    refreshSummary,
    loading,
    error,
    environments: ENVIRONMENTS,
  };

  return (
    <MissionContext.Provider value={value}>
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
}

export default MissionContext;

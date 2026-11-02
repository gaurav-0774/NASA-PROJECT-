// components/layout/Sidebar.jsx — Left navigation sidebar with links, icons, and demo data button
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  PenLine,
  BarChart3,
  CheckSquare,
  AlertTriangle,
  BookOpen,
  Brain,
  Rocket,
  Database,
  Menu,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { useMission } from '../../context/MissionContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/body-map', label: 'Body Map', icon: User },
  { path: '/log', label: 'Log Data', icon: PenLine },
  { path: '/charts', label: 'Charts', icon: BarChart3 },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { path: '/learn', label: 'Learn', icon: BookOpen },
  { path: '/mood', label: 'Mood Check', icon: Brain },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  const { refreshSummary } = useMission();
  const location = useLocation();

  const handleSeedDemo = async () => {
    setSeeding(true);
    setSeedMessage('');
    try {
      await api.seedDemo();
      setSeedMessage('Demo data loaded!');
      await refreshSummary();
      setTimeout(() => setSeedMessage(''), 3000);
    } catch (err) {
      setSeedMessage('Failed to load demo data');
      setTimeout(() => setSeedMessage(''), 3000);
    } finally {
      setSeeding(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">AstroVitals</h1>
            <p className="text-[10px] text-cyan-400/60 uppercase tracking-widest">Mission Health</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Demo Data Button */}
      <div className="p-4 border-t border-white/10">
        {seedMessage && (
          <p className={`text-xs mb-2 text-center ${seedMessage.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
            {seedMessage}
          </p>
        )}
        <button
          onClick={handleSeedDemo}
          disabled={seeding}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400 text-sm font-medium hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300 disabled:opacity-50"
        >
          <Database className="w-4 h-4" />
          {seeding ? 'Loading...' : 'Load Demo Data'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass text-white"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 glass border-r border-white/10 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 glass border-r border-white/10 z-50"
              style={{ background: 'rgba(10, 14, 39, 0.95)' }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

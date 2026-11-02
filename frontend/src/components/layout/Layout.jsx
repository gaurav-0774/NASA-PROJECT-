// components/layout/Layout.jsx — Main layout wrapper with sidebar, top bar, star field, and content area
import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import StarField from '../common/StarField';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#111640] to-[#0a0e27]">
      <StarField />
      <Sidebar />
      <div className="lg:ml-64 min-h-screen flex flex-col relative z-10">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

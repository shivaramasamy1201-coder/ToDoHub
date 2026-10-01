import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MobileNavigation from '../components/MobileNavigation';
import PageTransition from '../components/PageTransition';
import FloatingAIAgent from '../components/assistant/FloatingAIAgent';

/**
 * AppLayout
 * Core responsive layout wrapper for ToDoHub
 */
const AppLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const handleMouseMove = (e) => {
    // Only track mouse position on non-touch devices
    if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
      const { clientX, clientY } = e;
      e.currentTarget.style.setProperty('--mouse-x', `${clientX}px`);
      e.currentTarget.style.setProperty('--mouse-y', `${clientY}px`);
    }
  };

  return (
    <div className="app-layout" onMouseMove={handleMouseMove}>
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Body */}
      <div className="app-main-wrapper">
        <Header onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        
        <main className="app-content">
          <PageTransition key={location.pathname}>
            {children}
          </PageTransition>
        </main>
      </div>

      {/* Floating AI Agent Button & Chat Panel */}
      <FloatingAIAgent />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavigation />
    </div>
  );
};

export default AppLayout;

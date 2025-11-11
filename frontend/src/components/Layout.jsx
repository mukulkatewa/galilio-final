import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1f2e' }}>
      <Navbar />
      <Sidebar />
      
      {/* Main Content */}
      <main className="pt-16 md:pl-64 pb-16 md:pb-0">
        <div className="max-w-screen-xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

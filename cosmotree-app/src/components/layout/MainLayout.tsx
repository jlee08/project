import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header fixed={true} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

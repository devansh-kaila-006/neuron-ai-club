
import React from 'react';
// @ts-ignore - Fixing react-router-dom member export false positive
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  // Fix: Cast motion to any to resolve property missing errors in strict environments
  const m = motion as any;
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Departments', path: '/departments' },
    { label: 'Mascot', path: '/mascot' },
    { label: 'Team', path: '/team' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-0.35 group">
          {/* Fix: Using casted motion component to resolve type mismatch */}
          <m.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-10 h-10 flex items-center justify-center"
          >
            <span className="text-3xl font-black text-indigo-500 leading-none select-none">Ø</span>
          </m.div>
          <span className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent font-mono">
            NEURØN
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
                location.pathname === item.path ? 'text-indigo-500' : 'text-gray-400'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/join"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Join Us
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gray-400" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        /* Fix: Using casted motion component to resolve type mismatch */
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 right-0 glass border-b border-white/10 p-6 flex flex-col gap-4"
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-gray-300 hover:text-indigo-500"
            >
              {item.label}
            </Link>
          ))}
        </m.div>
      )}
    </nav>
  );
};

export default Navbar;

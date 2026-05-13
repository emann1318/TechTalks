import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Terminal, 
  User, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  PlusCircle,
  LayoutDashboard,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const hideSearch = ['/login', '/register'].includes(location.pathname);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Latest', path: '/' },
    { name: 'Feed', path: '/feed', protected: true },
    { name: 'Admin', path: '/admin', admin: true },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600 font-mono">
                TechTalks
              </span>
            </Link>
          </div>

          {/* Desktop Search */}
          {!hideSearch && (
            <div className="hidden md:flex flex-1 items-center justify-center px-8">
              <form onSubmit={handleSearch} className="w-full max-w-lg relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tutorials, reviews, or tags..."
                  className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </form>
            </div>
          )}

          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              (!link.protected || user) && (!link.admin || (user && user?.role === 'admin')) && (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors"
                >
                  {link.name}
                </Link>
              )
            ))}

            {user ? (
              <div className="flex items-center space-x-6">
                <Link 
                  to="/create" 
                  className="hidden sm:flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="font-bold text-sm">Write a Talk</span>
                </Link>
                <Link to="/notifications" className="text-gray-500 hover:text-indigo-600 relative">
                  <Bell className="h-6 w-6" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
                      alt={user?.username}
                      className="h-8 w-8 rounded-full border border-gray-200"
                    />
                  </button>
                  <div className="absolute right-0 w-48 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="h-4 w-4 mr-2" /> Profile
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <LayoutDashboard className="h-4 w-4 mr-2" /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => logout(true)}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-indigo-600 p-2"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {!hideSearch && (
                <form onSubmit={handleSearch} className="mb-4 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-gray-100 rounded-lg py-2 pl-10 pr-4"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </form>
              )}
              {user && (
                <Link 
                  to="/create" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md font-bold mb-4"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Write a Talk</span>
                </Link>
              )}
              {navLinks.map((link) => (
                (!link.protected || user) && (!link.admin || (user && user.role === 'admin')) && (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  >
                    {link.name}
                  </Link>
                )
              ))}
              {!user ? (
                <div className="pt-4 border-t border-gray-100 flex flex-col space-y-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-center text-gray-600 font-medium">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-center font-medium">
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100 flex flex-col space-y-2">
                   <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-gray-700">Profile</Link>
                   <button onClick={() => { logout(true); setIsMenuOpen(false); }} className="px-3 py-2 text-left text-red-600">Logout</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

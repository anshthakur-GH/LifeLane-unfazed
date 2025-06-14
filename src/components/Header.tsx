import logo from '../assets/logo.png'
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, User, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('user_name');
    setIsLoggedIn(!!token);
    setUserName(name || '');
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('user_name');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 h-16 md:h-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="flex justify-between items-center w-full py-2 md:py-4">
          {/* Logo on the left */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-10 md:h-16 w-auto" />
          </Link>

          {/* Centered Navigation */}
          <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-8 border border-header/50 rounded-full px-6 py-2 bg-transparent">
              <Link
                to="/"
                className={`${isActive('/') ? 'text-primary' : 'text-header hover:text-primary'} text-base md:text-xl font-semibold px-4 md:px-6 py-2 md:py-3 rounded transition-colors`}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className={`${isActive('/dashboard') ? 'text-primary' : 'text-header hover:text-primary'} text-base md:text-xl font-semibold px-4 md:px-6 py-2 md:py-3 rounded transition-colors`}
              >
                Dashboard
              </Link>
              <Link
                to="/contact"
                className={`${isActive('/contact') ? 'text-primary' : 'text-header hover:text-primary'} text-base md:text-xl font-semibold px-4 md:px-6 py-2 md:py-3 rounded transition-colors`}
              >
                Contact
              </Link>
            </div>
          </nav>

          {/* User Profile or Login on the right */}
          <div className="hidden md:block">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                  <User className="w-5 h-5 text-primary" />
                  <span className="text-header font-medium">{userName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-primary to-emergency text-white px-6 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-base font-semibold shadow-lg transition-all hover:from-primary hover:to-emergency"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-header" />
            ) : (
              <Menu className="w-6 h-6 text-header" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-t shadow-lg">
            <div className="flex flex-col space-y-4 p-4">
              <Link
                to="/"
                className={`${isActive('/') ? 'text-primary' : 'text-header'} text-base font-medium py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className={`${isActive('/dashboard') ? 'text-primary' : 'text-header'} text-base font-medium py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/contact"
                className={`${isActive('/contact') ? 'text-primary' : 'text-header'} text-base font-medium py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              {isLoggedIn ? (
                <>
                  <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                    <User className="w-5 h-5 text-primary" />
                    <span className="text-header font-medium">{userName}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors py-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-primary to-emergency text-white px-6 py-3 rounded-full text-base font-semibold shadow-lg transition-all hover:from-primary hover:to-emergency w-fit"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
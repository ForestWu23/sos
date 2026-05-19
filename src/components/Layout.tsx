import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navItems = [
  { key: 'jsonformatter', label: 'JsonFormatter', path: '/jsonformatter' },
  { key: 'epochconverter', label: 'EpochConverter', path: '/epochconverter' },
  { key: 'diffchecker', label: 'DiffChecker', path: '/diffchecker' },
  { key: 'urldecoder', label: 'UrlDecoder', path: '/urldecoder' },
  { key: 'base64', label: 'Base64', path: '/base64' },
  { key: 'jwtdecoder', label: 'JwtDecoder', path: '/jwtdecoder' },
  { key: 'yamlvalidator', label: 'YamlValidator', path: '/yamlvalidator' },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 flex items-center px-4">
        <NavLink
          to="/"
          className="text-xl font-bold tracking-widest text-blue-600 no-underline mr-6 flex-shrink-0"
        >
          SOS
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors no-underline
                ${isActive
                  ? 'text-blue-600 bg-blue-50 font-medium'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto p-1.5 rounded text-gray-600 hover:bg-gray-100"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-md md:hidden">
          <nav className="flex flex-col py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2.5 text-sm no-underline transition-colors
                  ${isActive
                    ? 'text-blue-600 bg-blue-50 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      <main className="mt-16 flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;

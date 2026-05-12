import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, ClipboardCheck, Users, BarChart3, Settings, LogOut } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/reviewer/dashboard', icon: LayoutDashboard },
  { label: 'Proposals', path: '/reviewer/proposals', icon: FileText },
  { label: 'Evaluations', path: '/reviewer/evaluations', icon: ClipboardCheck },
  { label: 'Reviewers', path: '/reviewer/reviewers', icon: Users },
  { label: 'Reports', path: '/reviewer/reports', icon: BarChart3 },
  { label: 'Settings', path: '/reviewer/settings', icon: Settings },
];

function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-xl font-bold">ProposalX</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link key={label} to={path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}>
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-700">
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white w-full transition">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

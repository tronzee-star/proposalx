import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, LogOut } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative max-w-md w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search proposals, submitters, institutions..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">3</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-700">{user?.name || 'User'}</p>
            <p className="text-gray-400 text-xs capitalize">{user?.role || ''}</p>
          </div>
        </div>
        <button onClick={logout} className="text-gray-400 hover:text-red-500 lg:hidden">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;

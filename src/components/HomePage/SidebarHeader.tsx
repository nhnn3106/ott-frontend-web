import React, { useState } from 'react';
import { Menu, MoreVertical, User, Shield, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarHeaderProps {
  onMenuClick: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onMenuClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=4F46E5&color=fff`}
            alt={user.fullName}
            className="w-10 h-10 rounded-full border-2 border-blue-500"
          />
          <div className="hidden sm:block">
            <h2 className="font-semibold text-gray-800">{user.fullName}</h2>
            <p className="text-xs text-gray-500">Hoạt động</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <a href="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700">
                  <User className="w-4 h-4" />
                  <span>Trang cá nhân</span>
                </a>
                <a href="/security" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700">
                  <Shield className="w-4 h-4" />
                  <span>Bảo mật</span>
                </a>
                <a href="/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700">
                  <Settings className="w-4 h-4" />
                  <span>Cài đặt</span>
                </a>
                <div className="border-t border-gray-200 my-2"></div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
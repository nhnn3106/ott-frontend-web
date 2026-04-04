import React from 'react';
import { Phone, Mail, QrCode } from 'lucide-react';

interface LoginTabsProps {
  activeTab: 'phone' | 'email' | 'qr';
  setActiveTab: (tab: 'phone' | 'email' | 'qr') => void;
}

export const LoginTabs: React.FC<LoginTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'phone' as const, label: 'Số điện thoại', icon: Phone },
    { id: 'email' as const, label: 'Email OTP', icon: Mail },
    { id: 'qr' as const, label: 'QR Code', icon: QrCode }
  ];

  return (
    <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all font-medium ${
            activeTab === tab.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
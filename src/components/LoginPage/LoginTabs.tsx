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
    <div className="grid grid-cols-3 gap-2 p-1 bg-primary-50 rounded-xl border border-primary-100">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all font-medium ${
            activeTab === tab.id
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-primary-600 hover:text-primary-800'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
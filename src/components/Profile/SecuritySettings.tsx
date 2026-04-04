// components/Profile/SecuritySettings.tsx
import React, { useState } from 'react';
import { Shield, Lock, Key, Mail, Phone, Smartphone, Trash2, ChevronRight } from 'lucide-react';
import type { UserProfileResponse } from '../../types';

interface SecuritySettingsProps {
  user: UserProfileResponse;
  onChangePassword: () => void;
  onSetPassword: () => void;
  onChangeEmail: () => void;
  onChangePhone: () => void;
  onManageSessions: () => void;
  onToggle2FA: () => void;
  onDeleteAccount: () => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  user,
  onChangePassword,
  onSetPassword,
  onChangeEmail,
  onChangePhone,
  onManageSessions,
  onToggle2FA,
  onDeleteAccount,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const SecurityOption = ({
    icon: Icon,
    title,
    description,
    onClick,
    danger,
  }: {
    icon: any;
    title: string;
    description: string;
    onClick: () => void;
    danger?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left ${
        danger ? 'hover:bg-red-50' : ''
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        danger ? 'bg-red-100' : 'bg-blue-100'
      }`}>
        <Icon className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-blue-600'}`} />
      </div>
      <div className="flex-1">
        <h3 className={`font-medium ${danger ? 'text-red-600' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-2">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Bảo mật & Tài khoản</h2>

      {/* Two-Factor Authentication */}
      <SecurityOption
        icon={Shield}
        title={user.is2FAEnabled ? 'Tắt xác thực 2 bước' : 'Bật xác thực 2 bước'}
        description={
          user.is2FAEnabled
            ? 'Xác thực 2 bước đang được bật'
            : 'Tăng cường bảo mật tài khoản của bạn'
        }
        onClick={onToggle2FA}
      />

      {/* Password */}
      <SecurityOption
        icon={Lock}
        title={user.hasPassword ? 'Đổi mật khẩu' : 'Đặt mật khẩu'}
        description={
          user.hasPassword
            ? 'Cập nhật mật khẩu của bạn'
            : 'Tạo mật khẩu để đăng nhập bằng số điện thoại'
        }
        onClick={user.hasPassword ? onChangePassword : onSetPassword}
      />

      {/* Email */}
      <SecurityOption
        icon={Mail}
        title="Thay đổi email"
        description={user.email || 'Chưa có email'}
        onClick={onChangeEmail}
      />

      {/* Phone */}
      <SecurityOption
        icon={Phone}
        title="Thay đổi số điện thoại"
        description={user.phone}
        onClick={onChangePhone}
      />

      {/* Sessions */}
      <SecurityOption
        icon={Smartphone}
        title="Quản lý thiết bị"
        description="Xem và quản lý các thiết bị đã đăng nhập"
        onClick={onManageSessions}
      />

      {/* Divider */}
      <div className="border-t my-4" />

      {/* Delete Account */}
      {showDeleteConfirm ? (
        <div className="p-4 bg-red-50 rounded-xl space-y-3">
          <p className="text-sm text-red-800 font-medium">
            Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                onDeleteAccount();
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      ) : (
        <SecurityOption
          icon={Trash2}
          title="Xóa tài khoản"
          description="Xóa vĩnh viễn tài khoản của bạn"
          onClick={() => setShowDeleteConfirm(true)}
          danger
        />
      )}
    </div>
  );
};
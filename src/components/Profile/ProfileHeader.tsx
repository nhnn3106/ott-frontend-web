// components/Profile/ProfileHeader.tsx
import React from 'react';
import { Camera, Mail, Phone, Calendar, Shield } from 'lucide-react';
import type { UserProfileResponse } from '../../types';

interface ProfileHeaderProps {
  user: UserProfileResponse;
  onEditAvatar: () => void;
  onEditCover: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onEditAvatar,
  onEditCover,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
        {user.coverUrl && (
          <img
            src={user.coverUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <button
          onClick={onEditCover}
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Camera className="w-4 h-4" />
          Đổi ảnh bìa
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-8 pb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={onEditAvatar}
              className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Camera className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Name & Info */}
          <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
            <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
            {user.bio && (
              <p className="text-gray-600 mt-1">{user.bio}</p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{user.phone}</span>
              </div>
              {user.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Tham gia {formatDate(user.createdAt)}</span>
              </div>
              {user.is2FAEnabled && (
                <div className="flex items-center gap-1 text-green-600">
                  <Shield className="w-4 h-4" />
                  <span>2FA Đã bật</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
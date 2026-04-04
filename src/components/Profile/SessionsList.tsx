// components/Profile/SessionsList.tsx
import React from 'react';
import { Smartphone, Monitor, Tablet, X, Shield, MapPin, Clock } from 'lucide-react';
import type { SessionInfo, DeviceType } from '../../types';

interface SessionsListProps {
  sessions: SessionInfo[];
  onRevokeSession: (sessionId: string) => void;
  onRevokeAllOthers: () => void;
}

export const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  onRevokeSession,
  onRevokeAllOthers,
}) => {
  const getDeviceIcon = (deviceType?: DeviceType) => {
    switch (deviceType) {
      case 'MOBILE':
        return Smartphone;
      case 'TABLET':
        return Tablet;
      case 'DESKTOP':
      default:
        return Monitor;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  const otherSessions = sessions.filter(s => !s.isCurrent);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Thiết bị đã đăng nhập</h2>
        {otherSessions.length > 0 && (
          <button
            onClick={onRevokeAllOthers}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Đăng xuất tất cả thiết bị khác
          </button>
        )}
      </div>

      <div className="space-y-3">
        {sessions.map((session) => {
          const DeviceIcon = getDeviceIcon(session.deviceType);
          
          return (
            <div
              key={session.id}
              className={`p-4 rounded-xl border ${
                session.isCurrent
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  session.isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <DeviceIcon className={`w-5 h-5 ${
                    session.isCurrent ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      {session.deviceName || 'Thiết bị không xác định'}
                    </h3>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded">
                        Hiện tại
                      </span>
                    )}
                    {session.twoFactorVerified && (
                      <Shield className="w-4 h-4 text-green-600" />
                    )}
                  </div>

                  <div className="mt-1 space-y-1 text-sm text-gray-600">
                    {session.ipAddress && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{session.ipAddress}</span>
                        {session.location && <span>• {session.location}</span>}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Hoạt động {formatDate(session.lastActiveAt || session.createdAt)}</span>
                    </div>
                    {session.loginMethod && (
                      <span className="text-xs text-gray-500">
                        Đăng nhập bằng {session.loginMethod.toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>

                {!session.isCurrent && (
                  <button
                    onClick={() => onRevokeSession(session.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors group"
                  >
                    <X className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {sessions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không có thiết bị nào đã đăng nhập
          </div>
        )}
      </div>
    </div>
  );
};
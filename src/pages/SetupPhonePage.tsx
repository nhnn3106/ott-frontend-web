// pages/SetupPhonePage.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageCircle } from 'lucide-react';

interface LocationState {
  tempToken: string;
  googleUserInfo?: {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
  };
}

const SetupPhonePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();
  
  const state = location.state as LocationState;
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!state?.tempToken) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate phone
    if (!phone || phone.length < 10) {
      setError('Vui lòng nhập số điện thoại hợp lệ');
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.completeGoogleRegistration({
        tempToken: state.tempToken,
        phone: phone,
      });

      if (response.result?.token && response.result?.refreshToken) {
        await loginWithToken(response.result.token, response.result.refreshToken);
        navigate('/home', { replace: true });
      }
    } catch (err: any) {
      console.error('Setup phone error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Riff
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hoàn tất đăng ký</h2>
          <p className="text-gray-600">Vui lòng cung cấp số điện thoại của bạn</p>
        </div>

        {/* User Info */}
        {state.googleUserInfo && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center gap-3">
            {state.googleUserInfo.picture && (
              <img 
                src={state.googleUserInfo.picture} 
                alt={state.googleUserInfo.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{state.googleUserInfo.name}</p>
              <p className="text-sm text-gray-500">{state.googleUserInfo.email}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
            </button>
          </form>
        </div>

        {/* Back to login */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupPhonePage;
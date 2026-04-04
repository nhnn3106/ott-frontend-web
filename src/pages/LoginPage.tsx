import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import {
  LoginTabs,
  PhoneLoginForm,
  EmailOTPLoginForm,
  QRCodeLogin,
  GoogleLoginButton
} from '../components/LoginPage';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'phone' | 'email' | 'qr'>('phone');

  const handleLoginSuccess = () => {
    navigate('/home', { replace: true });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-linear-to-br from-primary-700 to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-linear-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
              Riff
            </span>
          </a>
          <p className="text-primary-700">Đăng nhập để tiếp tục</p>
        </div>

        {/* Login Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <LoginTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {activeTab === 'phone' && <PhoneLoginForm onSuccess={handleLoginSuccess} />}
          {activeTab === 'email' && <EmailOTPLoginForm onSuccess={handleLoginSuccess} />}
          {activeTab === 'qr' && <QRCodeLogin onSuccess={handleLoginSuccess} />}

          {/* Google Login - Only show for phone and email tabs */}
          {activeTab !== 'qr' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Hoặc</span>
                </div>
              </div>

              <GoogleLoginButton />
            </>
          )}
        </div>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Chưa có tài khoản?{' '}
            <a href="/register" className="text-primary-700 hover:text-primary-800 font-semibold">
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
// pages/TwoFactorAuthPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Copy, Check, AlertCircle, CheckCircle, Lock, Info } from 'lucide-react';
import { useTwoFactor } from '../hooks/useTwoFactor';
import { useAuth } from '../context/AuthContext';
import { useAccount } from '../hooks/useAccount';

const TwoFactorAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { status, requestEnableOtp, enable, requestDisableOtp, disable, isLoading } = useTwoFactor();
  const { setPassword: setPasswordApi, isLoading: isSettingPassword } = useAccount();
  
  const [mode, setMode] = useState<'view' | 'enable' | 'disable'>('view');
  const [step, setStep] = useState<'check-password' | 'set-password' | 'otp' | 'backup'>('check-password');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Enable 2FA
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  
  // Disable 2FA
  const [password, setPassword] = useState('');
  const [disableOtp, setDisableOtp] = useState('');
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    if (status?.enabled) {
      setMode('view');
    }
  }, [status]);

  // Enable 2FA Flow
  const handleCheckPassword = async () => {
    setError('');
    
    // Kiểm tra user có password chưa - sử dụng hasPassword từ UserResponse
    const hasPassword = user?.hasPassword === true;
    
    if (!hasPassword) {
      setStep('set-password');
      return;
    }
    
    // Nếu có password rồi, gửi OTP luôn
    try {
      await requestEnableOtp();
      setSuccess('Mã OTP đã được gửi đến email của bạn');
      setStep('otp');
    } catch (err: any) {
      // Xử lý các lỗi cụ thể
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể gửi mã OTP';
      
      if (errorMessage.includes('already enabled') || errorMessage.includes('đã được bật')) {
        setError('Xác thực 2 bước đã được bật cho tài khoản này');
        setMode('view');
      } else if (errorMessage.includes('password required') || errorMessage.includes('yêu cầu mật khẩu')) {
        setError('Bạn cần tạo mật khẩu trước khi bật xác thực 2 bước');
        setStep('set-password');
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    try {
      // Gọi API setPassword từ useAccount hook
      await setPasswordApi({
        password: newPassword,
        confirmPassword: confirmPassword
      });
      
      setSuccess('Đã tạo mật khẩu thành công');
      setNewPassword('');
      setConfirmPassword('');
      
      // Đợi 1 giây rồi gửi OTP
      setTimeout(() => {
        setSuccess('');
        handleRequestEnableOtp();
      }, 1000);
    } catch (err: any) {
      const errorMessage = err?.message || 'Không thể tạo mật khẩu';
      setError(errorMessage);
    }
  };

  const handleRequestEnableOtp = async () => {
    setError('');
    setSuccess('');
    
    try {
      await requestEnableOtp();
      setSuccess('Mã OTP đã được gửi đến email của bạn');
      setStep('otp');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể gửi mã OTP';
      
      if (errorMessage.includes('already enabled') || errorMessage.includes('đã được bật')) {
        setError('Xác thực 2 bước đã được bật cho tài khoản này');
        setMode('view');
      } else if (errorMessage.includes('password required') || errorMessage.includes('yêu cầu mật khẩu')) {
        setError('Bạn cần tạo mật khẩu trước khi bật xác thực 2 bước');
        setStep('set-password');
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số');
      return;
    }
    
    try {
      const result = await enable({ otp });
      if (result && result.backupCodes) {
        setBackupCodes(result.backupCodes);
        setSuccess('Xác thực 2 bước đã được bật thành công!');
        setStep('backup');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Mã OTP không hợp lệ';
      
      if (errorMessage.includes('invalid') || errorMessage.includes('không hợp lệ') || errorMessage.includes('expired') || errorMessage.includes('hết hạn')) {
        setError('Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.');
        setOtp('');
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleCopyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleFinishEnable = () => {
    setMode('view');
    setStep('check-password');
    setOtp('');
    setBackupCodes([]);
    setNewPassword('');
    setConfirmPassword('');
  };

  // Disable 2FA Flow
  const handleRequestDisableOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await requestDisableOtp(password);
      setSuccess('Mã OTP đã được gửi đến email của bạn');
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Mật khẩu không chính xác');
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await disable({ password, otp: disableOtp });
      setSuccess('Xác thực 2 bước đã được tắt');
      setTimeout(() => {
        setMode('view');
        setStep('check-password');
        setPassword('');
        setDisableOtp('');
        navigate('/profile');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Không thể tắt xác thực 2 bước');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Quay lại</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Xác thực 2 bước
            </h1>
            <p className="text-blue-100">
              {status?.enabled 
                ? 'Tài khoản đang được bảo vệ' 
                : 'Tăng cường bảo mật tài khoản'}
            </p>
          </div>

          <div className="p-8">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm font-medium">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            {mode === 'view' && (
              <div className="space-y-6">
                {status?.enabled ? (
                  <>
                    <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-900">Đang được bảo vệ</p>
                          <p className="text-sm text-green-700">Xác thực 2 bước đang hoạt động</p>
                        </div>
                      </div>
                    </div>

                    {status.enabledAt && (
                      <div className="bg-gray-50 rounded-xl p-5 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Được bật vào:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(status.enabledAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {status.lastUsedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Sử dụng gần nhất:</span>
                            <span className="font-medium text-gray-900">
                              {new Date(status.lastUsedAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Mã dự phòng còn lại:</span>
                          <span className="font-semibold text-blue-600">{status.remainingBackupCodes} mã</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setMode('disable');
                        setStep('password');
                        setError('');
                        setSuccess('');
                      }}
                      className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Tắt xác thực 2 bước
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-900 font-medium mb-2">
                            Bảo vệ tài khoản của bạn
                          </p>
                          <p className="text-sm text-blue-800 mb-3">
                            Xác thực 2 bước yêu cầu mã OTP từ email khi đăng nhập bằng mật khẩu, giúp bảo vệ tài khoản khỏi truy cập trái phép.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 pl-8">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <span>Bảo mật cao hơn cho tài khoản</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <span>Áp dụng cho đăng nhập bằng mật khẩu</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <span>Mã dự phòng để khôi phục</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setMode('enable');
                        setStep('check-password');
                        setError('');
                        setSuccess('');
                        handleCheckPassword();
                      }}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Bật xác thực 2 bước
                    </button>
                  </>
                )}
              </div>
            )}

            {mode === 'enable' && step === 'set-password' && (
              <div className="space-y-6">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900 mb-1">Yêu cầu tạo mật khẩu</p>
                    <p className="text-yellow-800">
                      Bạn đã đăng ký bằng Google và chưa có mật khẩu. Vui lòng tạo mật khẩu để bật xác thực 2 bước.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Tối thiểu 8 ký tự"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('view')}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSetPassword}
                    disabled={isLoading || isSettingPassword || !newPassword || !confirmPassword}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading || isSettingPassword ? 'Đang xử lý...' : 'Tiếp tục'}
                  </button>
                </div>
              </div>
            )}

            {mode === 'enable' && step === 'otp' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    Mã OTP đã được gửi đến
                  </p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    Nhập mã xác thực
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center text-3xl tracking-[0.5em] font-bold transition-all"
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Mã gồm 6 chữ số
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('check-password')}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleEnable2FA}
                    disabled={isLoading || otp.length !== 6}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? 'Đang xác thực...' : 'Xác nhận'}
                  </button>
                </div>
              </div>
            )}

            {mode === 'enable' && step === 'backup' && (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-green-900 mb-1">
                        Xác thực 2 bước đã được bật!
                      </p>
                      <p className="text-green-800">
                        Hãy lưu các mã dự phòng bên dưới. Bạn sẽ cần chúng nếu không thể truy cập email.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-900">
                      Mã dự phòng ({backupCodes.length} mã)
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyBackupCodes}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      {copiedCodes ? (
                        <>
                          <Check className="w-4 h-4" />
                          Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Sao chép tất cả
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                      {backupCodes.map((code, index) => (
                        <div 
                          key={index} 
                          className="font-mono text-sm text-gray-800 bg-white px-3 py-2 rounded-lg border border-gray-200"
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-900">
                      <span className="font-semibold">Quan trọng:</span> Lưu các mã này ở nơi an toàn. Mỗi mã chỉ có thể sử dụng một lần và sẽ giúp bạn đăng nhập khi không có quyền truy cập email.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleFinishEnable}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Hoàn tất
                </button>
              </div>
            )}

            {mode === 'disable' && step === 'password' && (
              <div className="space-y-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-red-900 mb-1">Cảnh báo bảo mật</p>
                      <p className="text-red-800">
                        Tắt xác thực 2 bước sẽ làm giảm mức độ bảo mật của tài khoản bạn.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhập mật khẩu để xác nhận
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu của bạn"
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('view')}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestDisableOtp}
                    disabled={isLoading || !password}
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? 'Đang xác thực...' : 'Tiếp tục'}
                  </button>
                </div>
              </div>
            )}

            {mode === 'disable' && step === 'otp' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    Mã OTP đã được gửi đến
                  </p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    Nhập mã xác thực
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={disableOtp}
                      onChange={(e) => setDisableOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-center text-3xl tracking-[0.5em] font-bold transition-all"
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Mã gồm 6 chữ số
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('password')}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleDisable2FA}
                    disabled={isLoading || disableOtp.length !== 6}
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? 'Đang tắt...' : 'Tắt xác thực 2 bước'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthPage;
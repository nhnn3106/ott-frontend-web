import React, { useEffect, useRef, useCallback } from 'react';
import { QrCode, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useQRCode } from '../../hooks/useQRCode';
import { useAuth } from '../../context/AuthContext';
import { QrCodeStatus } from '../../types/enums';
import { Alert } from '../common/Alert';

interface QRCodeLoginProps {
  onSuccess: () => void;
}

export const QRCodeLogin: React.FC<QRCodeLoginProps> = ({ onSuccess }) => {
  const { qrCode, qrStatus, generateQRCode, loading, error } = useQRCode();
  const { loginWithToken } = useAuth();

  // Dùng ref để tránh stale closure trong useEffect
  const loginWithTokenRef = useRef(loginWithToken);
  const onSuccessRef = useRef(onSuccess);
  const hasLoggedIn = useRef(false);

  useEffect(() => {
    loginWithTokenRef.current = loginWithToken;
  }, [loginWithToken]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    generateQRCode();
  }, []);

  useEffect(() => {
    // Guard: chỉ chạy 1 lần khi CONFIRMED có đủ token
    if (
      hasLoggedIn.current ||
      qrStatus?.status !== QrCodeStatus.CONFIRMED ||
      !qrStatus.sessionToken ||
      !qrStatus.refreshToken
    ) {
      return;
    }

    hasLoggedIn.current = true;

    loginWithTokenRef
      .current(qrStatus.sessionToken, qrStatus.refreshToken)
      .then(() => {
        setTimeout(() => onSuccessRef.current(), 1000);
      })
      .catch((err: Error) => {
        console.error('Failed to login with QR tokens:', err);
        hasLoggedIn.current = false; // reset để có thể thử lại
      });
  }, [qrStatus?.status, qrStatus?.sessionToken, qrStatus?.refreshToken]);

  const handleGenerateNew = useCallback(() => {
    hasLoggedIn.current = false;
    generateQRCode();
  }, [generateQRCode]);

  const renderQRContent = () => {
    if (loading && !qrCode) {
      return (
        <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="aspect-square bg-red-50 rounded-xl flex flex-col items-center justify-center gap-4 p-6">
          <XCircle className="w-16 h-16 text-red-600" />
          <p className="text-sm text-red-600 text-center">Không thể tạo QR code</p>
          <button
            onClick={handleGenerateNew}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      );
    }

    if (qrStatus?.status === QrCodeStatus.CONFIRMED) {
      return (
        <div className="aspect-square bg-green-50 rounded-xl flex flex-col items-center justify-center gap-4">
          <CheckCircle className="w-16 h-16 text-green-600" />
          <p className="text-sm text-green-600 font-medium">Đăng nhập thành công!</p>
        </div>
      );
    }

    if (qrStatus?.status === QrCodeStatus.SCANNED) {
      return (
        <div className="aspect-square bg-blue-50 rounded-xl flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          <p className="text-sm text-blue-600 font-medium">Đang chờ xác nhận...</p>
        </div>
      );
    }

    if (
      qrStatus?.status === QrCodeStatus.EXPIRED ||
      qrCode?.status === QrCodeStatus.EXPIRED
    ) {
      return (
        <div className="aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-4 p-6">
          <XCircle className="w-16 h-16 text-gray-600" />
          <p className="text-sm text-gray-600 text-center">QR code đã hết hạn</p>
          <button
            onClick={handleGenerateNew}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Tạo mã mới
          </button>
        </div>
      );
    }

    if (qrCode?.qrData) {
      return (
        <div className="aspect-square bg-white p-4 rounded-xl border-2 border-primary-100">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode.qrData)}`}
            alt="QR Code"
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    return (
      <div className="aspect-square bg-linear-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
        <QrCode className="w-32 h-32 text-primary-600" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">Đăng nhập bằng QR Code</h3>
        <p className="text-sm text-gray-600">Quét mã QR bằng ứng dụng mobile</p>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="bg-white p-8 rounded-2xl border-2 border-gray-200">
        {renderQRContent()}
      </div>

      {qrCode && qrStatus?.status !== QrCodeStatus.CONFIRMED && (
        <div className="text-center text-sm text-gray-500">
          Mã sẽ hết hạn sau {qrCode.expirySeconds}s
        </div>
      )}

      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 font-semibold">
            1
          </div>
          <p>Mở ứng dụng Riff trên điện thoại</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 font-semibold">
            2
          </div>
          <p>Chọn biểu tượng quét QR</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 font-semibold">
            3
          </div>
          <p>Quét mã QR này để đăng nhập</p>
        </div>
      </div>
    </div>
  );
};
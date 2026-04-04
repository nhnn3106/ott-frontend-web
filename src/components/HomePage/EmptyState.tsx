import React from 'react';
import { MessageCircle } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
          <MessageCircle className="w-12 h-12 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Chọn một cuộc trò chuyện
          </h3>
          <p className="text-gray-600">
            Chọn một người từ danh sách để bắt đầu nhắn tin
          </p>
        </div>
      </div>
    </div>
  );
};
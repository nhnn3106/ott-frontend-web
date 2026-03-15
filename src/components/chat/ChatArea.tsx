import React from 'react';
import { MessageCircle, Send, Phone, Video, MoreVertical } from 'lucide-react';
import Avatar from '../common/Avatar';
import type { ChatAreaProps } from '../../interfaces';

const ChatArea: React.FC<ChatAreaProps> = ({ conversation }) => {
  const { currentUser } = useUser();
  const { messages, loadMessages } = useChat(conversation?._id, currentUser?._id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 🔥 3. THÊM STATE QUẢN LÝ MEDIA VIEWER ---
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  // --- 🔥 4. THÊM HÀM MỞ VIEWER ---
  const handleOpenMedia = (msgId: string) => {
    setSelectedMediaId(msgId);
    setViewerOpen(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar 
              src={getConversationAvatar()}
              name={getConversationName()}
              size={48}
              className="ring-2 ring-gray-100"
            />
            <div>
              <h2 className="font-semibold text-gray-900">{getConversationName()}</h2>
              <p className="text-sm text-gray-500">
                {conversation.type === 'group' 
                  ? `${(conversation.participants?.length || 0) + 1} thành viên`
                  : 'Đang hoạt động'
                }
              </p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 bg-white overflow-y-auto">
        <div className="text-center text-gray-500 py-8">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-900">Bắt đầu cuộc trò chuyện với {getConversationName()}</p>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span>Gửi</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
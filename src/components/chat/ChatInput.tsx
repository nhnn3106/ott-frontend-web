import { ImageIcon, SendHorizonal, Loader2, Paperclip, Smile } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MessageService } from "../../services";
import type { ChatInputProps } from "../../types/message.type";
import { EMOJI_PICKER_LIST } from "../../utils/emojiUtils";

export const ChatInput = ({
  conversationId,
  senderId,
  onSendSuccess,
}: ChatInputProps) => {
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSendText = async () => {
    if (!text.trim()) return;
    try {
      await MessageService.sendMessage(conversationId, senderId, text, "text", 0);
      setText("");
      onSendSuccess();
    } catch {
      alert("Gửi tin nhắn thất bại");
    }
  };

  // Nhiều ảnh → 1 message với mảng keys
  const uploadImages = async (files: File[]) => {
    const MAX = 50 * 1024 * 1024;
    const valid = files.filter((f) => {
      if (f.size > MAX) { alert(`"${f.name}" quá lớn (giới hạn 50MB).`); return false; }
      return true;
    });
    if (valid.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);
    try {
      const keys = await Promise.all(
        valid.map(async (file) => {
          const { uploadUrl, key } = await MessageService.getPresignedUrl(file.name, file.type);
          await MessageService.uploadFileToS3(uploadUrl, file);
          return key;
        }),
      );
      setUploadProgress(80);
      await MessageService.sendMessage(conversationId, senderId, keys, "image", 0);
      setUploadProgress(100);
      onSendSuccess();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi upload ảnh. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 1 file (video / tệp) → 1 message riêng
  const uploadSingleFile = async (file: File) => {
    const MAX = 50 * 1024 * 1024;
    if (file.size > MAX) { alert(`"${file.name}" quá lớn (giới hạn 50MB).`); return; }

    setIsUploading(true);
    setUploadProgress(10);
    try {
      const { uploadUrl, fileCategory, key } = await MessageService.getPresignedUrl(file.name, file.type);
      setUploadProgress(40);
      await MessageService.uploadFileToS3(uploadUrl, file);
      setUploadProgress(70);
      await MessageService.sendMessage(conversationId, senderId, key, fileCategory, file.size, file.name);
      setUploadProgress(100);
      onSendSuccess();
    } catch (err) {
      console.error(err);
      alert(`Lỗi khi upload "${file.name}".`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // --- Handlers (luôn sync để giữ FileList còn hiệu lực) ---

  // Icon ảnh: chỉ ảnh, nhiều cái → 1 message
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length > 0) uploadImages(files);
  };

  // Icon tệp: mọi loại file
  // - ảnh → gom nhóm → 1 message
  // - video / file khác → mỗi cái 1 message (tuần tự)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    const images = files.filter((f) => f.type.startsWith("image/"));
    const others = files.filter((f) => !f.type.startsWith("image/"));

    const run = async () => {
      if (images.length > 0) await uploadImages(images);
      for (const file of others) await uploadSingleFile(file);
    };
    run();
  };

  const handleEmojiClick = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  return (
    <div className="p-4 bg-white border-t border-gray-100 relative">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-full mb-2 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50"
          style={{ width: "360px", maxHeight: "320px" }}
        >
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Chọn emoji</span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <div
            className="grid grid-cols-8 gap-1 overflow-y-auto custom-scrollbar"
            style={{ maxHeight: "240px" }}
          >
            {EMOJI_PICKER_LIST.map((item, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(item.emoji)}
                className="text-2xl p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer flex flex-col items-center justify-center group relative"
                title={`${item.label} - ${item.shortcode}`}
              >
                <span>{item.emoji}</span>
                <span className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {item.shortcode}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress bar */}
      {isUploading && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Đang tải lên...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-[#EFDCCB] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 bg-gray-50 px-2 py-1.5 rounded-full border border-gray-200">
        {/* Input ẩn — chỉ ảnh, nhiều file */}
        <input
          type="file"
          ref={imageInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />

        {/* Input ẩn — mọi loại file, nhiều file */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="*/*"
          multiple
          onChange={handleFileChange}
        />

        {/* Nút gửi ảnh */}
        <button
          onClick={() => imageInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
          title="Gửi ảnh (nhiều ảnh = 1 tin nhắn)"
        >
          {isUploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <ImageIcon size={20} />
          )}
        </button>

        {/* Nút gửi tệp (ảnh/video/file đều được) */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
          title="Gửi tệp (ảnh/video/file — có thể chọn nhiều)"
        >
          <Paperclip size={20} />
        </button>

        {/* Nút emoji */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          disabled={isUploading}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
          title="Chọn emoji"
        >
          <Smile size={20} />
        </button>

        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isUploading && handleSendText()}
          placeholder={isUploading ? "Đang tải lên..." : "Nhập tin nhắn..."}
          disabled={isUploading}
          className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm"
        />

        {text.trim() && !isUploading && (
          <button
            onClick={handleSendText}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-[#EFDCCB] rounded-full transition-colors"
            title="Gửi tin nhắn"
          >
            <SendHorizonal size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

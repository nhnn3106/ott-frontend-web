import type { FileMessageProps } from "../../../types/message.type";
import {
  formatFileSize,
  getFileExtension,
  getFileNameFromUrl,
} from "../../../utils";

export const FileMessage = ({ url, fileName, size }: FileMessageProps) => {
  const finalFileName = fileName || getFileNameFromUrl(url, "file");
  const fileExt = getFileExtension(finalFileName);
  const fileSize = size ? formatFileSize(size) : "Unknown";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 min-w-[200px] group"
    >
      {/* File Icon */}
      <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <span className="text-blue-600 font-bold text-[10px]">{fileExt}</span>
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
          {finalFileName}
        </div>
        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
          {fileSize}
          <span className="ml-1">• Cloud</span>
        </div>
      </div>

      {/* Download Icon */}
      <div className="shrink-0">
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      </div>
    </a>
  );
};

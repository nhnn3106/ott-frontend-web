// src/utils/fileUtils.ts
import { URL_S3 } from "../config/api.config"; // Kiểm tra lại đường dẫn import dựa trên cấu trúc folder của bạn

// 1. Hàm format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 2. Hàm lấy tên file từ URL
export const getFileNameFromUrl = (
  url: string,
  fallback: string = "file",
): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split("/").pop() || fallback;
    // Loại bỏ unique ID prefix (format: uniqueId_filename)
    const match = fileName.match(/^[a-f0-9]+_(.+)$/);
    return match ? match[1] : fileName;
  } catch {
    return fallback;
  }
};

// 3. Hàm lấy extension từ filename
export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()?.toUpperCase() || "FILE" : "FILE";
};

// 4. Hàm lấy full URL
export const getFullUrl = (content: any): string => {
  const path = Array.isArray(content) ? content[0] : content;

  if (!path) return "";
  if (path.startsWith("http")) return path;

  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${URL_S3}${cleanPath}`;
};

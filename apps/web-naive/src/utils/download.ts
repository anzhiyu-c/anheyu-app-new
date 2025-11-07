/**
 * 从 URL 中提取文件扩展名
 * @param url 文件 URL
 * @returns 文件扩展名
 */
export function getFileExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('.');
    return parts.length > 1 ? parts[parts.length - 1] || 'jpg' : 'jpg';
  } catch {
    // 如果不是完整 URL，尝试从字符串中提取
    const parts = url.split('.');
    return parts.length > 1 ? parts[parts.length - 1] || 'jpg' : 'jpg';
  }
}

/**
 * 格式化文件大小
 * @param size 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(size: number): string {
  if (size >= 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  } else if (size >= 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else {
    return `${size} B`;
  }
}

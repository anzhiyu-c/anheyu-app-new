/*
 * @Description: 相册相关 API
 * @Author: 安知鱼
 * @Date: 2025-11-07
 * @LastEditTime: 2025-11-07
 * @LastEditors: 安知鱼
 */
import { requestClient } from '#/api/request';

/**
 * 相册接口
 */
export interface Album {
  id: string;
  name: string;
  description?: string;
  cover: string;
  photoCount: number;
  categoryId?: string;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 相册分类接口
 */
export interface AlbumCategory {
  id: string;
  name: string;
  description?: string;
  albumCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 相册照片接口
 */
export interface AlbumPhoto {
  id: string;
  albumId: string;
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  size?: number;
  createdAt: string;
}

/**
 * 分页参数
 */
export interface PageParams {
  page: number;
  pageSize: number;
  categoryId?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取相册列表（分页）
 */
export async function getAlbums(
  params: PageParams,
): Promise<PageResponse<Album>> {
  return requestClient.get('/api/albums', { params });
}

/**
 * 获取相册详情
 */
export async function getAlbumById(id: string): Promise<Album> {
  return requestClient.get(`/api/albums/${id}`);
}

/**
 * 创建相册
 */
export async function createAlbum(data: Partial<Album>): Promise<Album> {
  return requestClient.post('/api/albums', data);
}

/**
 * 更新相册
 */
export async function updateAlbum(
  id: string,
  data: Partial<Album>,
): Promise<Album> {
  return requestClient.put(`/api/albums/${id}`, data);
}

/**
 * 删除相册
 */
export async function deleteAlbum(id: string): Promise<void> {
  return requestClient.delete(`/api/albums/${id}`);
}

/**
 * 批量删除相册
 */
export async function batchDeleteAlbums(ids: string[]): Promise<void> {
  return requestClient.post('/api/albums/batch-delete', { ids });
}

/**
 * 获取相册分类列表
 */
export async function getAlbumCategories(): Promise<AlbumCategory[]> {
  return requestClient.get('/api/album-categories');
}

/**
 * 获取相册分类详情
 */
export async function getAlbumCategoryById(id: string): Promise<AlbumCategory> {
  return requestClient.get(`/api/album-categories/${id}`);
}

/**
 * 创建相册分类
 */
export async function createAlbumCategory(
  data: Partial<AlbumCategory>,
): Promise<AlbumCategory> {
  return requestClient.post('/api/album-categories', data);
}

/**
 * 更新相册分类
 */
export async function updateAlbumCategory(
  id: string,
  data: Partial<AlbumCategory>,
): Promise<AlbumCategory> {
  return requestClient.put(`/api/album-categories/${id}`, data);
}

/**
 * 删除相册分类
 */
export async function deleteAlbumCategory(id: string): Promise<void> {
  return requestClient.delete(`/api/album-categories/${id}`);
}

/**
 * 获取相册中的照片列表
 */
export async function getAlbumPhotos(
  albumId: string,
  params?: PageParams,
): Promise<PageResponse<AlbumPhoto>> {
  return requestClient.get(`/api/albums/${albumId}/photos`, { params });
}

/**
 * 上传相册照片
 */
export async function uploadAlbumPhoto(
  albumId: string,
  file: File,
): Promise<AlbumPhoto> {
  const formData = new FormData();
  formData.append('file', file);
  return requestClient.post(`/api/albums/${albumId}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 批量上传相册照片
 */
export async function batchUploadAlbumPhotos(
  albumId: string,
  files: File[],
): Promise<AlbumPhoto[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  return requestClient.post(`/api/albums/${albumId}/photos/batch`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 删除相册照片
 */
export async function deleteAlbumPhoto(
  albumId: string,
  photoId: string,
): Promise<void> {
  return requestClient.delete(`/api/albums/${albumId}/photos/${photoId}`);
}

/**
 * 批量删除相册照片
 */
export async function batchDeleteAlbumPhotos(
  albumId: string,
  photoIds: string[],
): Promise<void> {
  return requestClient.post(`/api/albums/${albumId}/photos/batch-delete`, {
    photoIds,
  });
}

/**
 * 更新照片信息
 */
export async function updateAlbumPhoto(
  albumId: string,
  photoId: string,
  data: Partial<AlbumPhoto>,
): Promise<AlbumPhoto> {
  return requestClient.put(`/api/albums/${albumId}/photos/${photoId}`, data);
}

/**
 * 导出相册数据
 */
export async function exportAlbums(params?: any): Promise<Blob> {
  return requestClient.get('/api/albums/export', {
    params,
    responseType: 'blob',
  });
}

/**
 * 导入相册数据
 */
export async function importAlbums(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  return requestClient.post('/api/albums/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

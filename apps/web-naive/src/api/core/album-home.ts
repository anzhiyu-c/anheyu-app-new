/*
 * @Description: 相册前台 API
 * @Author: 安知鱼
 * @Date: 2025-11-07
 * @LastEditTime: 2025-11-07 14:42:55
 * @LastEditors: 安知鱼
 */
import { requestClient } from '#/api/request';

/**
 * 响应数据类型
 */
export interface AlbumResponseData {
  list: AlbumItem[];
  total: number;
  pageSize: number;
  pageNum: number;
}

/**
 * 相册图片项
 */
export interface AlbumItem {
  id: string;
  imageUrl: string;
  downloadUrl?: string;
  width: number;
  height: number;
  fileSize?: number;
  tags?: string;
  viewCount?: number;
  downloadCount?: number;
  thumbParam?: string;
  bigParam?: string;
  createTime?: string;
  categoryId?: number;
  displayOrder?: number;
}

/**
 * 分类
 */
export interface AlbumCategory {
  id: number;
  name: string;
  description?: string;
  coverImage?: string;
  displayOrder?: number;
}

/**
 * 获取公共相册图片列表
 */
export async function publicWallpapert(params: {
  page: number;
  pageSize: number;
  sort?: string;
  categoryId?: number | null;
}) {
  return requestClient.get<AlbumResponseData>('/public/albums', { params });
}

/**
 * 获取公开的相册分类列表
 */
export async function getPublicAlbumCategories() {
  return requestClient.get<AlbumCategory[]>('/public/album-categories');
}

/**
 * 更新相册图片统计信息 (浏览量、下载量等)
 */
export async function updateWallpaperStat(params: {
  id: string;
  type: string;
}) {
  return requestClient.put<null>(
    `/public/stat/${params.id}?type=${params.type}`,
  );
}

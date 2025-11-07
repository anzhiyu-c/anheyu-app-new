/*
 * @Description:
 * @Author: 安知鱼
 * @Date: 2025-11-07 12:34:01
 * @LastEditTime: 2025-11-07 13:35:58
 * @LastEditors: 安知鱼
 */
/*
 * @Description: 相册路由配置（外部页面）
 * @Author: 安知鱼
 * @Date: 2025-11-07
 * @LastEditTime: 2025-11-07
 * @LastEditors: 安知鱼
 */
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'AlbumHome',
    path: '/album',
    component: () => import('#/views/album/index.vue'),
    meta: {
      ignoreAccess: true,
      title: '相册',
    },
  },
];

export default routes;

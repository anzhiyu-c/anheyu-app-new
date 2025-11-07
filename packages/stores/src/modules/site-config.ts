import { acceptHMRUpdate, defineStore } from 'pinia';

interface SiteConfig {
  [key: string]: any;
  /** 应用名称 */
  APP_NAME?: string;
  /** 应用版本 */
  APP_VERSION?: string;
  /** ICP 备案号 */
  ICP_NUMBER?: string;
  /** 用户默认头像 */
  USER_AVATAR?: string;
  /** 关于页面链接 */
  ABOUT_LINK?: string;
  /** API 地址 */
  API_URL?: string;
  /** 站点地址 */
  SITE_URL?: string;
  /** 图标地址 */
  ICON_URL?: string;
  /** 横版 Logo (日间) */
  LOGO_HORIZONTAL_DAY?: string;
  /** 横版 Logo (夜间) */
  LOGO_HORIZONTAL_NIGHT?: string;
  /** Logo 地址 */
  LOGO_URL?: string;
  /** Logo 地址 192x192 */
  LOGO_URL_192x192?: string;
  /** Logo 地址 512x512 */
  LOGO_URL_512x512?: string;
  /** 默认缩略图参数 */
  DEFAULT_THUMB_PARAM?: string;
  /** 默认大图参数 */
  DEFAULT_BIG_PARAM?: string;
  /** 站点公告 */
  SITE_ANNOUNCEMENT?: string;
}

interface SiteConfigState {
  /**
   * 站点配置
   */
  siteConfig: SiteConfig;
  /**
   * 是否已加载
   */
  isLoaded: boolean;
  /**
   * 加载中
   */
  loading: boolean;
}

// 缓存键名
const CACHE_KEY = 'anheyu-site-config';
// 缓存过期时间：24 小时
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

interface CachedData {
  config: SiteConfig;
  timestamp: number;
}

/**
 * @zh_CN 站点配置相关
 */
export const useSiteConfigStore = defineStore('core-site-config', {
  actions: {
    /**
     * 更新站点配置
     */
    updateSiteConfig(config: Partial<SiteConfig>) {
      this.siteConfig = { ...this.siteConfig, ...config };
      this._updateCache();
    },

    /**
     * 设置站点配置
     */
    setSiteConfig(config: SiteConfig) {
      this.siteConfig = config;
      this._updateCache();
    },

    /**
     * 获取站点配置 - 外部调用的主方法
     * @param fetchFn 获取配置的函数，由应用层传入
     */
    async fetchSiteConfig(fetchFn?: () => Promise<SiteConfig>, force = false) {
      // 如果已加载且不强制刷新，直接返回
      if (this.isLoaded && !force) {
        return this.siteConfig;
      }

      // 如果正在加载中，等待加载完成
      if (this.loading) {
        return new Promise((resolve) => {
          const interval = setInterval(() => {
            if (!this.loading) {
              clearInterval(interval);
              resolve(this.siteConfig);
            }
          }, 100);
        });
      }

      // 尝试从缓存加载
      if (!force) {
        const cached = this._loadFromCache();
        if (cached) {
          this.siteConfig = cached;
          this.isLoaded = true;
          return cached;
        }
      }

      // 从服务器加载
      if (fetchFn) {
        return await this._fetchFromServer(fetchFn);
      }

      return this.siteConfig;
    },

    /**
     * 从服务器获取站点配置
     */
    async _fetchFromServer(fetchFn: () => Promise<SiteConfig>) {
      this.loading = true;
      console.log('🌐 开始从服务器获取站点配置...');

      try {
        const config = await fetchFn();

        console.log('🌐 服务器返回的配置:', config);

        if (config) {
          this.setSiteConfig(config);
          this.isLoaded = true;
          console.log('✅ 站点配置已更新到 store');
          return config;
        }
      } catch (error) {
        console.error('❌ 获取站点配置失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 从缓存加载配置
     */
    _loadFromCache(): SiteConfig | null {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (!cachedData) {
          console.log('💾 无本地缓存');
          return null;
        }

        const { config, timestamp }: CachedData = JSON.parse(cachedData);
        const now = Date.now();

        // 检查缓存是否过期
        if (now - timestamp < CACHE_EXPIRATION_TIME) {
          const cacheAgeMinutes = Math.floor((now - timestamp) / 1000 / 60);
          console.log(`💾 使用缓存配置 (缓存了 ${cacheAgeMinutes} 分钟)`);
          return config;
        } else {
          // 缓存过期，清除
          console.log('💾 缓存已过期，清除缓存');
          localStorage.removeItem(CACHE_KEY);
          return null;
        }
      } catch (error) {
        console.error('❌ 读取缓存配置失败:', error);
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
    },

    /**
     * 更新缓存
     */
    _updateCache() {
      try {
        const dataToCache: CachedData = {
          config: this.siteConfig,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
      } catch (error) {
        console.error('保存配置到缓存失败:', error);
      }
    },

    /**
     * 清除缓存
     */
    clearCache() {
      try {
        localStorage.removeItem(CACHE_KEY);
        this.isLoaded = false;
      } catch (error) {
        console.error('清除配置缓存失败:', error);
      }
    },

    /**
     * 重置状态
     */
    $reset() {
      this.siteConfig = {};
      this.isLoaded = false;
      this.loading = false;
    },
  },
  getters: {
    /**
     * 获取应用名称
     */
    appName: (state) => state.siteConfig.APP_NAME || '安和鱼',
    /**
     * 获取 Logo
     */
    logo: (state) => state.siteConfig.LOGO_URL_192x192 || '/logo.svg',
    /**
     * 获取站点地址（去除末尾斜杠）
     */
    siteUrl: (state) => {
      const url = state.siteConfig.SITE_URL;
      return url?.endsWith('/') ? url.slice(0, -1) : url;
    },
    /**
     * 获取 API 地址（确保末尾有斜杠）
     */
    apiUrl: (state) => {
      const url = state.siteConfig.API_URL;
      return url && !url.endsWith('/') ? `${url}/` : url;
    },
  },
  state: (): SiteConfigState => ({
    isLoaded: false,
    loading: false,
    siteConfig: {},
  }),
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useSiteConfigStore, hot));
}

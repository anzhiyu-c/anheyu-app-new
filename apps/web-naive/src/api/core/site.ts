import { requestClient } from '#/api/request';

export namespace SiteApi {
  /** 站点配置 */
  export interface SiteConfig {
    /** 应用名称 */
    APP_NAME: string;
    /** 应用版本 */
    APP_VERSION: string;
    /** ICP 备案号 */
    ICP_NUMBER: string;
    /** 用户默认头像 */
    USER_AVATAR: string;
    /** 关于页面链接 */
    ABOUT_LINK: string;
    /** API 地址 */
    API_URL: string;
    /** 站点地址 */
    SITE_URL: string;
    /** 图标地址 */
    ICON_URL: string;
    /** 横版 Logo (日间) */
    LOGO_HORIZONTAL_DAY: string;
    /** 横版 Logo (夜间) */
    LOGO_HORIZONTAL_NIGHT: string;
    /** Logo 地址 */
    LOGO_URL: string;
    /** Logo 地址 192x192 */
    LOGO_URL_192x192: string;
    /** Logo 地址 512x512 */
    LOGO_URL_512x512: string;
    /** 默认缩略图参数 */
    DEFAULT_THUMB_PARAM: string;
    /** 默认大图参数 */
    DEFAULT_BIG_PARAM: string;
    /** 站点公告 */
    SITE_ANNOUNCEMENT?: string;
  }

  /** 站点配置响应 */
  export interface SiteConfigResult {
    code: number;
    message: string;
    data: SiteConfig;
  }
}

/**
 * 获取站点配置
 */
export async function getSiteConfigApi() {
  return requestClient.get<SiteApi.SiteConfig>('/public/site-config');
}

/**
 * 发送测试邮件
 * @param toEmail 接收测试邮件的目标邮箱地址
 */
export async function sendTestEmailApi(toEmail: string) {
  return requestClient.post<null>('/settings/test-email', {
    to_email: toEmail,
  });
}

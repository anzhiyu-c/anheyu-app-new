<script lang="ts" setup>
import type { GlobalThemeOverrides } from 'naive-ui';

import { computed, onMounted } from 'vue';

import { useNaiveDesignTokens } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import { useSiteConfigStore } from '@vben/stores';

import {
  darkTheme,
  dateEnUS,
  dateZhCN,
  enUS,
  lightTheme,
  NConfigProvider,
  NMessageProvider,
  NNotificationProvider,
  zhCN,
} from 'naive-ui';

defineOptions({ name: 'App' });

const { commonTokens } = useNaiveDesignTokens();
const siteConfigStore = useSiteConfigStore();

const tokenLocale = computed(() =>
  preferences.app.locale === 'zh-CN' ? zhCN : enUS,
);
const tokenDateLocale = computed(() =>
  preferences.app.locale === 'zh-CN' ? dateZhCN : dateEnUS,
);
const tokenTheme = computed(() =>
  preferences.theme.mode === 'dark' ? darkTheme : lightTheme,
);

const themeOverrides = computed((): GlobalThemeOverrides => {
  return {
    common: commonTokens,
  };
});

// 初始化站点配置
onMounted(async () => {
  try {
    console.log('=== 开始初始化站点配置 ===');

    // 检查并打印缓存中的配置
    const cachedData = localStorage.getItem('anheyu-site-config');
    if (cachedData) {
      try {
        const { config: cachedConfig, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;
        const cacheAgeMinutes = Math.floor(cacheAge / 1000 / 60);
        console.log('📦 缓存配置:', {
          配置内容: cachedConfig,
          缓存时间: new Date(timestamp).toLocaleString('zh-CN'),
          缓存年龄: `${cacheAgeMinutes} 分钟`,
          是否过期: cacheAge > 24 * 60 * 60 * 1000 ? '是' : '否',
        });
      } catch (e) {
        console.warn('缓存数据解析失败:', e);
      }
    } else {
      console.log('📦 无缓存配置');
    }

    const { getSiteConfigApi } = await import('#/api');
    await siteConfigStore.fetchSiteConfig(getSiteConfigApi);

    console.log('✅ 当前应用配置:', {
      完整配置: siteConfigStore.siteConfig,
      应用名称: siteConfigStore.appName,
      Logo: siteConfigStore.logo,
      站点地址: siteConfigStore.siteUrl,
      API地址: siteConfigStore.apiUrl,
      是否已加载: siteConfigStore.isLoaded,
    });

    console.log('=== 站点配置初始化完成 ===');
  } catch (error) {
    console.error('❌ 初始化站点配置失败:', error);
  }
});
</script>

<template>
  <NConfigProvider
    :date-locale="tokenDateLocale"
    :locale="tokenLocale"
    :theme="tokenTheme"
    :theme-overrides="themeOverrides"
    class="h-full"
  >
    <NNotificationProvider>
      <NMessageProvider>
        <RouterView />
      </NMessageProvider>
    </NNotificationProvider>
  </NConfigProvider>
</template>

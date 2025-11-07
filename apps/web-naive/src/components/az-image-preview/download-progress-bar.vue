<template>
  <div>
    <Transition name="slide-down">
      <div v-if="visible" class="download-bar">
        <div class="progress-bar" :style="{ width: '100%' }" />
        <span class="text">{{ text }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const text = ref('正在准备下载...');

/**
 * 外部调用下载方法 - 使用浏览器原生下载
 */
async function downloadImageWithProgress(imageUrl: string, fileName?: string) {
  if (!imageUrl) return;

  // 显示提示
  visible.value = true;
  text.value = '正在准备下载...';

  // 直接使用浏览器原生下载
  downloadViaBrowser(imageUrl, fileName);

  // 短暂显示提示后隐藏
  setTimeout(() => {
    text.value = '下载已开始，请查看浏览器下载栏';
  }, 100);

  setTimeout(() => {
    visible.value = false;
  }, 2000);
}

/**
 * 使用浏览器原生下载功能
 * 直接创建 a 标签触发下载，让浏览器自己处理下载进度
 */
function downloadViaBrowser(url: string, fileName?: string) {
  console.log('开始下载:', url);

  // 尝试直接下载
  const a = document.createElement('a');
  a.style.display = 'none';

  // 先尝试直接下载原始 URL
  a.href = url;

  // 设置下载文件名
  if (fileName) {
    a.download = fileName;
  } else {
    const urlFileName = url.split('/').pop() || 'download';
    a.download = urlFileName;
  }

  // 尝试检测是否支持直接下载（同源或有 CORS 支持）
  const urlObj = new URL(url, window.location.href);
  const isSameOrigin = urlObj.origin === window.location.origin;

  if (!isSameOrigin) {
    // 跨域情况，使用后端代理
    console.log('检测到跨域，使用后端代理下载');
    a.href = `/api/proxy/download?url=${encodeURIComponent(url)}`;
  }

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  console.log('下载已触发，浏览器将显示下载进度');
}

// 导出方法
defineExpose({
  downloadImageWithProgress,
});
</script>

<style scoped lang="scss">
.download-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  width: 100%;
  height: 60px;
  padding: 0 16px;
  overflow: hidden;
  color: white;
  background: #2c2c2c;
  box-shadow: 0 2px 6px rgb(0 0 0 / 20%);

  .text {
    z-index: 2;
    margin-left: 10px;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
  }
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  transition: width 0.2s ease;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>

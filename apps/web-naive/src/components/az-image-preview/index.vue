<!--
 * @Description:
 * @Author: 安知鱼
 * @Date: 2025-11-07 13:28:52
 * @LastEditTime: 2025-11-07 15:30:00
 * @LastEditors: 安知鱼
-->
<template>
  <Teleport to="body">
    <Transition name="az-fade">
      <div v-show="visible" class="az-preview-overlay" @click.self="close">
        <div
          style="display: inline-block; height: 100%; vertical-align: middle"
        />
        <div ref="popupRef" class="poptrox-popup" :style="{ opacity: 0 }">
          <div v-if="loading" class="loader">
            <SvgSpinnerIcon class="spinner-icon" />
          </div>

          <div v-if="containerVisible" :key="imageKey" class="pic">
            <img
              ref="imgRef"
              class="az-preview-image"
              :src="
                previewSrcList[previewIndex]?.bigParam
                  ? `${previewSrcList[previewIndex]?.imageUrl}?${previewSrcList[previewIndex]?.bigParam}`
                  : previewSrcList[previewIndex]?.imageUrl
              "
              @click.stop
              @load="imgLoad()"
            />
          </div>

          <div v-if="!loading" class="caption">
            <div class="tag-info tag-info-bottom">
              <span
                v-if="props.page === 'album'"
                class="tag-device"
                style="margin-right: 4px; margin-bottom: 2px"
              >
                <FireIcon class="icon-svg" />
                热度 {{ previewSrcList[currentIndex]?.viewCount }}
              </span>
              <span
                v-if="props.page === 'album'"
                class="tag-location"
                style="margin-right: 4px"
              >
                <DownloadIcon class="icon-svg" />
                下载量 {{ downloadCount }}
              </span>
              <span class="tag-location" style="margin-right: 4px">
                <SvgSizeIcon class="icon-svg" />
                大小
                {{ formatFileSize(previewSrcList[currentIndex]?.fileSize) }}
              </span>
              <span class="tag-time">
                <SvgTimeLineIcon class="icon-svg" />
                {{
                  dayjs(previewSrcList[currentIndex]?.createTime).format(
                    'YYYY-MM-DD HH:mm:ss',
                  )
                }}
              </span>
            </div>
            <div class="tag-info">
              <span class="tag-categorys">
                <div
                  v-if="props.downloadBtn"
                  class="link"
                  @click="downImage(previewSrcList[currentIndex])"
                >
                  <DownloadIcon class="icon-svg" style="margin-right: 4px" />
                  原图下载
                </div>
              </span>
            </div>
          </div>

          <span
            v-show="showControls"
            class="az-preview-close closer"
            @click="close"
          >
            <SvgCloseIcon class="close-icon" />
          </span>

          <template v-if="previewSrcList.length > 1 && showControls">
            <div class="az-nav nav-previous" @click.stop="prev">
              <SvgArrowIcon class="arrow-icon" />
            </div>
            <div class="az-nav nav-next" @click.stop="next">
              <SvgArrowIcon class="arrow-icon" />
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <DownloadProgressBar ref="progressRef" />
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { useSiteConfigStore } from '@vben/stores';

import dayjs from 'dayjs';
import gsap from 'gsap';

import { updateWallpaperStat } from '#/api/core/album-home';
import DownloadProgressBar from './download-progress-bar.vue';
import { formatFileSize, getFileExtension } from '#/utils/download';
import {
  DownloadIcon,
  FireIcon,
  SvgArrowIcon,
  SvgCloseIcon,
  SvgSizeIcon,
  SvgSpinnerIcon,
  SvgTimeLineIcon,
} from '@vben/icons';

const props = defineProps({
  downloadBtn: {
    default: false,
    type: Boolean,
  },
  page: {
    default: 'album',
    type: String,
  },
});

const progressRef = ref();
const popupRef = ref<HTMLElement | null>(null);
const imgRef = ref<HTMLImageElement | null>(null);

const visible = ref(false);
const previewSrcList = ref<any[]>([]);
const previewIndex = ref(0);
const imageKey = ref('');
const containerVisible = ref(false);
const loading = ref(true);
const currentIndex = ref(0);
const downloadCount = ref(0);
const showControls = ref(false);
const isSwitch = ref(false);
let currentImgSize = { height: 0, width: 0 };
let finalWidth = ref('150px');
let finalHeight = ref('150px');

const loadedImageIndexes = ref(new Set<number>());
const imageDimensionsCache = ref(
  new Map<string, { height: number; width: number }>(),
);

const siteConfigStore = useSiteConfigStore();

const siteName = computed(() => siteConfigStore.appName || '安和鱼');

const downImage = (imageInfo: any) => {
  // 获取下载 URL，优先使用 downloadUrl，如果没有则使用 imageUrl
  const finalDownloadUrl = imageInfo.downloadUrl || imageInfo.imageUrl;

  if (!finalDownloadUrl) {
    console.error('下载失败：图片 URL 不存在', imageInfo);
    return;
  }

  console.log('准备下载图片:', {
    downloadUrl: imageInfo.downloadUrl,
    imageUrl: imageInfo.imageUrl,
    finalUrl: finalDownloadUrl,
  });

  const extension = getFileExtension(finalDownloadUrl);
  const fileName = `${siteName.value}.${extension}`;

  if (props.page === 'album') {
    updateWallpaperStat({
      id: imageInfo.id,
      type: 'download',
    })
      .then(() => {
        downloadCount.value++;
        progressRef.value.downloadImageWithProgress(finalDownloadUrl, fileName);
      })
      .catch((err) => {
        console.error('Failed to update download count:', err);
        // 即使统计接口失败，仍然执行下载
        progressRef.value.downloadImageWithProgress(finalDownloadUrl, fileName);
      });
  } else {
    // 不需要更新下载次数
    progressRef.value.downloadImageWithProgress(finalDownloadUrl, fileName);
  }
};

// 优化 getImageSize 函数，增加缓存逻辑
const getImageSize = (url: string) => {
  // 如果缓存中已有尺寸，直接返回
  if (imageDimensionsCache.value.has(url)) {
    return Promise.resolve(imageDimensionsCache.value.get(url)!);
  }
  // 否则，正常加载并存入缓存
  return new Promise<{ height: number; width: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const dimensions = { height: img.naturalHeight, width: img.naturalWidth };
      imageDimensionsCache.value.set(url, dimensions); // 存入缓存
      resolve(dimensions);
    };
    img.onerror = reject;
    img.src = url;
  });
};

const handleResize = () => {
  if (visible.value && popupRef.value && !loading.value) {
    const isMobile = window.innerWidth < 600;
    let targetWidth: string, targetHeight: string;
    if (isMobile) {
      targetWidth = '100vw';
      targetHeight = 'auto';
    } else {
      const viewportWidth = window.innerWidth * 0.9;
      const viewportHeight = window.innerHeight * 0.9;
      const ratio = Math.min(
        viewportWidth / currentImgSize.width,
        viewportHeight / currentImgSize.height,
        1,
      );
      targetWidth = `${Math.floor(currentImgSize.width * ratio)}px`;
      targetHeight = `${Math.floor(currentImgSize.height * ratio)}px`;
    }
    gsap.to(popupRef.value, {
      duration: 0.3,
      ease: 'power2.out',
      height: targetHeight,
      width: targetWidth,
    });
    finalWidth.value = targetWidth;
    finalHeight.value = targetHeight;
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!visible.value || !showControls.value) return;
  switch (e.key) {
    case 'Escape':
      close();
      break;
    case 'ArrowLeft':
      prev();
      break;
    case 'ArrowRight':
      next();
      break;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeydown);
});

const open = async (list: Array<any>, index = 0, next = false) => {
  if (popupRef.value) {
    gsap.killTweensOf(popupRef.value);
  }
  gsap.killTweensOf(['.az-preview-image', '.caption']);

  imageKey.value = `${index}-${Date.now()}`;
  visible.value = true;
  loading.value = true;
  containerVisible.value = false;

  if (!next) {
    showControls.value = false;
  }

  previewSrcList.value = list;
  previewIndex.value = index;
  currentIndex.value = index;
  downloadCount.value = list[index].downloadCount;

  isSwitch.value = next;

  if (props.page === 'album') {
    updateWallpaperStat({
      id: list[index].id,
      type: 'view',
    })
      .then(() => {
        list[index].viewCount++;
      })
      .catch((err) => {
        console.error('Failed to update view count:', err);
      });
  }

  if (popupRef.value) {
    if (next) {
      containerVisible.value = true;
    } else {
      gsap.fromTo(
        popupRef.value,
        {
          height: '150px',
          opacity: 0,
          scale: 0.7,
          width: '150px',
          x: '-50%',
          y: '-50%',
        },
        {
          duration: 0.2,
          ease: 'power2.out',
          onComplete: () => {
            containerVisible.value = true;
          },
          opacity: 1,
          scale: 1,
        },
      );
    }
  }

  const imgUrl = list[index].bigParam
    ? `${list[index].imageUrl}?${list[index].bigParam}`
    : list[index].imageUrl;

  try {
    currentImgSize = await getImageSize(imgUrl);
  } catch (error) {
    console.error('Image size calculation failed:', error);
    close();
  }
};

function imgLoad() {
  // 图片成功加载后，将其索引添加到记录中
  loadedImageIndexes.value.add(currentIndex.value);

  const isMobile = window.innerWidth < 600;
  if (isMobile) {
    finalWidth.value = '100vw';
    finalHeight.value = 'auto';
  } else {
    const viewportWidth = window.innerWidth * 0.9;
    const viewportHeight = window.innerHeight * 0.9;
    const ratio = Math.min(
      viewportWidth / currentImgSize.width,
      viewportHeight / currentImgSize.height,
      1,
    );
    finalWidth.value = `${Math.floor(currentImgSize.width * ratio)}px`;
    finalHeight.value = `${Math.floor(currentImgSize.height * ratio)}px`;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      showControls.value = true;
    },
  });

  if (popupRef.value) {
    tl.to(popupRef.value, {
      duration: 0.3,
      ease: 'power3.inOut',
      height: finalHeight.value,
      width: finalWidth.value,
    });
  }

  tl.add(() => {
    loading.value = false;
    gsap.set(['.az-preview-image', '.caption'], { opacity: 0 });
  });

  tl.to(['.az-preview-image', '.caption'], {
    duration: 0.2,
    opacity: 1,
    stagger: 0.1,
  });
}

const close = () => {
  if (popupRef.value) {
    gsap.to(
      '.poptrox-popup .closer, .poptrox-popup .nav-previous, .poptrox-popup .nav-next',
      {
        duration: 0.15,
        ease: 'power2.in',
        opacity: 0,
      },
    );

    gsap.to(popupRef.value, {
      duration: 0.15,
      ease: 'power2.in',
      onComplete: () => {
        visible.value = false;
        containerVisible.value = false;
        showControls.value = false;

        gsap.set(
          '.poptrox-popup .closer, .poptrox-popup .nav-previous, .poptrox-popup .nav-next',
          { clearProps: 'opacity' },
        );

        gsap.set(popupRef.value, { clearProps: 'all' });
      },
      opacity: 0,
      scale: 0.7,
      x: '-50%',
      y: '-50%',
    });
  } else {
    visible.value = false;
  }
};

const next = () => {
  open(
    previewSrcList.value,
    (previewIndex.value + 1) % previewSrcList.value.length,
    true,
  );
};

const prev = () => {
  open(
    previewSrcList.value,
    (previewIndex.value - 1 + previewSrcList.value.length) %
      previewSrcList.value.length,
    true,
  );
};

defineExpose({ downImage, open });
</script>

<style scoped lang="scss">
$popup-bg: rgb(31 34 36 / 92.5%);
$gradient-color: rgb(31 34 36 / 35%);
$caption-gradient: linear-gradient(
  to top,
  rgb(16 16 16 / 45%) 25%,
  rgb(16 16 16 / 0%) 100%
);
$transition: opacity 0.2s ease-in-out;

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(359deg);
  }
}

.az-fade-enter-active,
.az-fade-leave-active {
  transition: opacity 0.6s ease;
}

.az-fade-enter-from,
.az-fade-leave-to {
  opacity: 0;
}

.pic-fade-enter-active {
  transition:
    opacity 0.5s ease 0.2s,
    transform 0.4s cubic-bezier(0.33, 0, 0.2, 1) 0.2s;

  img {
    transition:
      clip-path 0.4s cubic-bezier(0.33, 0, 0.2, 1),
      filter 0.3s ease;
  }
}

.pic-fade-enter-from {
  opacity: 0;
  transform: translateY(2px) scale(0.995);

  img {
    clip-path: inset(0% 20% 0% 20%);
    filter: brightness(1.02) contrast(0.98);
  }
}

.pic {
  will-change: transform, opacity;
  backface-visibility: hidden;

  img {
    transform: translateZ(0);
  }
}

.az-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 10006;
  display: block;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
  background: rgb(0 0 0 / 85%);
  backdrop-filter: blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
  contain: strict;
  -webkit-tap-highlight-color: rgb(255 255 255 / 0%);

  @media screen and (width <= 736px) {
    .poptrox-popup .tag-info-bottom {
      flex-direction: column;
      align-items: flex-start;
    }

    .poptrox-popup {
      margin-bottom: 120px;
      border-radius: 0 !important;
    }

    .poptrox-popup::before {
      display: none;
    }

    .poptrox-popup .caption {
      position: fixed;
      bottom: 0;
    }

    .poptrox-popup .closer,
    .poptrox-popup .nav-previous,
    .poptrox-popup .nav-next {
      display: none !important;
    }
  }

  .az-preview-image {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    transform: translateZ(0);
    will-change: transform, opacity;
    backface-visibility: hidden;
  }

  .poptrox-popup {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
    display: inline-block;
    overflow: hidden;
    vertical-align: middle;
    cursor: default;
    background: $popup-bg;
    border-radius: 12px;
    box-shadow: 0 1em 3em 0.5em rgb(0 0 0 / 25%);
    opacity: 0;
    will-change: transform, opacity, width, height;

    @media screen and (width <= 980px) {
      .closer {
        .close-icon {
          width: 3em;
          height: 3em;
        }
      }

      .nav-previous,
      .nav-next {
        .arrow-icon {
          width: 4em;
          height: 4em;
        }
      }
    }

    .az-image-enter {
      opacity: 1 !important;
    }

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      display: block;
      width: 100%;
      height: 100%;
      cursor: auto;
      content: '';
      background-image:
        linear-gradient(
          to left,
          $gradient-color,
          rgb(31 34 36 / 0%) 10em,
          rgb(31 34 36 / 0%)
        ),
        linear-gradient(
          to right,
          $gradient-color,
          rgb(31 34 36 / 0%) 10em,
          rgb(31 34 36 / 0%)
        );
      opacity: 0;
      transition: $transition;
    }

    &:hover::before {
      opacity: 1;
    }

    span.tag-list a {
      color: #fff;
      opacity: 0.8;
      transition: all 0.3s ease-in-out;
    }

    span.tag-list a:hover {
      opacity: 1;
    }

    .tag-info-bottom {
      display: flex;

      span {
        display: flex;
        gap: 4px;
        align-items: center;
        font-size: 14px;
        line-height: 1;
        color: #fff;
      }

      .icon-svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
    }

    .closer,
    .nav-previous,
    .nav-next {
      position: absolute;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: $transition;
    }

    .delayed-hidden {
      pointer-events: none !important;
      opacity: 0 !important;
    }

    .closer {
      top: 0;
      right: 0;
      width: 5em;
      height: 5em;
      color: #fff;

      .close-icon {
        width: 3em;
        height: 3em;
        color: #fff;
      }
    }

    .nav-previous,
    .nav-next {
      top: 50%;
      width: 6em;
      height: 8em;
      margin-top: -4em;
      color: #fff;
      cursor: pointer;

      .arrow-icon {
        width: 5em;
        height: 5em;
        color: #fff;
      }
    }

    .nav-previous {
      left: 0;

      .arrow-icon {
        transform: scaleX(-1);
      }
    }

    .nav-next {
      right: 0;
    }

    .caption {
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      padding: 2em 2em 0.1em;
      padding-bottom: 2rem;
      text-align: left;
      cursor: auto;
      background-image: $caption-gradient;
      opacity: 0.8;
      transition: $transition;

      h2,
      h3,
      h4,
      h5,
      h6 {
        margin: 0;
        font-weight: bold;
      }

      p {
        font-size: 15px;
        color: #fff;
      }
    }

    .loader {
      position: absolute;
      top: 50%;
      left: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 4em;
      height: 4em;
      margin: -2em 0 0 -2em;
      font-size: 2em;
      opacity: 0.25;

      .spinner-icon {
        width: 100%;
        height: 100%;
        color: #fff;
        transform-origin: center;
        animation: spinner 1s infinite linear !important;
      }
    }

    &:hover .closer,
    &:hover .nav-previous,
    &:hover .nav-next {
      opacity: 0.5;

      &:hover {
        opacity: 1;
      }
    }

    .tag-categorys .link {
      margin: 0;
      cursor: pointer;
      background: rgb(0 0 0 / 80%);

      .icon-svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      &:hover {
        background: #0d00ff;
      }
    }
  }

  body.touch .poptrox-popup {
    .closer,
    .nav-previous,
    .nav-next {
      opacity: 1 !important;
    }
  }

  .tag-categorys {
    display: flex;

    .link {
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      margin-top: 12px;
      margin-left: 12px;
      font-size: 12px;
      line-height: 1;
      color: #f7f7fa;
      background: rgb(0 0 0 / 30%);
      backdrop-filter: blur(20px);
      backdrop-filter: saturate(180%) blur(20px);
      border-radius: 8px;
      transition: 0.3s;

      &:hover {
        color: #fff;
        background: #0d00ff;
      }
    }
  }
}
</style>

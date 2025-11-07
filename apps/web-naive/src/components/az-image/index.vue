<template>
  <div class="az-image-wrapper">
    <img
      ref="imageRef"
      :alt="alt"
      :class="['az-image', { loaded: isLoaded }]"
      :style="imageStyle"
      loading="lazy"
      @load="handleImageLoad"
      @click="openPreview"
    />
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties, PropType } from 'vue';

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

const props = defineProps({
  alt: { default: '图片', type: String },
  fit: { default: 'cover', type: String as PropType<ObjectFit> },
  lazy: { default: true, type: Boolean },
  previewSrcList: { default: () => [], type: Array as any },
  src: { required: true, type: String },
});

const emit = defineEmits<{
  (e: 'load'): void;
  (e: 'open-preview'): void;
}>();

const imageRef = ref<HTMLImageElement | null>(null);
const isLoaded = ref(false);
const observer = ref<IntersectionObserver | null>(null);

const currentImage = computed(() => {
  return props.previewSrcList.find((item: any) => item.imageUrl === props.src);
});

const imageStyle = computed(
  (): CSSProperties => ({
    height: '100%',
    objectFit: props.fit,
    width: '100%',
  }),
);

watch(
  () => props.src,
  () => {
    isLoaded.value = false;
    if (!props.lazy) {
      loadImage();
    } else {
      observer.value?.disconnect();
      if (imageRef.value && observer.value)
        observer.value.observe(imageRef.value);
    }
  },
);

function openPreview() {
  emit('open-preview');
}

const handleImageLoad = () => {
  isLoaded.value = true;
  emit('load');
};

const loadImage = () => {
  if (imageRef.value) {
    const thumb = currentImage.value?.thumbParam;
    imageRef.value.src = props.src + (thumb ? `?${thumb}` : '');
  }
};

onMounted(() => {
  if (!props.lazy) {
    loadImage();
    return;
  }

  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        loadImage();
        observer.value?.disconnect();
      }
    },
    { rootMargin: '100px' },
  );

  if (imageRef.value) observer.value.observe(imageRef.value);
});

onUnmounted(() => {
  observer.value?.disconnect();
});
</script>

<style scoped lang="scss">
.az-image-wrapper {
  display: block;
  width: 100%;
  height: 100%;
  img {
    border-radius: 0;
  }
}

.az-image-placeholder,
.az-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  object-fit: cover;
  transition: opacity 0.4s ease;
}

.az-image {
  opacity: 0;

  &.loaded {
    opacity: 1;
  }
}
</style>

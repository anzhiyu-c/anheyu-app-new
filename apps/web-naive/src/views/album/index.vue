<!--
 * @Description: 相册主页
 * @Author: 安知鱼
 * @Date: 2025-11-07
 * @LastEditTime: 2025-11-07 12:50:49
 * @LastEditors: 安知鱼
-->
<script setup lang="ts">
import Album from './components/album.vue';
import Header from './components/header.vue';

defineOptions({
  name: 'AlbumHome',
});
</script>

<template>
  <div class="album-home">
    <Header />
    <Album />
  </div>
</template>

<style scoped>
.album-home {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background: #1a1a1a;
}
</style>

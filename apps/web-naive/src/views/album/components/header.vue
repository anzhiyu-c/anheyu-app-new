<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useSiteConfigStore } from '@vben/stores';
import { useAlbumStore } from '#/store/album';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'HeaderComponent',
});
const router = useRouter();
const siteConfigStore = useSiteConfigStore();

const albumStore = useAlbumStore();
const { sortOrder, categoryId, categories } = storeToRefs(albumStore);

// 计算属性，从 Pinia Store 获取站点配置
const siteConfig = computed(() => siteConfigStore.siteConfig);

// 动态获取网站名称
const siteName = computed(() => siteConfig.value?.APP_NAME || '安和鱼');

// 动态获取关于链接
const aboutLink = computed(() => siteConfig.value?.ABOUT_LINK || '#');

// 动态获取 ICP 备案号
const icpNumber = computed(() => siteConfig.value?.ICP_NUMBER || '');

// 动态获取公安联网备案号
const policeRecordNumber = computed(
  () => siteConfig.value?.POLICE_RECORD_NUMBER || '',
);

// 前往首页
const goHome = () => {
  router.push('/');
};

const handleSortChange = (newOrder: string) => {
  albumStore.setSortOrder(newOrder);
};

const handleCategoryChange = (newCategoryId: number | null) => {
  albumStore.setCategoryId(newCategoryId);
};

// 组件挂载时获取分类列表
onMounted(() => {
  albumStore.fetchCategories();
});
</script>

<template>
  <header id="header">
    <div class="flex items-center justify-center" @click="goHome">
      <a style="cursor: pointer">
        <img
          class="site-logo"
          :src="
            siteConfig?.USER_AVATAR ||
            'https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg'
          "
          alt="网站Logo"
        />
      </a>
      <h1>
        <a style="cursor: pointer">
          <strong class="site-name">{{ siteName }}</strong>
        </a>
      </h1>
    </div>
    <nav>
      <ul class="nav_links">
        <li v-if="categories.length > 0" class="nav-item">
          <a style="cursor: pointer">分类</a>
          <div class="nav-item-child">
            <ul>
              <li class="category-parent category-level-0 mb-1">
                <a
                  :class="{ active: categoryId === null }"
                  @click="handleCategoryChange(null)"
                  >全部
                </a>
              </li>
              <li
                v-for="category in categories"
                :key="category.id"
                class="category-parent category-level-0 mb-1"
              >
                <a
                  :class="{ active: categoryId === category.id }"
                  @click="handleCategoryChange(category.id)"
                  >{{ category.name }}
                </a>
              </li>
            </ul>
          </div>
        </li>
        <li class="nav-item">
          <a style="cursor: pointer">排序</a>
          <div class="nav-item-child">
            <ul>
              <li class="category-parent category-level-0 mb-1">
                <a
                  :class="{ active: sortOrder === 'display_order_asc' }"
                  @click="handleSortChange('display_order_asc')"
                  >默认排序
                </a>
              </li>
              <li class="category-parent category-level-0">
                <a
                  :class="{ active: sortOrder === 'created_at_desc' }"
                  @click="handleSortChange('created_at_desc')"
                  >最新发布
                </a>
              </li>
              <li class="category-parent category-level-0">
                <a
                  :class="{ active: sortOrder === 'view_count_desc' }"
                  @click="handleSortChange('view_count_desc')"
                  >热度排序</a
                >
              </li>
            </ul>
          </div>
        </li>
        <li class="nav-item">
          <a style="cursor: pointer" :href="aboutLink" target="_blank">关于</a>
        </li>
        <li v-if="icpNumber" class="nav-item">
          <a
            class="footer-bar-link"
            target="_blank"
            rel="noopener external nofollow noreferrer"
            href="https://beian.miit.gov.cn/"
            :title="icpNumber"
            >{{ icpNumber }}
          </a>
        </li>
        <li v-if="policeRecordNumber" class="nav-item">
          <a
            class="footer-bar-link"
            target="_blank"
            rel="noopener external nofollow noreferrer"
            href="http://www.beian.gov.cn/portal/registerSystemInfo"
            :title="policeRecordNumber"
            >{{ policeRecordNumber }}
          </a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
/* 关键帧动画 */
@keyframes header-slide-up {
  to {
    transform: translateY(0);
  }
}

@keyframes header-fade-in {
  to {
    opacity: 1;
  }
}

#header {
  position: fixed;
  top: calc(100vh - 80px);
  left: 0;
  z-index: 10002;
  display: flex;
  align-items: center;
  width: 100%;
  height: 80px;
  padding: 0 1.5em;
  line-height: 1;
  user-select: none;

  /* 基础样式 */
  background: rgb(18 18 18 / 80%);
  backdrop-filter: saturate(180%) blur(20px);
  opacity: 0;

  /* 过渡效果（用于其他交互） */
  transition: transform 1s ease;

  /* 初始状态 */
  transform: translateY(4em);

  /* 动画效果 */
  animation:
    header-slide-up 0.8s ease-out 1s forwards,
    header-fade-in 0.6s ease-in 1s forwards;

  /* 减少运动设置 */
  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    transform: translateY(0);
    animation: none;
  }

  h1 {
    display: flex;
    align-items: center;
    height: 4em;
    margin: 0;
    font-size: 1em;
    line-height: 4.5em;
    color: #a0a0a1;
    vertical-align: middle;

    a {
      line-height: 1;
      color: inherit;
      border: 0;

      &:hover {
        color: inherit !important;
      }
    }
  }

  nav {
    margin-left: auto;

    > ul {
      display: flex;
      padding: 0;
      margin: 0;
      list-style: none;

      > li {
        position: relative;
        display: flex;
        justify-content: center;
        padding: 0;
        list-style-type: none;

        &.nav-item {
          .nav-item-child {
            position: absolute;
            bottom: 64px;
            display: flex;
            flex-direction: column;
            align-items: center;
            height: fit-content;
            padding: 8px;
            margin-bottom: 0;
            pointer-events: none;
            background: rgb(0 0 0 / 60%);
            backdrop-filter: blur(10px);
            border-radius: 8px;
            opacity: 0;
            transition: 0.3s;

            > ul {
              padding-left: 0;
            }

            &::before {
              position: absolute;
              bottom: -40px;
              left: 0;
              width: 100%;
              height: 40px;
              content: '';
            }
          }

          &:hover {
            .nav-item-child {
              display: flex;
              pointer-events: all;
              opacity: 1;
            }
          }

          .category-parent {
            font-size: 14px;
            border-radius: 8px;
            transition: 0.3s;

            &:hover {
              background: #0d00ff;
            }

            &.category-level-0 {
              width: 100%;
              text-align: center;

              a {
                width: 100%;
                text-align: center;
              }
            }
          }
        }

        a {
          display: inline-block;
          padding: 8px 16px;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          white-space: nowrap;
          cursor: pointer;
          border: 0;
          border-radius: 8px;
          transition: background-color 0.5s ease;

          &.icon {
            &::before {
              float: right;
              margin-left: 0.75em;
              color: #505051;
            }
          }

          &:hover {
            color: #fff !important;
            background: #ffffff1e;
          }

          &.active {
            background-color: #30343f;
          }
        }
      }
    }
  }

  .discription {
    margin-left: 8px;
  }

  .site-logo {
    width: 30px;
    height: 30px;
    margin-right: 1rem;
    border-radius: 20px;
  }

  .site-name {
    color: #fff;
  }

  @media screen and (width <= 736px) {
    top: 0;
    bottom: auto;
    height: 60px;
    padding: 0 1em;
    transform: translateY(0);

    .nav-item {
      font-size: 0.7em;
    }

    h1 {
      font-size: 0.8em;
      color: #fff;
      display: none !important;
    }
  }
}
</style>

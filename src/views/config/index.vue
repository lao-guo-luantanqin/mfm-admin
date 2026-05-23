<script setup lang="ts">
import { useRouter } from "vue-router";

defineOptions({ name: "ConfigHome" });

const router = useRouter();

const cards = [
  {
    id: "collections",
    title: "配置文档",
    description:
      "管理 global_config / page_config / component_config / dict_config",
    path: "/config/collections/index",
    icon: "ep:document",
    gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
  },
  {
    id: "page_config",
    title: "页面配置",
    description: "page_config：首页、详情页等 pageKey 与区块 sub 列表",
    path: "/config/collections/index?page=page_config",
    icon: "ep:files",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
  },
  {
    id: "global_config",
    title: "站点全局",
    description: "global_config：站点标题、Logo、全局 props/style 覆盖",
    path: "/config/collections/index?page=global_config",
    icon: "ep:setting",
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)"
  }
];

function go(path: string) {
  router.push(path);
}
</script>

<template>
  <div class="config-home">
    <header class="config-home__hero">
      <h1>配置数据中心</h1>
      <p>读写 <code>config_db</code> 集合；保存后 API 侧配置缓存会自动失效。</p>
    </header>

    <div class="config-home__grid">
      <article
        v-for="item in cards"
        :key="item.id"
        class="config-home__card"
        :style="{ background: item.gradient }"
        @click="go(item.path)"
      >
        <div class="config-home__card-icon">
          <IconifyIconOffline :icon="item.icon" />
        </div>
        <div class="config-home__card-body">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
        <span class="config-home__card-arrow">→</span>
      </article>
    </div>
  </div>
</template>

<style scoped lang="scss">
.config-home {
  padding: 20px 24px 32px;

  &__hero {
    margin-bottom: 24px;

    h1 {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 700;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }

    code {
      padding: 2px 6px;
      background: var(--el-fill-color-light);
      border-radius: 4px;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  &__card {
    position: relative;
    display: flex;
    gap: 14px;
    min-height: 120px;
    padding: 20px;
    overflow: hidden;
    color: #fff;
    cursor: pointer;
    border-radius: 14px;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease;

    &:hover {
      box-shadow: 0 14px 32px rgb(16 35 63 / 18%);
      transform: translateY(-2px);
    }
  }

  &__card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    font-size: 22px;
    background: rgb(255 255 255 / 18%);
    border-radius: 12px;
  }

  &__card-body {
    flex: 1;

    h3 {
      margin: 0 0 6px;
      font-size: 17px;
      font-weight: 700;
    }

    p {
      margin: 0;
      font-size: 13px;
      line-height: 1.55;
      opacity: 0.92;
    }
  }

  &__card-arrow {
    align-self: center;
    font-size: 20px;
    opacity: 0.85;
  }
}
</style>

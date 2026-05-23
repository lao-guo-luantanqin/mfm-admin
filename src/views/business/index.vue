<script setup lang="ts">
import { useRouter } from "vue-router";
import { businessModuleCards } from "@/config/business-modules";

defineOptions({ name: "BusinessHome" });

const router = useRouter();

function go(path: string) {
  router.push(path);
}
</script>

<template>
  <div class="business-home">
    <header class="business-home__hero">
      <h1>业务数据中心</h1>
      <p>
        对齐旧版 uni-admin 模块入口；数据经 mfm-api
        <code>/admin/collections</code> 读写。
      </p>
    </header>

    <div class="business-home__grid">
      <article
        v-for="item in businessModuleCards"
        :key="item.id"
        class="business-home__card"
        :style="{ background: item.gradient }"
        @click="go(item.path)"
      >
        <div class="business-home__card-icon">
          <IconifyIconOffline :icon="item.icon" />
        </div>
        <div class="business-home__card-body">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
        <span class="business-home__card-arrow">→</span>
      </article>
    </div>
  </div>
</template>

<style scoped lang="scss">
.business-home {
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

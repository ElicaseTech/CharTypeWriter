<template>
  <div class="relative">
    <!-- 全局导航按钮（仅在非历史页面显示） -->
    <div v-if="$route.path !== '/history'" class="fixed top-4 right-4 z-50">
      <UButton
        to="/history"
        variant="outline"
        color="primary"
        size="lg"
        icon="i-heroicons-clock"
      >
        历史记录
      </UButton>
    </div>

    <NuxtPage />
  </div>
</template>

<script lang="ts" setup></script>

<style></style>

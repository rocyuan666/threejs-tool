<template>
  <div class="app">
    <!-- <div class="nav">
      <RouterLink to="/editor">threejs编辑器</RouterLink>
      <span>丨</span>
      <RouterLink to="/play">threejs查看器</RouterLink>
    </div> -->
    <RouterView></RouterView>
  </div>
</template>

<script setup>
import { KeepAlive } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
</script>

<style lang="scss">
@import '@/assets/css/base.css';
/* 全局样式 开发时清空 */
.app {
  text-align: center;
  color: #2c3e50;
}

.nav {
  padding: 30px;
}

.nav a {
  font-weight: bold;
  color: #2c3e50;
}

.nav a.router-link-active {
  color: #ff9999;
}
</style>

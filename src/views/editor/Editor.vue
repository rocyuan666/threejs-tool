<template>
  <div class="title">
    <p>threejs编辑器</p>
  </div>
  <div class="threejs-main" ref="threejsMain"></div>
</template>

<script setup name="Editor">
import { ref, onMounted } from 'vue'
import TE from '@/utils/three_editor'

const threejsMain = ref(null)
onMounted(() => {
  TE.init(threejsMain.value)
})
</script>

<style lang="scss" scoped>
.title {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  text-align: center;
  color: #fff;
}
.threejs-main {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>

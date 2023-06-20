<template>
  <h1 class="title">ThreeJS 播放器</h1>
  <div ref="divInfo" class="divInfo">加载中...</div>
  <div class="tool">
    <button @click="() => TP.moveTo({ x: 0, y: 0, z: 0 })">中心点</button>
    <button @click="() => bindData()">绑定值</button>
  </div>
  <LoadingMask class="loading-mask" v-if="loading" />
  <div class="three-main" ref="divMain"></div>
</template>

<script setup name="Play">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { asyncTasks } from 'roc-utils'
import TP from '@/utils/threejsPlay'
import LoadingMask from '@/components/LoadingMask/LoadingMask.vue'
import requestData from './testData'

function bindData() {
  let data = requestData
  TP.bindData(data)
}

const divMain = ref()
const divInfo = ref()
const loading = ref(true)
function hiddenLoading(isLoading) {
  loading.value = isLoading
}
async function init3D() {
  TP.init(divMain.value, divInfo.value, hiddenLoading)
  let json = localStorage.getItem('saveData')
  if (json) {
    TP.load(JSON.parse(json))
  } else {
    const [err, res] = await asyncTasks(axios.get('./3d_assets/models/3d.json'))
    if (err) return
    TP.load(res.data)
  }
}
onMounted(init3D)
</script>

<style lang="scss" scoped>
.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}
.title {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  color: #fff;
}
.divInfo {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1;
}
.tool {
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  width: 200px;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 20px 10px;
  button {
    margin: 0 5px;
  }
}
.three-main {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>

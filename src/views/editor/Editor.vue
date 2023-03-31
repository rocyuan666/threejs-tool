<template>
  <div class="tips">
    <p>threejs编辑器</p>
    <div>
      <select ref="formDom" style="width: 130px">
        <option value="BoxGeometry">立方体 (X,Y,Z)</option>
        <option value="ConeGeometry">圆锥形 (半径，高度，分隔)</option>
        <option value="CylinderGeometry">圆柱体 (顶半径，底半径，高度，分隔)</option>
        <option value="DodecahedronGeometry">12面体 (半径，顶数)</option>
        <option value="IcosahedronGeometry">20面体 (半径，顶数)</option>
        <option value="OctahedronGeometry">八面几何体 (半径，顶数)</option>
        <option value="RingGeometry">圆环平面体 (内部半径，外部半径，圆环的分段数)</option>
        <option value="SphereGeometry">球几何体 (半径，水平分隔，竖直分隔)</option>
        <option value="TetrahedronGeometry">四面体 (半径，顶点数)</option>
        <option value="TorusGeometry">
          圆环几何体 (圆环的半径，管道半径，圆环的分段数，管道的分段数，圆环的中心角)
        </option>
        <option value="Text">文本 (大小，厚度，颜色|文本)</option>
        <option value="Marker">标签 (大小，颜色|文本)</option>
        <option value="Svg">SVG图片 (图片URL)</option>
        <option value="Img">Img图片 (图片URL)</option>
        <option value="Model">GLB模型 (GLB名称)</option>
        <option value="Tube">管道 (半径,圆分段数)</option>
      </select>
      <button @click="handleAdd">添加</button>
    </div>
    <div class="controller">
      <button @click="handleSave">保存</button>
      <button @click="handleLoad">加载</button>
      <button @click="handleClear">清空</button>
    </div>
  </div>
  <div class="threejs-main" ref="threejsMain"></div>
</template>

<script setup name="Editor">
import { ref, onMounted } from 'vue'
import TE from '@/utils/three_editor'

const formDom = ref(null)
function handleAdd() {
  TE.add(formDom.value.value)
}
function handleSave() {
  TE.save()
}
function handleLoad() {
  TE.load()
}
function handleClear() {
  TE.clear()
}

const threejsMain = ref(null)
onMounted(() => {
  TE.init(threejsMain.value)
})
</script>

<style lang="scss" scoped>
.tips {
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 9;
  text-align: center;
  color: #fff;
  padding: 0 20px;
  background-color: rgba($color: #000000, $alpha: 0.6);
}
.threejs-main {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>

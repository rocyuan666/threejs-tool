<template>
  <h1 class="title">ThreeJS 编辑器</h1>
  <div class="tool">
    <div class="box1">
      <select v-model="selectValue">
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
      <button @click="() => TE.add(selectValue)">添加</button>
    </div>
    <div class="box2">
      <button title="快捷键 ctrl+s" @click="() => TE.save()">保存</button>
      <button title="快捷键 ctrl+l" @click="() => TE.load()">加载</button>
      <button title="快捷键 ctrl+e" @click="() => TE.exportJson()">导出</button>
      <button title="快捷键 ctrl+r" @click="() => TE.clear()">清空</button>
    </div>
    <p class="tips">
      注意: 编辑用到的素材文件及导出的json文件放到项目的以下目录中: <br />/public/3d_assets/models/
    </p>
  </div>
  <div class="three-main" ref="divMain"></div>
</template>

<script setup name="Editor">
import { onMounted, ref } from 'vue'
import TE from '@/utils/threejsEditor'

const selectValue = ref('BoxGeometry')

const divMain = ref()
onMounted(() => {
  TE.init(divMain.value)
})
</script>

<style lang="scss" scoped>
.title {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  color: #fff;
}
.tool {
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  width: 230px;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 20px 10px;
  .box1 {
    margin-bottom: 10px;
    select {
      width: 130px;
      outline: none;
      margin-right: 10px;
    }
  }
  .box2 {
    button {
      outline: none;
      margin: 0 2px;
    }
  }
  .tips {
    color: #fff;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 0;
  }
}
.three-main {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>

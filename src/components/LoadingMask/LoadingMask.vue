<template>
  <div class="load">
    <div class="load_img">
      <!-- 加载动画 -->
      <img class="jzxz1" src="@/assets/images/jzxz1.png" />
      <img class="jzxz2" src="@/assets/images/jzxz2.png" />
    </div>
  </div>
</template>

<script setup name="LoadingMask">
//
</script>

<style lang="scss" scoped>
@keyframes xz1 {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes xz2 {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-180deg);
  }
  to {
    transform: rotate(-360deg);
  }
}
.load {
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(6, 21, 55, 1);
  opacity: 0.9;
  .load_img {
    position: relative;
    width: 200px;
    height: 200px;
    img {
      position: absolute;
      left: 0;
      top: 0;
      width: 200px;
      height: 200px;
    }
    .jzxz1 {
      animation: xz1 8s infinite linear;
    }
    .jzxz2 {
      animation: xz2 7s infinite linear;
    }
  }
}
</style>

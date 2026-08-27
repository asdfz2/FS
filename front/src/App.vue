<template>
  <div id="app" class="">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app",
};
</script>

<style lang="scss">
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
html,
body {
  width: 100%;
  height: 100%;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
#app {
  height: 100%;
  background: var(--paper);
}

/* 让任何 el-image 的占位也走 token 调色 */
.el-image__placeholder { background: var(--paper-2); }
</style>

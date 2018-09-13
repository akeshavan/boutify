<template>
  <div id="sidebar">
    <h1> this is a sidebar </h1>
  </div>
</template>

<script>
export default {
  name: 'sidebar',
  props: [],
  data() {
    return {

    };
  },
};
</script>

<style>
  #sidebar {
      height: calc(100% - 120px);
      background: white;
      border-style: dashed;
      top: 60px;
      right: 0;
      position: fixed;
      width: 30%;
      z-index: 2;
  }
</style>

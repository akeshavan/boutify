<template>
  <div id="sidebar" :style="getSidebarStyle" class="container">
    <h3 class="mt-1 mb-1"> {{param}} </h3>
    <small style="text-muted pb-2 mb-2"> Enter the boutiques descriptor:</small>
    <b-form-textarea id="textarea1"
                 v-model="json"
                 placeholder="Enter boutiques descriptor for this parameter"
                 :rows="20"
                 :max-rows="60">
    </b-form-textarea>
  </div>
</template>

<script>
export default {
  name: 'sidebar',
  props: ['param', 'sidebarStyle'],
  data() {
    return {
      json: '',
    };
  },
  mounted() {
    console.log('the color we get is', this.sidebarStyle);
  },
  computed: {
    getSidebarStyle() {
      console.log(this.sidebarStyle['border-bottom-color']);
      return {
        height: 'calc(100% - 120px)',
        background: 'white',
        'border-style': 'dashed',
        'border-width': 'thinner',
        'border-color': this.sidebarStyle.color,
        color: this.sidebarStyle.color,
        top: '60px',
        right: 0,
        position: 'fixed',
        width: '30%',
        'z-index': 2,
      };
    },
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

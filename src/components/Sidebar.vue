<template>
  <div id="sidebar" :style="getSidebarStyle" class="container">
    <h3 class="mt-1 mb-1"> {{param}} </h3>
    <small style="text-muted pb-2 mb-2"> Enter the boutiques descriptor:</small>
    <!-- <b-form-textarea id="textarea1"
                 v-model="json"
                 placeholder="Enter boutiques descriptor for this parameter"
                 :rows="20"
                 :max-rows="60">
    </b-form-textarea> -->
    <!-- <pre id="editor">function foo(items) {
        var i;
        for (i = 0; i &lt; items.length; i++) {
            alert("Ace Rocks " + items[i]);
        }
    }</pre> -->

    <!-- <editor height="200px" :content="json"> </editor> -->

    <AceEditor
      :fontSize="14"
      :showPrintMargin="true"
      :showGutter="true"
      :highlightActiveLine="true"
      mode="json"
      theme="monokai"
      :onChange="onChange"
      name="editor"

    />

  </div>
</template>

<script>
import Vue from 'vue';
import brace from 'brace';
import { Ace as AceEditor, Split as SplitEditor } from 'vue2-brace-editor';

import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/theme/monokai';

export default {
  name: 'sidebar',
  props: ['param', 'sidebarStyle'],
  components: { AceEditor },
  data() {
    return {
      json: '',
    };
  },
  mounted() {
    console.log('the color we get is', this.sidebarStyle);
    // const editor = ace.edit("editor");
    // editor.setTheme("ace/theme/twilight");
    // editor.session.setMode("ace/mode/javascript");
  },
  methods: {
    onChange() {

    },
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

  #editor {
    width: unset !important;
  }
</style>

<template>
  <div ref="htext" class="highlighter" @mouseup="getHighlightedText" >
    <!-- <text-highlight :queries="queries" :caseSensitive="true">{{ text }}</text-highlight> -->
    <span v-for="(t, i) in text"
     :id="'c'+i"
     :class="{activeHighlight: isInRange[i]}"
     :style="styleRange[i]"
     @click="removeRange(i)"
     >{{t}}</span>
  </div>
</template>

<script>
  import Vue from 'vue';
  import TextHighlight from 'vue-text-highlight';
  import config from '../config';
  import _ from 'lodash';

  Vue.component('text-highlight', TextHighlight);

  export default {
    props: ['text', 'init', 'rangeClasses', 'currentRange', 'rangeStyles'],//, 'options', 'init'],
    data() {
      return {

      }
    },
    computed: {
      ranges() {
        return this.rangeClasses[this.currentRange]
      },
      isInRange() {
        return _.map(this.text, (obj, idx) => {
          return this.inRange(idx);
        });
      },
      styleRange() {
        return _.map(this.text, (obj, idx) => {
          const whichRange = this.whichRange(idx);
          if (whichRange) {
            return this.rangeStyles[whichRange];
          } else {
            return {};
          }
        });
      },
    },
    methods: {
      whichRange(idx) {
        const rangeKeys = Object.keys(this.rangeClasses);
        const rangeBelong = _.filter(rangeKeys, (k) => {
          // if i is in any of the ranges of k, return true
          return _.filter(this.rangeClasses[k], (r) => {
            return idx <= r[1] && idx >= r[0]
          }).length;
        });
        if (rangeBelong.length) {
          return rangeBelong[0]
        } else {
          return null;
        }
      },
      removeRange(i) {
        // console.log('remove range', i)
        const rElem = _.filter(this.ranges, (r) => {
          return i <= r[1] && i >= r[0]
        })
        // console.log(rElem);
        const idx = this.ranges.indexOf(rElem[0]);
        // console.log(idx, this.ranges);
        if (idx > -1) {
          this.rangeClasses[this.currentRange].splice(idx, 1);
        }
      },
      inRange(idx) {
        return _.filter(this.ranges, (r) => {
          return idx <= r[1] && idx >= r[0]
        }).length;
      },
      updateRange(newRange) {
        const keepRanges = [];

        const newMin = newRange[0]
        const newMax = newRange[1]

        const mergeRange = [newMin, newMax];

        const resultBool = _.map(this.ranges, (r, i) => {
          const min = r[0]
          const max = r[1]
          if ((newMin - 1 >= min && newMin -1 <= max)
              || (newMax+1 >= min && newMax+1 <= max)
              || (newMax+1 >=  max && newMin-1 <= min)
            ) {
            // we are in the range
            mergeRange.push(min);
            mergeRange.push(max);
          } else {
            keepRanges.push(r)
          }
        });

        // consolidate mergeRange
        keepRanges.push([_.min(mergeRange), _.max(mergeRange)])
        this.rangeClasses[this.currentRange] = _.sortBy(keepRanges, (v) => {
          return v[0];
        });

        //console.log('resultBool', resultBool);
      },
      getHighlightedText() {
        let selection;
        if (window.getSelection) {
            selection = window.getSelection();
        } else {
            selection = document.selection.createRange();//.toString();
        }

        if (selection) {

          const startNodeIdx = parseInt(selection.anchorNode.parentElement.id.replace('c', ''));
          const endNodeIdx = parseInt(selection.extentNode.parentElement.id.replace('c', ''));
          const range = _.sortBy([startNodeIdx, endNodeIdx])

          if ((range[1] - range[0]) > 0) {

            this.updateRange(range);
            selection.removeAllRanges();

          }

        } else {
          // console.log('text has been unselected')
        }
      },
    },

  }
</script>

<style>
  .highlighter {
     white-space: pre;
     text-align: left;
  }

  .activeHighlight {
    /* background-color: #ffc107c9; */
    cursor: pointer;
  }

  .text__highlight {
    cursor: pointer;
  }
</style>

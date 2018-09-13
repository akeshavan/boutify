<template>
  <div ref="htext" class="highlighter" @mouseup="getHighlightedText" >
    <!-- <text-highlight :queries="queries" :caseSensitive="true">{{ text }}</text-highlight> -->
    <span v-for="(t, i) in regText"
     :id="'c'+i"
     :class="{activeHighlight: isInRange[i]}"
     :style="styleRange[i]"
     @click="rangeAction(i)"
     >{{t}}</span>

  </div>
</template>

<script>
  import Vue from 'vue';
  import TextHighlight from 'vue-text-highlight';
  import _ from 'lodash';


  Vue.component('text-highlight', TextHighlight);

  export default {
    props: ['text', 'init', 'rangeClasses', 'currentRange', 'rangeStyles', 'rangeActions'], // , 'options', 'init'],
    data() {
      return {

      };
    },
    computed: {
      regText() {
        const regex = /(\s*)?(\S*)?/gm;
        const str = this.text;
        let m;
        const output = [];

        while ((m = regex.exec(str)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex.lastIndex) {
            regex.lastIndex += 1;
          }
          // The result can be accessed through the `m`-variable.
          console.log(m);
          m.forEach((match, groupIndex) => {
            // console.log(`Found match, group ${groupIndex}: ${match}`);
            if (groupIndex && match) {
              output.push(match);
            }
          });
        }
        return output;
      },
      ranges() {
        return this.rangeClasses[this.currentRange];
      },
      isInRange() {
        return _.map(this.text, (obj, idx) => this.inRange(idx));
      },
      styleRange() {
        return _.map(this.text, (obj, idx) => {
          const whichRange = this.whichRange(idx);
          if (whichRange) {
            return this.rangeStyles[whichRange];
          }
          return {};
        });
      },
    },
    methods: {
      rangeAction(i) {
        const selectedRange = this.whichRange(i);
        console.log('range action on char', i, 'in range', selectedRange);
        if (selectedRange) {
          const rangeAction = this.rangeActions[selectedRange];
          console.log('range action on char', i, 'in range', selectedRange, rangeAction);
          switch (rangeAction) {
            case 'removeRange':
              console.log('removing range');
              this.removeRange(i, selectedRange);
              break;
            case 'emitRemoveRange':
              console.log('removing and emitting range');
              this.removeRange(i, selectedRange);
              this.emitRange(i, selectedRange);
              break;
            case 'emitRange':
              console.log('emitting range');
              this.emitRange(i, selectedRange);
              break;
            default:
              // this.removeRange(i, selectedRange);
              break;
          }
        }
      },
      emitRange(idx, selectedRange) {
        // const selectedRange = this.whichRange(idx);
        if (selectedRange) {
          this.$emit('rangeClick', selectedRange, idx);
        }
      },
      whichRange(idx) {
        const rangeKeys = Object.keys(this.rangeClasses);
        /* eslint-disable */
        const rangeBelong = _.filter(rangeKeys, (k) => {
          // if i is in any of the ranges of k, return true
          return _.filter(this.rangeClasses[k], r => idx <= r[1] && idx >= r[0]).length;
        });
        /* eslint-enable */
        if (rangeBelong.length) {
          return rangeBelong[0];
        }
        return null;
      },
      removeRange(i, cRange) {
        // console.log('remove range', i)
        const ranges = this.rangeClasses[cRange];

        const rElem = _.filter(ranges, r => i <= r[1] && i >= r[0]);
        // console.log(rElem);
        const idx = ranges.indexOf(rElem[0]);
        // console.log(idx, this.ranges);
        if (idx > -1) {
          this.rangeClasses[cRange].splice(idx, 1);
        }
      },
      inRange(idx) {
        return _.filter(this.ranges, r => idx <= r[1] && idx >= r[0]).length;
      },
      updateRange(newRange) {
        const keepRanges = [];

        const newMin = newRange[0];
        const newMax = newRange[1];

        const mergeRange = [newMin, newMax];

        _.map(this.ranges, (r) => {
          const min = r[0];
          const max = r[1];
          if ((newMin - 1 >= min && newMin - 1 <= max)
              || (newMax + 1 >= min && newMax + 1 <= max)
              || (newMax + 1 >= max && newMin - 1 <= min)
            ) {
            // we are in the range
            mergeRange.push(min);
            mergeRange.push(max);
          } else {
            keepRanges.push(r);
          }
        });

        // consolidate mergeRange
        keepRanges.push([_.min(mergeRange), _.max(mergeRange)]);
        this.rangeClasses[this.currentRange] = _.sortBy(keepRanges, v => v[0]);

        // console.log('resultBool', resultBool);
      },
      getHighlightedText() {
        console.log('getting highlighted text');
        let selection;
        if (window.getSelection) {
          selection = window.getSelection();
        } else {
          selection = document.selection.createRange(); // .toString();
        }
        console.log(selection);
        if (selection) {
          console.log('got a selection');
          const startNodeIdx = parseInt(selection.anchorNode.parentElement.id.replace('c', ''), 0);
          const endNodeIdx = parseInt(selection.extentNode.parentElement.id.replace('c', ''), 0);
          const range = _.sortBy([startNodeIdx, endNodeIdx]);

          if ((range[1] - range[0]) > 0) {
            this.updateRange(range);
            this.$forceUpdate();
            selection.removeAllRanges();
          }
        }
      },
    },
  };
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

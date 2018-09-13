<template>
  <div ref="htext" class="highlighter" @mouseup="getHighlightedText" >
    <!-- <text-highlight :queries="queries" :caseSensitive="true">{{ text }}</text-highlight> -->
    <span v-for="(t, i) in rangeText"
     :id="'c'+i"
     :class="{activeHighlight: t.rangeName}"
     :style="getRangeStyle(t.rangeName)"
     @click="rangeAction(i)"
     >{{t.txt}}</span>
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
      rangeText() {
        const outputs = [];
        let currentEntry = {};
        const tracker = [];
        // check membership of each character
        if (this.text) {
          for (let i = 0; i < this.text.length; i += 1) {
            const r = this.whichRange(i); // this is a list
            tracker.push(r);
            if (!i) {
              currentEntry.rangeName = r;
              currentEntry.txt = this.text[i];
              currentEntry.start = i;
            } else {
                /* eslint-disable */
                if (!_.isEqual(r, tracker[i - 1])) {
                  /* eslint-enable */
                  // add entry to outputs and intialize a new one
                  outputs.push(currentEntry);
                  currentEntry = {};
                  currentEntry.rangeName = r;
                  currentEntry.txt = this.text[i];
                  currentEntry.start = i;
                } else {
                  // they are in the same group
                  currentEntry.txt += this.text[i];
                }
            }
          }
          outputs.push(currentEntry);
          return outputs;
        }
        return [];
      },
      ranges() {
        return this.rangeClasses[this.currentRange];
      },
      // isInRange() {
      //   return _.map(this.text, (obj, idx) => this.inRange(idx));
      // },
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
      getRangeStyle(rangeNames) {
        if (rangeNames == null) {
          return {};
        }

        if (rangeNames.length === 1) {
          return this.rangeStyles[rangeNames[0]];
        } else {
          const allRangeColors = _.map(rangeNames, r => this.rangeStyles[r]['background-color']);
          console.log(this.rangeStyles, rangeNames, allRangeColors);
          const sWidth = 20;
          let bgStringStart = `repeating-linear-gradient(45deg, ${allRangeColors[0]}, ${allRangeColors[0]} ${sWidth}px`;

          for (let i = 1; i < allRangeColors.length; i += 1) {
            bgStringStart += `,${allRangeColors[i]} ${sWidth}px`;
            bgStringStart += `,${allRangeColors[i]} ${sWidth * (i + 1)}px`;
          }
          console.log(`${bgStringStart})`);
          return {
            color: 'white',
            background: `${bgStringStart})`,
          };
        }
      },
      rangeAction(i) {
        const selectedRange = this.rangeText[i]; // this.whichRange(i);
        console.log('range action on char', i, 'in range Object', selectedRange);
        if (selectedRange) {
          if (selectedRange.rangeName != null) {
            const rangeAction = this.rangeActions[selectedRange.rangeName[0]];
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
        }
      },
      emitRange(idx, selectedRange) {
        // const selectedRange = this.whichRange(idx);
        if (selectedRange) {
          this.$emit('rangeClick', selectedRange.rangeName, idx);
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
          const mergeableArray = _.map(rangeBelong, b => this.rangeStyles[b].mergeable);
          // if mergeable array has a False, then...
          if (mergeableArray.indexOf(false) >= 0) {
            return [rangeBelong[mergeableArray.indexOf(false)]];
          }

          return rangeBelong;
        }
        return null;
      },
      removeRange(i, cRange) {
        // console.log('remove range', i, cRange);
        if (cRange.rangeName != null) {
          _.map(cRange.rangeName, (R) => {
            const ranges = this.rangeClasses[R];

            // TODO: there is a 0 here!!
            const rElem = _.filter(ranges, r => r[0] === cRange.start);
            // console.log(rElem);
            const idx = ranges.indexOf(rElem[0]);
            // console.log(idx, this.ranges);
            if (idx > -1) {
              this.rangeClasses[R].splice(idx, 1);
            }
          });
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
        // console.log('getting highlighted text');
        let selection;
        if (window.getSelection) {
          selection = window.getSelection();
        } else {
          selection = document.selection.createRange(); // .toString();
        }

        if (selection) {
          // console.log('got a selection', selection);
          const startNodeIdx = parseInt(selection.anchorNode.parentElement.id.replace('c', ''), 0);
          const endNodeIdx = parseInt(selection.extentNode.parentElement.id.replace('c', ''), 0);

          const startRange = this.rangeText[startNodeIdx];
          const endRange = this.rangeText[endNodeIdx];

          const startOffset = selection.anchorOffset;
          const endOffset = selection.extentOffset;

          // console.log(startNodeIdx, startRange, startOffset);
          // console.log(endNodeIdx, endRange, selection, endOffset);

          const range = _.sortBy([startRange.start + startOffset, endRange.start + endOffset]);
          // console.log(range);

          // rangeTexts[rangeNodes]

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

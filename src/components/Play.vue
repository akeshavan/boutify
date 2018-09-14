<template name="play">
  <div id="play">
    <div  class="container">
    <!-- Modal Component -->
    <b-modal id="levelUp" ref="levelUp" title="You've Levelled Up!" ok-only>
      <p class="my-4">
        <h3>Level {{currentLevel.level}}</h3>
        <img :src="currentLevel.img" width="120px" height="120px"/>
        <p class="lead">You've unlocked: {{currentLevel.character}}</p>
      </p>
    </b-modal>

    <div class="main pt-3">

      <div id="game" class="abtext">
        <h4 class="text-left">Highlight the help text</h4>

        <highlighter :text="helpText"
          :currentRange="currentRange"
          :rangeClasses="rangeClasses"
          :rangeStyles="rangeStyles"
          :rangeActions="rangeActions"
          v-on:rangeClick="setCurrentRange"
        ></highlighter>

      </div>

      <sidebar v-if="sidebarShow"
       :param="currentParamText"
       :sidebarStyle="this.rangeStyles[this.currentParamName]">
      </sidebar>

      <b-alert :show="dismissCountDown"
         :variant="score.variant"
         class="toast"
         @dismissed="dismissCountdown=0"
         @dismiss-count-down="countDownChanged">
         {{score.message}}
      </b-alert>

    </div>

  </div>


  <b-navbar toggleable="md"
    class="navbar-fixed-bottom" id="bottonNav"
    :style="rangeStyles[currentRange]">
    <div>You are highlighting: {{currentParamText}}</div>

    <b-navbar-nav class="ml-auto">

      <b-nav-form right>
        <!--<b-form-input size="sm" class="mr-sm-2" type="text" placeholder="Search"/>-->

        <b-button @click="sidebarShow = !sidebarShow"> show sidebar </b-button>

        <b-button size="md" class="my-2 my-sm-0 ml-2" v-on:click="addNewParam" v-if="highlightMode === 'help'">
          <span v-if="status === 'loading'">
            <i class="fa fa-spinner fa-spin"></i>
          </span>
          <span v-else>
            <span>
              Add New Parameter
            </span>
          </span>
        </b-button>

        <b-button size="md" class="my-2 my-sm-0 ml-2" v-on:click="doneAddingParam" v-else>
          <span v-if="status === 'loading'">
            <i class="fa fa-spinner fa-spin"></i>
          </span>
          <span v-else>
            <span>
              Done Adding Parameter
            </span>
          </span>
        </b-button>

        <b-button size="md" class="my-2 my-sm-0 ml-2" v-on:click="next">
          <span v-if="status === 'loading'">
            <i class="fa fa-spinner fa-spin"></i>
          </span>
          <span v-else>
            <span>
              Submit
            </span>
          </span>
        </b-button>

      </b-nav-form>

    </b-navbar-nav>

  </b-navbar>
  </div>
</template>

<style>

  .btn:not(:disabled):not(.disabled) {
      cursor: pointer;
  }

  #bottonNav {
    position: fixed !important;
    bottom: 0;
    width: 100%;
    height: 56px;
  }

  .abtext {
    padding-bottom: 60px;
  }

  .inputManual {
    width: 75px;
  }

    h4.left-align {
      text-align: left;
      padding-top: 30px;
    }

    .nl-Value {
      color: #dc3545;
      cursor: pointer;
      background-color: #ffc1075e;
      padding: 3px;
      border-style: solid;
      border-color: #ffc1075e;
      border-radius: 5px;
      border-width: thin;
      }

      .nl-Disease {
        color: #007BF5;
      }

      .nl-StudyType {
        color: #0c5460;
        background: #e9ecef6e;
        padding: 1px;
        border-radius: 5px;
      }

      .nl-Animal {
          color: #0c5460;
          background: #e9ecef;
          padding: 1px;
          border-radius: 5px;
      }

      .nl-Method {
          color: #0c5460;
          background: #e9ecef;
          padding: 1px;
          border-radius: 5px;
      }



      .nl-Instrumentation {
          color: #1b1e21;
          /* background-color: #80bdff6e; */
          /* padding: 3px; */
          border-bottom-style: solid;
          border-bottom-width: initial;
          border-right-style: none;
          border-left-style: none;
          border-top-style: none;
          /* border-style: solid; */
          border-color: #dc35458f;
          border-radius: 5px;
          /* border-width: thin; */
      }

    .selectedNumber {
      border-width: thick;
      border-color: #dc3545;
      }

    .bshelf {
      height: 250px;
      position: absolute;
    }

    @media (min-width: 768px) {
      .bshelf {
        left: 0;
        right: 0;
      }
     }

    .text-justify{
      padding-bottom: 40px;
    }

</style>

<script>
  import Vue from 'vue';
  import _ from 'lodash';
  import axios from 'axios';
  import nlp from 'compromise';
  import { VueHammer } from 'vue2-hammer';
  import GridLoader from 'vue-spinner/src/PulseLoader';
  import { db } from '../firebaseConfig';
  import config from '../config';
  import bookshelf from './bookshelf';
  import highlighter from './Highlighter3';
  import sidebar from './Sidebar';

  const d3 = require('d3-scale-chromatic');
  d3.color = require('d3-color');

  window.d3 = d3;

  nlp.plugin({
    regex: {
      '[0-9]+': 'Value',
    },
  });

  window.db = db;

  Vue.use(VueHammer);

  Vue.use(require('vue-shortkey'));

  export default {
    name: 'play',
    props: ['userInfo', 'userData', 'levels', 'currentLevel', 'anonID'],
    firebase: {

    },
    data() {
      return {
        abstract: 'this is the abstract...',
        N: null,
        imageBaseUrl: config.imageBaseUrl,
        cmdline: null,
        startTime: null,
        dismissSecs: 1,
        pointsAward: null,
        dismissCountDown: 0,
        currentCount: {},
        score: {
          variant: 'warning',
          message: '',
        },
        status: 'loading',
        helpText: null,
        helpTextAll: '',
        helpParams: [],

        rangeClasses: { default: [] },
        currentRange: 'default',
        rangeStyles: {
          default: {
            'background-color': '#ffc107c9',
          },
        },
        rangeActions: {
          default: 'removeRange',
        },

        highlightMode: 'help',
        sidebarShow: false,

      };
    },
    computed: {
      currentParamText() {
        if (this.rangeClasses[this.currentRange]) {
          if (this.rangeClasses[this.currentRange.replace('h', 'p')][0]) {
            const rMin = this.rangeClasses[this.currentRange.replace('h', 'p')][0][0];
            const rMax = this.rangeClasses[this.currentRange.replace('h', 'p')][0][1];
            return this.helpText.slice(rMin, rMax);
          }
          // return this.helpText.slice(rMin, rMax - rMin);
        }
        return null;
      },
      currentParamName() {
        if (this.rangeClasses[this.currentRange]) {
          if (this.rangeClasses[this.currentRange.replace('h', 'p')][0]) {
            return this.currentRange.replace('h', 'p');
          }
          // return this.helpText.slice(rMin, rMax - rMin);
        }
        return null;
      },
    },
    watch: {
      N() {
        this.$emit('updatedN', this.N);
      },
      status() {
        this.$emit('updatedStatus', this.status);
      },
      currentLevel() {
        console.log('detected change', this.userData.score, this.currentLevel.min);
        if (this.userData.score === this.currentLevel.min && this.currentLevel.min) {
          this.$refs.levelUp.show();
          db.ref(`/users/${this.userInfo.displayName}`).child('level').set(this.currentLevel.level);
        }
      },
      $route() {
        console.log('params are', this.$route.params.cmdline);
        this.renderCmdline();
      },
    },
    mounted() {
      this.renderCmdline();
    },
    components: { GridLoader, bookshelf, highlighter, sidebar },
    directives: {
    },
    methods: {
      doneAddingParam() {
        this.highlightMode = 'help';
        this.currentRange = this.currentRange.replace('p', 'h');
      },
      addNewParam() {
        this.highlightMode = 'param';
        const N = _.filter(Object.keys(this.rangeClasses), k => k[0] === 'p').length;
        const pclassname = `p${N + 1}`;
        const hclassname = `h${N + 1}`;
        const pcolor = d3.schemeDark2[(N + 1) % 8];
        const hcolor = pcolor;

        this.$set(this.rangeClasses, pclassname, []);
        this.$set(this.rangeClasses, hclassname, []);

        // this.rangeClasses[pclassname] = [];
        // this.rangeClasses[hclassname] = [];
        this.$set(this.rangeStyles, pclassname, {
          'border-bottom-color': pcolor,
          'border-bottom-style': 'solid',
          'border-top-color': pcolor,
          'border-top-style': 'solid',
          'font-weight': 'bold',
          'background-color': 'white',
          color: pcolor,
          cursor: 'pointer',
          mergeable: false,
        });

        // this.rangeStyles[pclassname] = {
        //   'border-bottom-color': pcolor,
        //   'border-bottom-style': 'dashed',
        //   'border-top-color': pcolor,
        //   'border-top-style': 'solid',
        //   'font-weight': 'bold',
        //   'background-color': pcolor,
        //   color: pcolor,
        //   cursor: 'pointer',
        // };

        this.$set(this.rangeStyles, hclassname, {
          'background-color': hcolor,
          color: 'white',
          cursor: 'pointer',
          mergeable: true,
        });

        // this.rangeStyles[hclassname] = {
        //   'background-color': hcolor,
        //   color: 'black',
        //   cursor: 'pointer',
        // };

        this.rangeActions[pclassname] = 'emitRange';
        this.rangeActions[hclassname] = 'emitRemoveRange';

        this.currentRange = pclassname;

        this.$forceUpdate();
      },

      renderCmdline() {
        this.startTime = new Date();
        this.cmdline = `${config.imageBaseUrl}${this.$route.params.cmdline}.${config.imageExt}`;
        axios.get(this.cmdline).then((resp) => {
          console.log('response is', resp.data);
          this.helpTextAll = resp.data.helptext;
          this.helpText = this.helpTextAll.join('\n');
          this.helpParams = resp.data.params;
          this.initRanges();

          this.status = 'ready';
        });
      },
      setCurrentRange(cRange) {
        console.log('setting current range', cRange);
        if (cRange != null && this.highlightMode === 'help') {
          this.currentRange = cRange[0].replace('p', 'h');
        } else {
          // have to remove the new parameter that was added.
          this.rangeClasses[cRange[0]] = [];
        }
      },
      initRanges() {
        const rangeClasses = {};
        const rangeStyles = {};
        const currentRange = 'h0';
        const rangeActions = {};

        this.helpParams.forEach((p, i) => {
          const pclassname = `p${i}`;
          const hclassname = `h${i}`;

          rangeClasses[pclassname] = [p.param_range];
          rangeClasses[hclassname] = [p.help_range];

          const pcolor = d3.schemeDark2[i % 8];
          const hcolor = d3.schemeDark2[i % 8];
          // let hcolor = d3.color.color(d3.schemeDark2[i % 8]);
          // hcolor.opacity = 0.6;

          /* eslint-disable */
          // hcolor = hcolor + '';
          /* eslint-enable */

          rangeStyles[pclassname] = {
            'border-bottom-color': pcolor,
            'border-bottom-style': 'solid',
            'border-top-color': pcolor,
            'border-top-style': 'solid',
            'font-weight': 'bold',
            'background-color': 'white',
            // 'background-color': pcolor,
            color: pcolor,
            cursor: 'pointer',
            mergeable: false,
          };
          rangeStyles[hclassname] = {
            'background-color': hcolor,
            color: 'white',
            cursor: 'pointer',
            mergeable: true,
          };

          rangeActions[pclassname] = 'emitRange';
          rangeActions[hclassname] = 'emitRemoveRange';
        });

        this.rangeClasses = rangeClasses;
        this.rangeActions = rangeActions;
        this.rangeStyles = rangeStyles;
        this.currentRange = currentRange;

        db.ref('latestCmdlines').child(this.$route.params.cmdline).once('value')
        .then((snap) => {
          const val = snap.val();
          const RangeClasses = this.rangeClasses;
          const existingKeys = Object.keys(RangeClasses);
          console.log('existing range classes', RangeClasses);

          if (val) {
            if (val.annot) {
              // pop out all the h classes, and then replace w/ rclasses
              const annotKeys = Object.keys(val.annot);
              _.map(existingKeys, (k) => {
                // if (k[0] === 'h') {
                if (annotKeys.indexOf(k) >= 0) {
                  // this.$set(this.rangeClasses, k, val.annot[k]);
                  this.rangeClasses[k] = val.annot[k];
                } else {
                  this.rangeClasses[k] = [];
                  // this.$set(this.rangeClasses, k, []);
                }
                // }
              });

              // but if there were new keys added, add them to the Vue class
              const newKeys = _.filter(annotKeys, a => existingKeys.indexOf(a) < 0);
              _.map(newKeys, (k) => {
                this.$set(this.rangeClasses, k, val.annot[k]);
                // const N = _.filter(Object.keys(this.rangeClasses), x => x[0] === 'p').length;
                const color = d3.schemeDark2[parseInt(k.replace('p', '').replace('h', ''), 0) % 8];
                // console.log(N % 8, color);
                if (k[0] === 'p') {
                  // give the style and action parameters here for help text
                  this.$set(this.rangeStyles, k, {
                    'border-bottom-color': color,
                    'border-bottom-style': 'solid',
                    'border-top-color': color,
                    'border-top-style': 'solid',
                    'font-weight': 'bold',
                    'background-color': 'white',
                    // 'background-color': pcolor,
                    color,
                    cursor: 'pointer',
                    mergeable: false,
                  });
                  this.$set(this.rangeActions, k, 'emitRange');
                } else {
                  // give the style and action parameters here for parameter name;
                  this.$set(this.rangeStyles, k, {
                    'background-color': color,
                    color: 'white',
                    cursor: 'pointer',
                    mergeable: true,
                  });
                  this.$set(this.rangeActions, k, 'emitRemoveRange');
                }
              });
            } else {
              console.log('there is nothing to annotate, but did someone delete stuff?');
              if (val.user && val.time) {
                // delete all h keys!
                _.map(existingKeys, (k) => {
                  if (k[0] === 'h') {
                    this.rangeClasses[k] = [];
                  }
                });
              }
            }
          }
        });
      },
      preventSubmit(e) {
        e.preventDefault();
        this.next();
      },
      next() {
        // encode the indices
        const rC = Object.keys(this.rangeClasses);
        const toSubmit = {};

        _.map(rC, (rangeKey) => {
          toSubmit[rangeKey] = this.rangeClasses[rangeKey].reduce((acc, cur, i) => {
            acc[i] = cur;
            return acc;
          }, {});
        });

        // emit to App to submit
        this.$emit('submit', toSubmit, this.$route.params.cmdline);
      },

      countDownChanged(dismissCountDown) {
        this.dismissCountDown = dismissCountDown;
      },
      showAlert() {
        this.dismissCountDown = this.dismissSecs;
      },
    },
  };
</script>

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
        <b-alert show dismissible v-if="userInfo.isAnonymous" variant="danger">
          <router-link to="/login"> Log In</router-link> or <router-link to="/signup"> Sign Up</router-link> now to compete on the leaderboard!
        </b-alert>

        <highlighter :text="helpText"
          :currentRange="currentRange"
          :rangeClasses="rangeClasses"
          :rangeStyles="rangeStyles"
          :rangeActions="rangeActions"
        ></highlighter>

      </div>

      <b-alert :show="dismissCountDown"
         :variant="score.variant"
         class="toast"
         @dismissed="dismissCountdown=0"
         @dismiss-count-down="countDownChanged">
         {{score.message}}
      </b-alert>

    </div>

  </div>


  <b-navbar toggleable="md" type="dark" variant="danger"
    class="navbar-fixed-bottom" id="bottonNav"
    style="">

    <b-navbar-nav>
      <b-nav-form>
        <!--<b-form-input size="sm" class="mr-sm-2" type="text" placeholder="Search"/>-->
        <!-- <b-button size="md" class="my-2 my-sm-0 ml-2" v-on:click="next">
          <span v-if="status === 'loading'">
            <i class="fa fa-spinner fa-spin"></i>
          </span>
          <span v-else>
            <span v-if="N">
              Submit
            </span>
            <span v-else>
              Skip
            </span>
          </span>
        </b-button> -->

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
  import highlighter from './Highlighter';

  nlp.plugin({
    regex: {
      '[0-9]+': 'Value',
    },
  });

  window.db = db;

  Vue.use(VueHammer);

  Vue.use(require('vue-shortkey'));

  function randomInt(min, max) {
    return Math.floor(Math.random() * ((max - min) + 1)) + min;
  }


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

        rangeClasses: {default: []},
        currentRange: 'default',
        rangeStyles: {
          default: {
            'background-color': '#ffc107c9',
          }
        },
        rangeActions: {
          default: 'removeRange',
        },

      };
    },
    computed: {

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
      },
    },
    mounted() {
      this.startTime = new Date();
      this.setCurrentAbstract();
      this.cmdline = `${config.imageBaseUrl}${this.$route.params.cmdline}.${config.imageExt}`;
      axios.get(this.cmdline).then((resp) => {
        console.log('response is', resp.data);
        this.helpTextAll = resp.data.helptext;
        this.helpText = this.helpTextAll.join('\n');
        this.helpParams = resp.data.params;
      });
    },
    components: { GridLoader, bookshelf, highlighter, },
    directives: {
    },
    methods: {

      preventSubmit(e) {
        e.preventDefault();
        this.next();
      },
      next() {
        this.setCurrentAbstract();
      },
      setCurrentAbstract() {

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

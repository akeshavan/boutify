<template>
  <div id="app">
    <!-- The Navbar below stays constant throughout the app.
         We've set up links on the navbar to different "routes",
         like the "Home" page and "About" page.

         There is also a right-aligned link to Login with GitHub.
         When logged in, this shows the username with a dropdown menu
         to see the profile or logout.
    -->
    <div class="content">

    <b-navbar toggleable="md" type="dark" variant="secondary" sticky>

      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

      <b-navbar-brand to="/">boutify.</b-navbar-brand>

      <!-- If the viewport is small, the navbar collapses.
          Everything in b-collapse is what gets collapsed.
      -->
      <b-collapse is-nav id="nav_collapse">

        <!--  Here are links to different routes  -->
        <b-navbar-nav>
          <b-nav-item to="/about" exact>About</b-nav-item>
          <b-nav-item to="/leaderboard">Leaderboard</b-nav-item>
          <b-nav-item v-if="userInfo && currentCmd" :to="'/play/'+currentCmd">Play</b-nav-item>
        </b-navbar-nav>

        <!-- Right aligned nav items -->

        <b-navbar-nav class="ml-auto">
          <!-- This part only displays if the user is authenticated -->
          <b-nav-item-dropdown right v-if="userInfo">
            <template slot="button-content">
              <em>{{userInfo.displayName}}</em>
            </template>
            <b-dropdown-item to="/profile">Profile</b-dropdown-item>
            <b-dropdown-item @click="logout">Signout</b-dropdown-item>
          </b-nav-item-dropdown>

          <!-- The login option shows if the user is not authenticated -->

          <b-nav-item v-else to="login">Login</b-nav-item>

          <b-nav-text v-if="userInfo">
            <b-img v-if="currentLevel.img"
              rounded="circle" width="20"
              height="20"
              alt="img" class="m-1"
              :src="currentLevel.img"
              />
            {{userData.score}}
          </b-nav-text>


        </b-navbar-nav>

      </b-collapse>





    </b-navbar>

    <!-- The content is in the router view -->
    <!-- the modal -->

    <div class="router">
      <router-view :userInfo="userInfo"
                   :userData="userData"
                   :allUsers="allUsers"
                   :levels="levels"
                   :anonID="anonID"
                   :currentLevel="currentLevel"
                   :currentCmd="currentCmd"
                   v-on:updatedStatus="updateStatus"
                   v-on:submit="submitAnnotation"
                   v-on:login="setUser"
                   ref="routeView"
                   />
    </div>
  </div>

  </div>
</template>

<script>
import Vue from 'vue';
import axios from 'axios';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import _ from 'lodash';
import VueFire from 'vuefire';
import firebase from 'firebase';
import { db } from './firebaseConfig';
import jelly from './assets/jelly.svg';
import giraffe from './assets/giraffe.svg';
import elephant from './assets/elephant.svg';
import narwhal from './assets/narwhal.svg';
import monkey from './assets/monkey.svg';
import jelly_grey from './assets/jelly_gray.svg';
import giraffe_grey from './assets/giraffe_gray.svg';
import elephant_grey from './assets/elephant_gray.svg';
import narwhal_grey from './assets/narwhal_gray.svg';
import monkey_grey from './assets/monkey_gray.svg';
import '../node_modules/font-awesome/css/font-awesome.min.css';
import config from './config';


// explicit installation required in module environments
Vue.use(VueFire);
Vue.use(BootstrapVue);


function randomInt(min, max) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export default {
  name: 'app',
  data() {
    return {
      userInfo: {},
      allUsers: [],
      currentCmd: null,
      allCmds: [],
      userSeen: [],
      anonID: null,
      Nusers: 50,
      N: 0,
      // currentCmd: '3dresample',
      status: 'loading',
      levels: {
        0: {
          level: 0,
          min: 0,
          max: 20,
          character: null,
          img: null,
          img_grey: null,
        },
        1: {
          level: 1,
          min: 21,
          max: 50,
          character: 'jelly',
          img: jelly,
          img_grey: jelly_grey,
        },
        2: {
          level: 2,
          min: 51,
          max: 100,
          character: 'giraffe',
          img: giraffe,
          img_grey: giraffe_grey,
        },
        3: {
          level: 3,
          min: 101,
          max: 500,
          character: 'elephant',
          img: elephant,
          img_grey: elephant_grey,
        },
        4: {
          level: 4,
          min: 501,
          max: 1000,
          character: 'narwhal',
          img: narwhal,
          img_grey: narwhal_grey,
        },
        5: {
          level: 5,
          min: 1001,
          max: 8000,
          character: 'monkey',
          img: monkey,
          img_grey: monkey_grey,
        },
      },
    };
  },

  mounted() {
    // make sure our database has all the programs listed on github
    if (this.userInfo) {
      axios.get(config.allSrcs).then((resp) => {
        const srcs = resp.data;
        // console.log(srcs);
        const existCmds = _.map(this.allCmds, v => v['.key']);
        // console.log(existCmds);
        _.map(srcs, (sj) => {
          const s = sj.split('.json')[0];
          // of all the github sources check to see if it exists in firebase
          if (existCmds.indexOf(s) < 0) {
            // the command isn't recorded in firebase! so add it and give it 0 votes
            // console.log('s', s);
            db.ref('allCmds').child(s).set(0);
          }
        });

      });
    }
  },

  firebase: {
    allUsers: db.ref('/users/').orderByChild('score'),
    // allCmds: db.ref('/allCmds'),
  },

  watch: {
    // userInfo() {
    //   const self = this;
    //   console.log('watching user info', this.userInfo);
    //   if (this.userInfo != undefined) {
    //     // there is a user display name but a command hasn't been defined.
    //     // grab all the commands the user has done by displayName.
    //     if (this.userInfo.displayName) {
    //       this.updateDoneCmds();
    //     }
    //   }
    // },
  },

  computed: {
    cmdPriority() {
      return _.sortBy(this.allCmds, ".value")
    },
    userData() {
      let data = {};
      if (!this.userInfo) {
        return data;
      }
      this.allUsers.forEach((val) => {
        if (val['.key'] === this.userInfo.displayName) {
          data = val;
        }
      });
      return data;
    },

    currentLevel() {
      let clev = {};
      _.mapValues(this.levels, (val) => {
        if (this.userData.score >= val.min && this.userData.score <= val.max) {
          clev = val;
        }
      });

      return clev;
    },

  },
  methods: {
    getCurrentCmd() {
      if (this.userInfo) {
        console.log('getting the current command for', this.userInfo.displayName);
        const nextCmds = this.cmdUserPriority();
        return nextCmds[0]['.key'];
      }
    },

    updateDoneCmds() {
      db.ref('doneCmds').child(this.userInfo.displayName).on('value', (snap) => {
        const val = snap.val();
        if (val) {
          this.userSeen = val
        } else {
          this.userSeen = [];
        }
        console.log('the user seen is', this.userSeen);
        // const nextCmds = this.cmdUserPriority();
        this.currentCmd = this.getCurrentCmd();
        this.$router.replace(`play/${this.currentCmd}`);
      });
    },

    cmdUserPriority() {
      if (this.userInfo) {
        // remove all the cmds that the user has seen
        let cmdsRemain;
        if (this.userSeen) {
          cmdsRemain = _.filter(this.cmdPriority, (v) => {
            // console.log('v', v['.key'])
              return Object.keys(this.userSeen).indexOf(v['.key']) < 0
          });
        } else {
          cmdsRemain = this.cmdPriority;
        }
        console.log('remaining commands', cmdsRemain);

        if (cmdsRemain.length) {
          console.log('cmdsRemain', cmdsRemain);
          // get the smallest value that hasn't been seen by user
          const minUnseen = cmdsRemain[0]['.value']
          console.log('minUNseen', minUnseen);
          // then filter the commands so they are only the smallest value;
          const cmdsSmallest = _.filter(cmdsRemain, (c) => {
            return c['.value'] == minUnseen;
          });

          console.log('smallest cmds', cmdsSmallest);
          // and then randomize the order;
          return shuffle(cmdsSmallest);
        } else {
          return shuffle(this.cmdPriority);
        }

      }
      return null
    },

    submitAnnotation(annot, cmdline) {
      console.log('you are submitting', annot, cmdline);
      // submit to db
      db.ref('cmdlines').child(cmdline).push(
        { annot, user: this.userInfo.displayName, time: new Date().toISOString() }
      )

      db.ref('latestCmdlines').child(cmdline).set(
        { annot, user: this.userInfo.displayName, time: new Date().toISOString() }
      )

      db.ref('doneCmds')
        .child(this.userInfo.displayName)
        .child(cmdline)
        .transaction(function(score) {
          // If score has never been set, score will be `null`.
          return (score || 0) + 1;
        });

      db.ref('allCmds').child(cmdline)
        .transaction(function(score) {
          // If score has never been set, score will be `null`.
          return (score || 0) + 1;
        });

      this.incrementUserScore();

      // get next cmdline
      this.next();
    },

    incrementUserScore() {
      const ref = db.ref('users').child(this.userInfo.displayName).child('score');
      ref.transaction(function(score) {
        // If score has never been set, score will be `null`.
        return (score || 0) + 1;
      });
    },

    updateStatus(status) {
      console.log('updating status');
      this.status = status;
    },

    next() {
      console.log('getting the next cmdline to play');
      // const nextCmds = this.cmdUserPriority();
      this.currentCmd = this.getCurrentCmd();
      this.$router.push(`/play/${this.currentCmd}`);
    },

    preventSubmit(e) {
      e.preventDefault();
      this.$refs.manual.hide();
    },

    logout() {
      firebase.auth().signOut().then(() => {
        this.userInfo = null;
        this.$router.push('login');
      });
    },

    setUser(user) {
      console.log('setting user', this.userInfo);
      this.userInfo = user;
      console.log(this.userInfo.displayName);
      this.updateDoneCmds();
    },
  },

  created() {
    this.userInfo = firebase.auth().currentUser;
    const self = this;
    firebase.auth().onAuthStateChanged((user) => {
      console.log('the auth state has changed. user is', user);
      self.userInfo = user;
      if (user) {
        // the user can now see all of the commands
        db.ref('allCmds').on('value', (snap) => {
          const vals = snap.val();
          if (vals) {
            const keys = Object.keys(vals);
            this.allCmds = _.map(keys, (k) => {
              return {'.key': k, '.value': vals[k]}
            });
          }
        });

        if (user.displayName) {
          this.updateDoneCmds();
        }

      }
    });
    console.log('app db is', db);
  },
};
</script>

<style>
  /*
    You can style your component here. Since this is a top level componentm
    the styles follow into child components.
  */

  html, body {
    height: 100%;
  }
  body {
    display: flex;
    flex-direction: column;
  }
  .content {
    flex: 1 0 auto;
    min-height: -webkit-fill-available;
    height: fit-content;
  }

  .footer {
    position: relative;
    height: 200px;
  }

  @font-face {
    font-family: NotoSans-Regular;
    src: url('./assets/NotoSans-Regular.ttf');
  }

  #app {
    font-family: 'Courier', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    /*color: #2c3e50;*/
  }

  .router {
    /*padding-top: 40px;*/
  }

  #signupForm {
    max-width: 400px;
    padding: 20px;
    margin-top: 20px;
    box-shadow: 0px 0 7px 0px #80808036;
  }

  .inline {

  }




</style>

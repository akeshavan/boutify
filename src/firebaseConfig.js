import firebase from 'firebase';

// copy/paste this from your firebase console
var config = {
  apiKey: "AIzaSyDGbyu-V0Qw-JPm64Rcv7TrbpBTT4YcTEw",
  authDomain: "boutify-afni.firebaseapp.com",
  databaseURL: "https://boutify-afni.firebaseio.com",
  projectId: "boutify-afni",
  storageBucket: "",
  messagingSenderId: "233251091002"
};

firebase.initializeApp(config);

export const db = firebase.database();

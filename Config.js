import firebase from 'firebase';
require('@firebase/firestore');

var firebaseConfig = {
  apiKey: "AIzaSyDvG5gY4RBCLvkMEdNv7qYtJ4uBYUfPi9E",
  authDomain: "wili-3e050.firebaseapp.com",
  databaseURL: "https://wili-3e050.firebaseio.com",
  projectId: "wili-3e050",
  storageBucket: "wili-3e050.appspot.com",
  messagingSenderId: "251523267141",
  appId: "1:251523267141:web:bbe30b422bdcc6277b412c"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
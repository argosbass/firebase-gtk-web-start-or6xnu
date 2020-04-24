// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

var rsvpListener = null;
var guestbookListener = null;

// Add Firebase project configuration object here
// var firebaseConfig = {};
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyDH3VnWOUJdvfYpWv8AbUapE9ekyaBkYTg",
    authDomain: "fir-web-codelab-e9104.firebaseapp.com",
    databaseURL: "https://fir-web-codelab-e9104.firebaseio.com",
    projectId: "fir-web-codelab-e9104",
    storageBucket: "fir-web-codelab-e9104.appspot.com",
    messagingSenderId: "33013693987",
    appId: "1:33013693987:web:251d21153dd4d5a046fb96"
  };

firebase.initializeApp(firebaseConfig);

// FirebaseUI config
const uiConfig = {
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [
    // Email / Password Provider.
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl){
      // Handle sign-in.
      // Return false to avoid redirect.
      return false;
    }
  }
};

const ui = new firebaseui.auth.AuthUI(firebase.auth());

startRsvpButton.addEventListener("click", ()=>{

  if( firebase.auth().currentUser )
  {
    firebase.auth().signOut();
  }
  else
  {
    ui.start("#firebaseui-auth-container", uiConfig);
  }


});

firebase.auth().onAuthStateChanged( (user)=>{

  if(user)
  {
    startRsvpButton.textContent = 'LOGOUT';
    
    guestbookContainer.style.display = "block";
    
    suscribeGuestbook();

    suscribeCurrentRSVP( user );

  }
  else
  {
    startRsvpButton.textContent = 'RSVP';
    
    guestbookContainer.style.display = "none";

    unsuscribeGuestbook();

    unsuscribeCurrentRSVP();

  }

} );


form.addEventListener("submit", (e)=>{
  e.preventDefault();

  firebase.firestore().collection("guestbook").add({
    text:input.value,
    timestamp: Date.now(),
    name: firebase.auth().currentUser.displayName,
    userId: firebase.auth().currentUser.uid
  });

  input.value = "";

  return false;
  
});


function suscribeGuestbook()
{
 guestbookListener =
  firebase.firestore().collection("guestbook")
  .orderBy("timestamp","desc").onSnapshot((snaps) =>
    {
      guestbook.innerHTML = "";

      snaps.forEach( (doc)=>{ 

        const entry = document.createElement("p");
        entry.textContent = doc.data().name + ": " + doc.data().text;

        guestbook.appendChild(entry); 

      } );
    } );
}
function unsuscribeGuestbook()
{
  if(guestbookListener != null)
  {
    // llamarlo primero para que mantenga
    //  la conection
    guestbookListener();

    guestbookListener = null;

  }
}



rsvpYes.onclick = () => 
{
  const userDoc = firebase.firestore().collection("attendees")
  .doc(firebase.auth().currentUser.uid);

  userDoc.set( { attending: true }  )
    .catch(console.error);

}

rsvpNo.onclick = () => 
{
  const userDoc = firebase.firestore().collection("attendees")
  .doc(firebase.auth().currentUser.uid);

  userDoc.set( { attending: false }  )
    .catch(console.error);

}

firebase.firestore().collection("attendees")
.where("attending","==",true).onSnapshot((snap) =>{
  const newAttendeeCount = snap.docs.length;
  numberAttending.innerHTML = newAttendeeCount + " attendings";

} );

function suscribeCurrentRSVP(user)
{
  rsvpListener =  firebase.firestore().collection("attendees")
  .doc( user.uid ).onSnapshot(
    (doc) => {
      if(doc && doc.data())
      {
        const attendingResponse = doc.data().attending;

        if( attendingResponse )
        {
          rsvpYes.className = "clicked";
          rsvpNo.className = "";
        }
        else
        {
          rsvpYes.className = "";
          rsvpNo.className = "clicked";
        }
      }
    }
  );
}

function unsuscribeCurrentRSVP()
{
  if(rsvpListener != null)
  {
    // llamarlo primero para que mantenga
    //  la conection
    rsvpListener();

    rsvpListener = null;

  }

 rsvpYes.className = "";
 rsvpNo.className = "";

}
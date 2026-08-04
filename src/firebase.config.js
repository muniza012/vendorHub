
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries
import {
  getAuth,
  createUserWithEmailAndPassword
}  from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
  
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyB84hhWDFCIaO06a9fhBoby15MsOQT9vg8",
    authDomain: "vendorhub-e5351.firebaseapp.com",
    projectId: "vendorhub-e5351",
    storageBucket: "vendorhub-e5351.firebasestorage.app",
    messagingSenderId: "258910033671",
    appId: "1:258910033671:web:2d96c8c271e79ba82bd7a2"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);


  export {
    auth,
    createUserWithEmailAndPassword,
  }
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBebR1r_hZrocQUSO3MhgPCHnhq2G2AIuM",
  authDomain: "vendorhub-9af3a.firebaseapp.com",
  projectId: "vendorhub-9af3a",
  storageBucket: "vendorhub-9af3a.firebasestorage.app",
  messagingSenderId: "545837018531",
  appId: "1:545837018531:web:c14446ea4bf5d1559ebe16",
  measurementId: "G-H77XM7CH5D"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function signUpFunction(displayName, email, password, profile = {}) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const profileData = {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    displayName: displayName || "",
    ...profile,
    createdAt: new Date().toISOString(),
  };
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }
  if (profile.role === "seller") {
    await setDoc(doc(db, "stores", userCredential.user.uid), profileData);
  }
  await setDoc(doc(db, "users", userCredential.user.uid), profileData);
  return userCredential.user;
}


async function createStoreFunction(vendorId, storeData) {
  await setDoc(doc(db, "stores", vendorId), {
    ownerId: vendorId,
    ...storeData,
    createdAt: new Date().toISOString(),
  });
}

async function loginFunction(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}


async function logOutUser() {
  await signOut(auth);
}

export {
  auth,
  db,
  signUpFunction,
  createStoreFunction,
  loginFunction,
  getUserProfile,
  getVendorProfile,
  updateVendorProfile,
  logOutUser,
};

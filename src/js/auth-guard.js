import { auth, db } from "../../firebase.config.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  // User is not logged in
  if (!user) {
    window.location.href = "home-before.html";
    return;
  }

  try {
    // Get user's role from Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      await signOut(auth);
      window.location.href = "home-before.html";
      return;
    }

    const userData = userSnapshot.data();
    const role = userData.role;

    // Get current file name
    const fileName = window.location.pathname.split("/").pop().toLowerCase();

    // =========================
    // SELLER PAGES
    // =========================

    if (fileName.startsWith("admin")) {
      if (role !== "seller") {
        redirectUser(role);
        return;
      }
    }

    // =========================
    // CUSTOMER PAGES
    // =========================

    const customerPages = [
      "logIndashboard.html",
      "orders.html",
      "checkout.html",
      "ordersuccess.html",
      'wishlist.html'
    ];

    if (customerPages.includes(fileName)) {
      if (role !== "customer") {
        redirectUser(role);
        return;
      }
    }
  } catch (error) {
    console.error("AUTH GUARD ERROR:", error);

    await signOut(auth);
    window.location.href = "home-before.html";
  }
});

function redirectUser(role) {
  if (role === "seller") {
    window.location.href = "admin-dashboard.html";
    return;
  }

  if (role === "customer") {
    window.location.href = "loginDashboard.html";
    return;
  }

  window.location.href = "home-before.html";
}

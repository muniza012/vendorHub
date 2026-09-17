import { db, auth } from "../../firebase.config.js";
import { animateBadge, setupHeaderAnimations } from "./headerAnimations.js";
import {
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";





// Customer Logout Handler
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "/"; // Redirects back to the public home/login page
    } catch (err) {
      console.error("Logout failed:", err);
    }
  });
}




let unsubscribeCart = null;
let unsubscribeWishlist = null;


// ======================================================
// AUTH STATE & REAL-TIME LISTENERS
// ======================================================

onAuthStateChanged(auth, (user) => {
  if (user) {
    listenToCartBadge(user.uid);
    listenToWishlistBadge(user.uid);
  } else {
    // Clear active listeners on logout
    if (unsubscribeCart) {
      unsubscribeCart();
      unsubscribeCart = null;
    }
    if (unsubscribeWishlist) {
      unsubscribeWishlist();
      unsubscribeWishlist = null;
    }

    // Reset badges to hidden
    resetBadge("cart-count");
    resetBadge("wishlist-count");
  }
});

// Helper function to reset badge element visibility
function resetBadge(elementId) {
  const badgeEl = document.getElementById(elementId);
  if (badgeEl) {
    badgeEl.textContent = "0";
    badgeEl.classList.add("hidden");
  }
}

// ======================================================
// CART BADGE LISTENER
// ======================================================

export function updateCartBadge(userId) {
  const targetUid = userId || auth.currentUser?.uid;
  if (targetUid) {
    listenToCartBadge(targetUid);
  } else {
    resetBadge("cart-count");
  }
}

function listenToCartBadge(userId) {
  const cartCount = document.getElementById("cart-count");
  if (!cartCount) return;

  if (unsubscribeCart) {
    unsubscribeCart();
  }

  const cartRef = collection(db, "users", userId, "cart");

  unsubscribeCart = onSnapshot(
    cartRef,
    (snapshot) => {
      let totalItems = 0;

      snapshot.docs.forEach((doc) => {
        const item = doc.data() || {};
        totalItems += Number(item.quantity || 1);
      });

      if (totalItems === 0) {
        cartCount.classList.add("hidden");
      } else {
        cartCount.classList.remove("hidden");
        cartCount.textContent = totalItems;
      }

      animateBadge(cartCount);
    },
    (error) => {
      console.error("CART BADGE LISTENER ERROR:", error);
    },
  );
}

// ======================================================
// WISHLIST BADGE LISTENER
// ======================================================

export function updateWishlistBadge(userId) {
  const targetUid = userId || auth.currentUser?.uid;
  if (targetUid) {
    listenToWishlistBadge(targetUid);
  } else {
    resetBadge("wishlist-count");
  }
}

function listenToWishlistBadge(userId) {
  const wishlistCount = document.getElementById("wishlist-count");
  if (!wishlistCount) return;

  if (unsubscribeWishlist) {
    unsubscribeWishlist();
  }

  const wishlistRef = collection(db, "users", userId, "wishlist");

  unsubscribeWishlist = onSnapshot(
    wishlistRef,
    (snapshot) => {
      const totalItems = snapshot.size;

      if (totalItems === 0) {
        wishlistCount.classList.add("hidden");
      } else {
        wishlistCount.classList.remove("hidden");
        wishlistCount.textContent = totalItems;
      }

      animateBadge(wishlistCount);
    },
    (error) => {
      console.error("WISHLIST BADGE LISTENER ERROR:", error);
    },
  );
}

// ======================================================
// DROPDOWN & HEADER ANIMATIONS
// ======================================================

const accountBtn = document.getElementById("account-btn");
const accountDropdown = document.getElementById("account-dropdown");

if (accountBtn && accountDropdown) {
  accountBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    accountDropdown.classList.toggle("hidden");
  });

  document.addEventListener("click", () => {
    accountDropdown.classList.add("hidden");
  });

  accountDropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}



setupHeaderAnimations();

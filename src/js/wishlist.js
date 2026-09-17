import { db, auth } from "../../firebase.config.js";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { showToast } from "./toast.js";
import { updateCartBadge, updateWishlistBadge } from "./header.js";

const wishlistContainer = document.getElementById("wishlist-container");

let currentUser = null;
let wishlist = [];
let unsubscribeWishlist = null;

// ===============================
// AUTH & REALTIME LISTENERS
// ===============================

onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (!currentUser) {
    if (unsubscribeWishlist) unsubscribeWishlist();
    wishlist = [];
    renderWishlist();
    updateWishlistBadge();
    return;
  }

  listenToWishlist();
});

function listenToWishlist() {
  if (unsubscribeWishlist) unsubscribeWishlist();

  const wishlistRef = collection(db, "users", currentUser.uid, "wishlist");

  unsubscribeWishlist = onSnapshot(
    wishlistRef,
    (snapshot) => {
      wishlist = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      renderWishlist();
      updateWishlistBadge();
    },
    (error) => {
      console.error("WISHLIST SNAPSHOT ERROR:", error);
    },
  );
}

// ===============================
// RENDER WISHLIST
// ===============================

function renderWishlist() {
  if (!wishlistContainer) return;

  if (!currentUser) {
    wishlistContainer.innerHTML = `
      <div class="text-center py-20">
        <h2 class="text-2xl font-semibold text-text-primary">
          Please log in to view your wishlist
        </h2>
      </div>
    `;
    return;
  }

  if (wishlist.length === 0) {
    wishlistContainer.innerHTML = `
      <div class="text-center py-20">
        <h2 class="text-2xl font-semibold text-text-primary">
          Your wishlist is empty
        </h2>
        <a
          href="./products.html"
          class="inline-block mt-6 px-6 py-3 rounded-full bg-accent text-white hover:bg-accent-hover transition"
        >
          Browse Products
        </a>
      </div>
    `;
    return;
  }

  wishlistContainer.innerHTML = wishlist
    .map((product) => {
      const priceFormatted =
        typeof product.price === "number"
          ? product.price.toFixed(2)
          : product.price;

      return `
        <article
          class="wishlist bg-white rounded-2xl border border-border shadow-sm p-4 md:p-5 flex flex-col items-center sm:items-stretch sm:flex-row gap-5 mb-4"
          data-id="${product.id}"
        >
          <div class="w-24 h-24 sm:w-28 sm:h-28 shrink-0 overflow-hidden rounded-xl border border-border bg-gray-50 flex items-center justify-center p-2">
            <img
              src="${product.imageUrl || ""}"
              class="max-w-full max-h-full object-contain"
              alt="${product.name || "Product image"}"
              onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'150\' viewBox=\'0 0 150 150\'><rect width=\'100%\' height=\'100%\' fill=\'%23f3f4f6\'/><text x=\'50%\' y=\'50%\' font-family=\'sans-serif\' font-size=\'14\' fill=\'%239ca3af\' dominant-baseline=\'middle\' text-anchor=\'middle\'>No Image</text></svg>'"
            >
          </div>

          <div class="flex-1 text-center sm:text-left">
            <p class="text-sm text-text-secondary">
              ${product.brand || ""}
            </p>

            <h3 class="font-semibold text-lg mt-1 text-text-primary">
              ${product.name || "Unnamed Product"}
            </h3>

            <p class="font-bold text-xl mt-2 text-primary">
              ${product.currency || "$"}${priceFormatted}
            </p>
          </div>

          <div class="flex flex-col gap-3 w-full sm:w-auto">
            <button
              type="button"
              class="add-to-cart-btn bg-accent text-white px-5 py-2 rounded-lg hover:bg-accent-hover transition"
              data-id="${product.id}"
            >
              Add to Cart
            </button>

            <button
              type="button"
              class="remove-wishlist-btn border border-red-500 text-red-500 px-5 py-2 rounded-lg hover:bg-red-50 transition"
              data-id="${product.id}"
            >
              Remove
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  attachEventListeners();
}

// ===============================
// EVENT HANDLERS
// ===============================

function attachEventListeners() {
  // REMOVE FROM WISHLIST
  const removeButtons = document.querySelectorAll(".remove-wishlist-btn");
  removeButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (!currentUser) return;

      const pId = button.dataset.id;
      try {
        button.disabled = true;
        const wishlistDocRef = doc(
          db,
          "users",
          currentUser.uid,
          "wishlist",
          pId,
        );
        await deleteDoc(wishlistDocRef);
        showToast("Removed from Wishlist");
      } catch (error) {
        console.error("REMOVE FROM WISHLIST ERROR:", error);
        showToast("Failed to remove item");
      }
    });
  });

  // ADD TO CART FROM WISHLIST
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (!currentUser) {
        showToast("Please log in first");
        return;
      }

      const pId = button.dataset.id;
      const product = wishlist.find((item) => String(item.id) === String(pId));

      if (!product) return;

      try {
        button.disabled = true;
        button.textContent = "Adding...";

        const cartItemRef = doc(db, "users", currentUser.uid, "cart", pId);
        const cartItemSnapshot = await getDoc(cartItemRef);

        if (cartItemSnapshot.exists()) {
          const existingCartItem = cartItemSnapshot.data();
          const existingQuantity = Number(existingCartItem.quantity) || 0;

          await setDoc(
            cartItemRef,
            {
              quantity: existingQuantity + 1,
              updatedAt: new Date().toISOString(),
            },
            { merge: true },
          );
        } else {
          await setDoc(cartItemRef, {
            productId: product.id,
            name: product.name || "",
            price: product.price || 0,
            currency: product.currency || "$",
            imageUrl: product.imageUrl || "",
            brand: product.brand || "",
            quantity: 1,
            deliveryOptionId: "1",
            createdAt: new Date().toISOString(),
          });
        }

        updateCartBadge();
        showToast("Added to Cart");
      } catch (error) {
        console.error("ADD TO CART ERROR:", error);
        showToast("Failed to add product to cart");
      } finally {
        button.disabled = false;
        button.textContent = "Add to Cart";
      }
    });
  });
}

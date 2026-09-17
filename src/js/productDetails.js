import { db, auth } from "../../firebase.config.js";

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { showToast } from "./toast.js";

import { updateCartBadge, updateWishlistBadge } from "./header.js";

import { setupProductDetailsAnimations } from "./dashboardAnimations.js";

const productDetailsContainer = document.getElementById(
  "product-details-container",
);

// ===============================
// STATE MANAGEMENT
// ===============================

let currentUser = null;
let currentProduct = null;
let wishlist = [];
let unsubscribeWishlist = null;
let quantity = 1;

// ===============================
// PRODUCT ID FROM URL
// ===============================

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// ===============================
// AUTH STATE & REALTIME WISHLIST LISTENER
// ===============================

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  console.log("CURRENT USER:", currentUser);

  listenToWishlist();
});

function listenToWishlist() {
  // If user logs out, reset state
  if (!currentUser) {
    if (unsubscribeWishlist) unsubscribeWishlist();
    wishlist = [];
    updateWishlistButtonUI();
    updateWishlistBadge();
    return;
  }

  // Cleanup active listener before creating a new one
  if (unsubscribeWishlist) unsubscribeWishlist();

  const wishlistRef = collection(db, "users", currentUser.uid, "wishlist");

  unsubscribeWishlist = onSnapshot(
    wishlistRef,
    (snapshot) => {
      wishlist = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      updateWishlistButtonUI();
      updateWishlistBadge();
    },
    (error) => {
      console.error("WISHLIST SNAPSHOT ERROR:", error);
    },
  );
}

// Helper to update Wishlist UI conditionally based on state
function updateWishlistButtonUI() {
  const wishlistIcon = document.getElementById("wishlist-icon");
  if (!wishlistIcon || !currentProduct) return;

  const isWishlisted = wishlist.some((item) => item.id === currentProduct.id);

  if (isWishlisted) {
    wishlistIcon.setAttribute("fill", "#F77F00");
    wishlistIcon.setAttribute("stroke", "#F77F00");
  } else {
    wishlistIcon.setAttribute("fill", "none");
    wishlistIcon.setAttribute("stroke", "#F77F00");
  }
}

// ===============================
// LOAD PRODUCT
// ===============================

async function loadProduct() {
  if (!productId) {
    console.log("No product ID found in URL parameters");
    if (productDetailsContainer) {
      productDetailsContainer.innerHTML = `<p class="text-center py-10">Invalid product URL.</p>`;
    }
    return;
  }

  try {
    const productRef = doc(db, "products", productId);
    const productSnapshot = await getDoc(productRef);

    if (!productSnapshot.exists()) {
      console.log("Product not found in database");
      if (productDetailsContainer) {
        productDetailsContainer.innerHTML = `<p class="text-center py-10">Product not found.</p>`;
      }
      return;
    }

    const data = productSnapshot.data();

    currentProduct = {
      id: productSnapshot.id,
      ...data,
      imageUrl:
        data.imageUrl || (Array.isArray(data.images) && data.images[0]) || "",
      images:
        Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : [data.imageUrl || ""],
      features: data.features || [],
    };

    console.log("FIRESTORE PRODUCT:", currentProduct);
    renderProductDetails(currentProduct);
  } catch (error) {
    console.error("Error loading product:", error);
  }
}

loadProduct();

// ===============================
// RENDER PRODUCT DETAILS
// ===============================

function renderProductDetails(product) {
  productDetailsContainer.innerHTML = `
  <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
  
      <!-- LEFT -->
      <div>
          <!-- Main Image -->
          <div class="border border-border rounded-2xl bg-white p-8 shadow-sm">
              <img
                  id="main-product-image"
                  src="${product.imageUrl}"
                  alt="${product.name}"
                  class="w-full max-w-xs mx-auto lg:max-w-full"
              >
          </div>
  
          <!-- Thumbnails -->
          <div class="flex gap-4 mt-4">
              ${product.images
                .map(
                  (image) => `
                  <img
                      src="${image}"
                      alt="${product.name}"
                      data-image="${image}"
                      class="thumbnail w-20 h-20 rounded-xl border border-border object-cover cursor-pointer hover:border-accent"
                  >
              `,
                )
                .join("")}
          </div>
      </div>
  
      <!-- RIGHT -->
      <div>
          <p class="text-sm text-text-secondary">
              ${product.brand || ""}
          </p>
  
          <h1 class="text-4xl font-bold mt-2 text-text-primary">
              ${product.name || ""}
          </h1>
  
          <div class="flex items-center gap-3 mt-4">
              <span class="text-yellow-500">★★★★★</span>
              <span class="text-text-secondary">${product.rating || "0"}</span>
              <span class="text-text-secondary">(${product.reviews || "0"} Reviews)</span>
          </div>
  
          <div class="mt-8 flex items-center gap-4">
              <span class="text-4xl font-bold text-primary">
                  ${product.currency || "$"}${product.price || 0}
              </span>
              ${
                product.originalPrice
                  ? `<span class="line-through text-text-secondary">${product.currency || "$"}${product.originalPrice}</span>`
                  : ""
              }
              ${
                product.discount
                  ? `<span class="text-accent font-semibold">${product.discount}</span>`
                  : ""
              }
          </div>
  
          <div class="mt-4 space-y-5">
            <div class="flex items-center gap-3">
              <span class="${
                product.inStock ? "text-green-600" : "text-red-500"
              } font-medium">
                ${product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div class="flex items-center gap-3">
              <span class="font-semibold">Shipping:</span>
              <span class="text-accent">${product.shipping || "Free"}</span>
            </div>

            <div>
              <h3 class="font-semibold text-md mb-2">Description</h3>
              <p class="text-text-secondary">${product.description || ""}</p>
            </div>
          </div>

          <div class="mt-8">
            <h3 class="font-semibold text-md mb-2">Features</h3>
            <ul>
              ${product.features
                .map(
                  (feature) => `
                  <li class="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-5 h-5 text-accent flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>${feature}</span>
                  </li>
                `,
                )
                .join("")}
            </ul>
          </div>

          <!-- QUANTITY -->
          <div class="mt-10">
            <h3 class="font-semibold text-lg mb-3">Quantity</h3>
            <div class="flex items-center gap-5">
              <button
                id="decrease-qty"
                class="w-11 h-11 rounded-xl border border-border hover:border-accent hover:text-accent transition"
              >
                −
              </button>
              <span id="quantity" class="text-xl font-semibold">1</span>
              <button
                id="increase-qty"
                class="w-11 h-11 rounded-xl border border-border hover:border-accent hover:text-accent transition"
              >
                +
              </button>
            </div>
          </div>

          <!-- BUTTONS -->
          <div class="mt-10 flex flex-wrap gap-4 flex-col sm:flex-row">
            <!-- Wishlist -->
            <button
              id="wishlist-btn"
              class="w-14 h-14 flex items-center justify-center rounded-full border border-border hover:border-accent transition cursor-pointer"
            >
              <svg
                id="wishlist-icon"
                class="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#F77F00"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
                />
              </svg>
            </button>

            <!-- Add to Cart -->
            <button
              id="add-cart-btn"
              class="flex-1 flex items-center justify-center gap-3 px-6 py-2 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition cursor-pointer"
            >
              Add to Cart
            </button>

            <!-- Buy Now -->
            <button
              id="buy-now-btn"
              class="flex-1 px-6 py-2 rounded-full border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition cursor-pointer"
            >
              Buy Now
            </button>
          </div>
      </div>
  </div>
  `;

  // Update initial icon fill based on loaded state
  updateWishlistButtonUI();

  // ===============================
  // QUANTITY LISTENERS
  // ===============================

  const quantityText = document.getElementById("quantity");
  const increaseBtn = document.getElementById("increase-qty");
  const decreaseBtn = document.getElementById("decrease-qty");

  increaseBtn.addEventListener("click", () => {
    const maxStock = product.stock || 99;
    if (quantity < maxStock) {
      quantity++;
      quantityText.textContent = quantity;
    }
  });

  decreaseBtn.addEventListener("click", () => {
    if (quantity > 1) {
      quantity--;
      quantityText.textContent = quantity;
    }
  });

  // ===============================
  // ADD TO CART LISTENERS
  // ===============================

  const addCartBtn = document.getElementById("add-cart-btn");

  addCartBtn.addEventListener("click", async () => {
    if (!currentUser) {
      showToast("Please log in first");
      return;
    }

    if (!product.inStock) {
      showToast("Product is out of stock");
      return;
    }

    try {
      addCartBtn.disabled = true;
      addCartBtn.textContent = "Adding...";

      const cartItemRef = doc(db, "users", currentUser.uid, "cart", product.id);
      const cartItemSnapshot = await getDoc(cartItemRef);

      if (cartItemSnapshot.exists()) {
        const existingCartItem = cartItemSnapshot.data();
        const existingQuantity = Number(existingCartItem.quantity) || 0;
        const newQuantity = existingQuantity + quantity;

        await setDoc(
          cartItemRef,
          {
            quantity: newQuantity,
            deliveryOptionId: existingCartItem.deliveryOptionId || "1",
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
          quantity: quantity,
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
      addCartBtn.disabled = false;
      addCartBtn.textContent = "Add to Cart";
    }
  });

  // ===============================
  // DYNAMIC WISHLIST TOGGLE
  // ===============================

  const wishlistBtn = document.getElementById("wishlist-btn");

  wishlistBtn.addEventListener("click", async () => {
    if (!currentUser) {
      showToast("Please log in first");
      return;
    }

    const wishlistDocRef = doc(
      db,
      "users",
      currentUser.uid,
      "wishlist",
      product.id,
    );
    const isWishlisted = wishlist.some((item) => item.id === product.id);

    try {
      wishlistBtn.disabled = true;

      if (isWishlisted) {
        await deleteDoc(wishlistDocRef);
        showToast("Removed from Wishlist");
      } else {
        await setDoc(wishlistDocRef, {
          productId: product.id,
          name: product.name || "",
          price: product.price || 0,
          currency: product.currency || "$",
          imageUrl: product.imageUrl || "",
          brand: product.brand || "",
          createdAt: new Date().toISOString(),
        });
        showToast("Added to Wishlist");
      }
    } catch (error) {
      console.error("WISHLIST TOGGLE ERROR:", error);
      showToast("Failed to update wishlist");
    } finally {
      wishlistBtn.disabled = false;
    }
  });

  // ===============================
  // THUMBNAIL SWITCHER & ANIMATIONS
  // ===============================

  const mainImage = document.getElementById("main-product-image");
  const thumbnails = document.querySelectorAll(".thumbnail");

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", () => {
      mainImage.src = thumbnail.dataset.image;
    });
  });

  setupProductDetailsAnimations();
}

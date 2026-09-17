import { db, auth } from "../../firebase.config.js";
import { updateCartBadge } from "./header.js";
import { deliveryOptions } from "./data.js";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const cartContainer = document.getElementById("cart-container");
const summaryContainer = document.getElementById("summary-container");
const orderSummary = document.getElementById("order-summary");

let currentUser = null;
let unsubscribeCart = null;
let cart = [];

// ======================================================
// AUTH STATE
// ======================================================

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    listenToCart();
  } else {
    currentUser = null;
    cart = [];

    if (unsubscribeCart) {
      unsubscribeCart();
      unsubscribeCart = null;
    }

    if (cartContainer) {
      cartContainer.innerHTML = `
        <div class="text-center py-20">
          <h2 class="text-xl font-semibold mb-2">Please log in</h2>
          <p class="text-gray-500 mb-6">Log in to view your cart.</p>
          <a
            href="./home-before.html"
            class="inline-block px-6 py-3 rounded-full bg-accent text-white hover:bg-accent-hover transition"
          >
            Log In
          </a>
        </div>
      `;
    }

    if (summaryContainer) summaryContainer.innerHTML = "";
    if (orderSummary) orderSummary.classList.add("hidden");
    if (typeof updateCartBadge === "function") updateCartBadge();
  }
});

// ======================================================
// LISTEN TO USER CART
// ======================================================

function listenToCart() {
  if (!currentUser) return;

  if (unsubscribeCart) {
    unsubscribeCart();
  }

  const cartRef = collection(db, "users", currentUser.uid, "cart");

  unsubscribeCart = onSnapshot(
    cartRef,
    async (snapshot) => {
      if (snapshot.empty) {
        cart = [];

        if (cartContainer) {
          cartContainer.innerHTML = `
            <div class="text-center py-20">
              <h2 class="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p class="text-gray-500 mb-6">Add some products to your cart.</p>
              <a
                href="./products.html"
                class="inline-block px-6 py-3 rounded-full bg-accent text-white hover:bg-accent-hover transition"
              >
                Continue Shopping
              </a>
            </div>
          `;
        }

        if (summaryContainer) summaryContainer.innerHTML = "";
        if (orderSummary) orderSummary.classList.add("hidden");
        if (typeof updateCartBadge === "function") updateCartBadge();
        return;
      }

      const cartItemsPromises = snapshot.docs.map(async (cartDoc) => {
        const cartData = cartDoc.data() || {};
        const targetProductId = String(cartData.productId || cartDoc.id);

        let productData = {};
        try {
          const productRef = doc(db, "products", targetProductId);
          const productSnapshot = await getDoc(productRef);

          if (productSnapshot.exists()) {
            productData = productSnapshot.data() || {};
          }
        } catch (err) {
          console.warn(
            `Could not fetch catalog product for ID: ${targetProductId}`,
            err,
          );
        }

        const rawImage =
          productData.imageUrl ||
          (Array.isArray(productData.images) && productData.images[0]) ||
          cartData.imageUrl ||
          cartData.image ||
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' font-family='sans-serif' font-size='14' fill='%239ca3af' dominant-baseline='middle' text-anchor='middle'>No Image</text></svg>";

        const rawPrice =
          productData.price !== undefined ? productData.price : cartData.price;
        const parsedPrice = Number(rawPrice);
        const safePrice = isNaN(parsedPrice) ? 0 : parsedPrice;

        return {
          id: targetProductId,
          cartDocId: cartDoc.id,
          name: productData.name || cartData.name || "Product",
          brand: productData.brand || cartData.brand || "VendorHub",
          price: safePrice,
          currency: productData.currency || cartData.currency || "$",
          imageUrl: rawImage,
          stock: productData.inStock ? 99 : 0,
          quantity: Number(cartData.quantity || 1),
          deliveryOptionId: String(cartData.deliveryOptionId || "1"),
        };
      });

      cart = await Promise.all(cartItemsPromises);
      renderCart();
      if (typeof updateCartBadge === "function") updateCartBadge();
    },
    (error) => {
      console.error("CART LISTENER ERROR:", error);
      if (cartContainer) {
        cartContainer.innerHTML = `
          <div class="text-center py-20">
            <h2 class="text-xl font-semibold text-red-500">Failed to load cart</h2>
            <p class="text-gray-500 mt-2">${error.message}</p>
          </div>
        `;
      }
    },
  );
}

// ======================================================
// RENDER CART
// ======================================================

function renderCart() {
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="text-center py-20">
        <h2 class="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <a
          href="./products.html"
          class="inline-block mt-6 px-6 py-3 rounded-full bg-accent text-white hover:bg-accent-hover transition"
        >
          Continue Shopping
        </a>
      </div>
    `;
    if (summaryContainer) summaryContainer.innerHTML = "";
    if (orderSummary) orderSummary.classList.add("hidden");
    return;
  }

  cartContainer.innerHTML = cart
    .map((product) => {
      const deliveryHTML = deliveryOptions
        .map((option) => {
          const selected =
            String(option.id) === String(product.deliveryOptionId);
          return `
            <label class="flex items-start gap-3 cursor-pointer mb-3">
              <input
                type="radio"
                name="delivery-${product.cartDocId}"
                value="${option.id}"
                data-cart-id="${product.cartDocId}"
                class="delivery-option mt-1"
                ${selected ? "checked" : ""}
              >
              <div>
                <p class="font-medium">${option.name}</p>
                <p class="text-sm text-gray-500">${option.deliveryDays}</p>
                <p class="text-sm font-medium">
                  ${option.price === 0 ? "FREE" : `$${option.price}`}
                </p>
              </div>
            </label>
          `;
        })
        .join("");

      return `
        <div class="cart-item border-b pb-6 mb-6" data-cart-id="${product.cartDocId}">
          <div class="flex gap-5 items-start">
            <div class="w-24 h-24 sm:w-28 sm:h-28 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
              <img
                src="${product.imageUrl}"
                alt="${product.name}"
                class="max-w-full max-h-full object-contain"
                onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'150\' viewBox=\'0 0 150 150\'><rect width=\'100%\' height=\'100%\' fill=\'%23f3f4f6\'/><text x=\'50%\' y=\'50%\' font-family=\'sans-serif\' font-size=\'14\' fill=\'%239ca3af\' dominant-baseline=\'middle\' text-anchor=\'middle\'>No Image</text></svg>'"
              >
            </div>

            <div class="flex-1">
              <p class="text-sm text-gray-500">${product.brand}</p>
              <h3 class="text-lg font-semibold">${product.name}</h3>
              <p class="text-xl font-bold mt-2">
                ${product.currency}${product.price.toFixed(2)}
              </p>

              <div class="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  class="decrease-qty border rounded px-3 py-1 hover:bg-gray-100 transition"
                  data-cart-id="${product.cartDocId}"
                >
                  −
                </button>
                <span class="font-medium">${product.quantity}</span>
                <button
                  type="button"
                  class="increase-qty border rounded px-3 py-1 hover:bg-gray-100 transition"
                  data-cart-id="${product.cartDocId}"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                class="remove-item text-red-500 text-sm mt-3 hover:underline"
                data-cart-id="${product.cartDocId}"
              >
                Remove
              </button>
            </div>
          </div>

          <div class="mt-5">
            <h4 class="font-semibold mb-3">Delivery Options</h4>
            ${deliveryHTML}
          </div>
        </div>
      `;
    })
    .join("");

  if (orderSummary) {
    orderSummary.classList.remove("hidden");
  }

  renderSummary();
}

// ======================================================
// EVENT DELEGATION
// ======================================================

if (cartContainer) {
  cartContainer.addEventListener("change", async (e) => {
    if (e.target.classList.contains("delivery-option")) {
      const cartDocId = e.target.dataset.cartId;
      const deliveryOptionId = e.target.value;

      if (cartDocId && currentUser) {
        try {
          await updateDoc(
            doc(db, "users", currentUser.uid, "cart", cartDocId),
            { deliveryOptionId },
          );
        } catch (error) {
          console.error("DELIVERY UPDATE ERROR:", error);
        }
      }
    }
  });

  cartContainer.addEventListener("click", async (e) => {
    const target = e.target;
    const cartDocId = target.dataset.cartId;

    if (!cartDocId || !currentUser) return;

    const product = cart.find((item) => item.cartDocId === cartDocId);

    if (target.classList.contains("increase-qty")) {
      if (product) {
        try {
          await updateDoc(
            doc(db, "users", currentUser.uid, "cart", cartDocId),
            { quantity: product.quantity + 1 },
          );
        } catch (error) {
          console.error("INCREASE QUANTITY ERROR:", error);
        }
      }
    }

    if (target.classList.contains("decrease-qty")) {
      if (product) {
        if (product.quantity <= 1) {
          try {
            await deleteDoc(
              doc(db, "users", currentUser.uid, "cart", cartDocId),
            );
          } catch (error) {
            console.error("DELETE CART ERROR:", error);
          }
        } else {
          try {
            await updateDoc(
              doc(db, "users", currentUser.uid, "cart", cartDocId),
              { quantity: product.quantity - 1 },
            );
          } catch (error) {
            console.error("DECREASE QUANTITY ERROR:", error);
          }
        }
      }
    }

    if (target.classList.contains("remove-item")) {
      try {
        await deleteDoc(doc(db, "users", currentUser.uid, "cart", cartDocId));
      } catch (error) {
        console.error("REMOVE ITEM ERROR:", error);
      }
    }
  });
}

// ======================================================
// SUMMARY
// ======================================================

function renderSummary() {
  if (!summaryContainer) return;

  let totalItems = 0;
  let subtotal = 0;

  cart.forEach((product) => {
    totalItems += product.quantity;
    subtotal += product.price * product.quantity;
  });

  let shipping = 0;

  cart.forEach((product) => {
    const selectedOption = deliveryOptions.find(
      (option) => String(option.id) === String(product.deliveryOptionId),
    );

    if (selectedOption) {
      shipping += Number(selectedOption.price) || 0;
    }
  });

  const grandTotal = subtotal + shipping;

  summaryContainer.innerHTML = `
    <div class="space-y-3">
      <div class="flex justify-between">
        <span>Items</span>
        <span>${totalItems}</span>
      </div>

      <div class="flex justify-between">
        <span>Subtotal</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>

      <div class="flex justify-between">
        <span>Shipping</span>
        <span>$${shipping.toFixed(2)}</span>
      </div>

      <div class="border-t pt-3 flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>$${grandTotal.toFixed(2)}</span>
      </div>

      <div class="flex flex-col gap-3 mt-6">
        <button
          id="checkout-btn"
          type="button"
          class="w-full py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition cursor-pointer text-center"
        >
          Proceed to Checkout
        </button>

        <a
          href="./products.html"
          class="w-full py-3 rounded-xl border border-gray-300 text-center text-text-primary font-medium hover:bg-gray-100 transition inline-block"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  `;

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
      window.location.href = "checkout.html";
    };
  }
}

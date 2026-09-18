import { db, auth } from "../../firebase.config.js";
import { updateCartBadge } from "./header.js";
import { deliveryOptions } from "./data.js";
import { showToast } from "./toast.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const summaryContainer = document.getElementById("checkout-summary");
const placeOrderBtn = document.getElementById("place-order-btn");

let currentUser = null;
let unsubscribeCart = null;
let cart = [];
let totals = { totalItems: 0, subtotal: 0, shipping: 0, grandTotal: 0 };

// Safe toast helper to prevent script crashes if toast DOM node is missing
function safeToast(msg) {
  try {
    if (typeof showToast === "function") {
      showToast(msg);
    } else {
      alert(msg);
    }
  } catch (err) {
    console.warn("Toast error fallback:", err);
    alert(msg);
  }
}

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
    window.location.href = "h.html";
  }
});

// ======================================================
// LISTEN TO FIRESTORE CART
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
        window.location.href = "cart.html";
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
          imageUrl: productData.imageUrl || cartData.imageUrl || "",
          quantity: Number(cartData.quantity || 1),
          deliveryOptionId: String(cartData.deliveryOptionId || "1"),
          vendorId: productData.vendorId || cartData.vendorId || "", // <-- Carries vendorId from catalog product
        };
      });

      cart = await Promise.all(cartItemsPromises);
      calculateAndRenderSummary();
      if (typeof updateCartBadge === "function") updateCartBadge();
    },
    (error) => {
      console.error("CHECKOUT CART LISTENER ERROR:", error);
      safeToast("Failed to load checkout details");
    },
  );
}

// ======================================================
// CALCULATE TOTALS & RENDER SUMMARY
// ======================================================

function calculateAndRenderSummary() {
  if (!summaryContainer) return;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const shipping = cart.reduce((acc, product) => {
    const option = deliveryOptions.find(
      (item) => String(item.id) === String(product.deliveryOptionId),
    );
    return acc + (option ? Number(option.price) || 0 : 0);
  }, 0);

  const grandTotal = subtotal + shipping;

  totals = { totalItems, subtotal, shipping, grandTotal };

  summaryContainer.innerHTML = `
    <div class="space-y-4">
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
        <span>${shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
      </div>

      <hr class="border-border">

      <div class="flex justify-between text-xl font-bold">
        <span>Total</span>
        <span>$${grandTotal.toFixed(2)}</span>
      </div>
    </div>
  `;
}

// ======================================================
// PLACE ORDER HANDLER
// ======================================================

if (placeOrderBtn) {
  placeOrderBtn.addEventListener("click", (e) => {
    e.preventDefault();
    placeOrder();
  });
}

async function placeOrder() {
  if (!currentUser) {
    safeToast("Please log in to complete your order.");
    return;
  }

  if (cart.length === 0) {
    safeToast("Your cart is empty.");
    return;
  }

  const name = document.getElementById("name")?.value.trim() || "";
  const phone = document.getElementById("phone")?.value.trim() || "";
  const email = document.getElementById("email")?.value.trim() || "";
  const address = document.getElementById("address")?.value.trim() || "";
  const city = document.getElementById("city")?.value.trim() || "";
  const postal = document.getElementById("postal")?.value.trim() || "";

  if (!name || !phone || !email || !address || !city || !postal) {
    safeToast("Please fill all fields.");
    return;
  }

  const phoneRegex = /^03\d{9}$/;
  if (!phoneRegex.test(phone)) {
    safeToast("Please enter a valid phone number.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    safeToast("Please enter a valid email address.");
    return;
  }

  const terms = document.getElementById("terms");
  if (terms && !terms.checked) {
    safeToast("Please accept the Terms & Conditions.");
    return;
  }

  try {
    if (placeOrderBtn) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.textContent = "Placing Order...";
    }

    // Extract primary vendorId from cart items so the vendor dashboard query can find it
    const primaryVendorId = cart[0]?.vendorId || "";

    const orderData = {
      userId: currentUser.uid,
      vendorId: primaryVendorId, // <-- CRITICAL: Links order directly to abcjewellery's UID
      createdAt: new Date().toISOString(),
      customer: {
        name,
        phone,
        email,
        address,
        city,
        postal,
      },
      items: cart,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.grandTotal,
      status: "Processing",
    };

    // 1. Write order document
    await addDoc(collection(db, "orders"), orderData);

    // 2. STOP snapshot listener so empty cart doesn't redirect to cart.html
    if (unsubscribeCart) {
      unsubscribeCart();
      unsubscribeCart = null;
    }

    // 3. Clear user's Firestore cart subcollection
    const cartRef = collection(db, "users", currentUser.uid, "cart");
    const cartSnapshot = await getDocs(cartRef);
    const deletePromises = cartSnapshot.docs.map((cartDoc) =>
      deleteDoc(doc(db, "users", currentUser.uid, "cart", cartDoc.id)),
    );
    await Promise.all(deletePromises);

    if (typeof updateCartBadge === "function") updateCartBadge();

    // 4. Redirect to orderSuccess.html
    window.location.href = "orderSuccess.html";
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    safeToast("Failed to place order. Check console for details.");
  } finally {
    if (placeOrderBtn) {
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = "Place Order";
    }
  }
}

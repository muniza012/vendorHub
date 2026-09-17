import { db, auth } from "../../firebase.config.js";
import { IMAGE_PATH } from "./data.js";
import { updateCartBadge, updateWishlistBadge } from "./header.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

updateCartBadge();
updateWishlistBadge();

const ordersContainer = document.getElementById("orders-container");

// ======================================================
// AUTH STATE & FIRESTORE FETCH
// ======================================================

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await fetchAndRenderOrders(user.uid);
  } else {
    window.location.href = "home-before.html";
  }
});

async function fetchAndRenderOrders(userId) {
  if (!ordersContainer) return;

  // Show loading skeleton/text while fetching
  ordersContainer.innerHTML = `
    <div class="text-center py-12 text-text-secondary text-lg">
      Loading your orders...
    </div>
  `;

  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      renderEmptyState();
      return;
    }

    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort descending by date (newest first)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    renderOrders(orders);
  } catch (error) {
    console.error("FETCH ORDERS ERROR:", error);
    ordersContainer.innerHTML = `
      <div class="bg-white rounded-3xl border border-border p-10 text-center shadow-sm text-red-500">
        Failed to load orders. Please refresh the page.
      </div>
    `;
  }
}

// ======================================================
// RENDER FUNCTIONS
// ======================================================

function renderEmptyState() {
  ordersContainer.innerHTML = `
    <div class="bg-white rounded-3xl border border-border p-10 text-center shadow-sm">
      <h2 class="text-3xl font-bold mt-6">
        No Orders Yet
      </h2>

      <p class="text-text-secondary mt-3">
        Looks like you haven't placed any orders yet.
      </p>

      <a
        href="products.html"
        class="inline-block mt-8 px-6 mb-6 py-4 rounded-full bg-accent text-white hover:bg-accent-hover transition"
      >
        Start Shopping
      </a>
    </div>
  `;
}

function renderOrders(orders) {
  let html = "";

  orders.forEach((order) => {
    let productsHTML = "";

    const items = Array.isArray(order.items) ? order.items : [];

    items.forEach((product) => {
      // Safe fallback for images depending on whether absolute URL or filename path is used
      const imgSrc =
        product.imageUrl ||
        (product.image ? `${IMAGE_PATH}${product.image}` : "");
      const safePrice = Number(product.price) || 0;

      productsHTML += `
        <div class="flex flex-col sm:flex-row gap-5 py-5 border-b border-border last:border-0">
          ${
            imgSrc
              ? `<img src="${imgSrc}" alt="${product.name}" class="w-28 h-28 object-cover rounded-xl border border-border">`
              : `<div class="w-28 h-28 bg-gray-100 rounded-xl border border-border flex items-center justify-center text-xs text-text-secondary">No Image</div>`
          }

          <div class="flex-1">
            <h3 class="text-lg font-semibold">
              ${product.name || "Product"}
            </h3>

            <p class="text-text-secondary mt-1">
              ${product.brand || "VendorHub"}
            </p>

            <div class="mt-3 flex flex-wrap gap-6">
              <p>
                Qty: <span class="font-semibold">${product.quantity || 1}</span>
              </p>

              <p>
                Price:
                <span class="font-semibold text-accent">
                  $${safePrice.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </div>
      `;
    });

    const formattedDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

    const customer = order.customer || {};
    const subtotal = Number(order.subtotal) || 0;
    const shipping = Number(order.shipping) || 0;
    const total = Number(order.total) || 0;

    html += `
      <article class="bg-white rounded-3xl border border-border shadow-sm overflow-hidden mb-8 last:mb-0">
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-primary text-white px-8 py-6">
          <div>
            <h2 class="text-xl font-semibold">
              Order #${order.id}
            </h2>

            <p class="text-sm opacity-80 mt-1">
              ${formattedDate}
            </p>
          </div>

          <span class="inline-flex items-center px-4 py-2 rounded-full bg-yellow-500 text-black font-semibold self-start lg:self-auto">
            ${order.status || "Processing"}
          </span>
        </div>

        <!-- Customer -->
        <div class="p-8">
          <h3 class="text-xl font-semibold mb-5">
            Customer Information
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-text-secondary">
            <p><strong>Name:</strong> ${customer.name || "N/A"}</p>
            <p><strong>Phone:</strong> ${customer.phone || "N/A"}</p>
            <p><strong>Email:</strong> ${customer.email || "N/A"}</p>
            <p><strong>City:</strong> ${customer.city || "N/A"}</p>
            <p class="md:col-span-2"><strong>Address:</strong> ${
              customer.address || "N/A"
            }</p>
            <p><strong>Postal Code:</strong> ${customer.postal || "N/A"}</p>
          </div>

          <!-- Products -->
          <h3 class="text-xl font-semibold mt-10 mb-5">
            Ordered Products
          </h3>

          ${productsHTML}

          <!-- Totals -->
          <div class="mt-8 border-t border-border pt-6 flex justify-end">
            <div class="w-full max-w-sm space-y-3">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
              </div>

              <div class="flex justify-between">
                <span>Shipping</span>
                <span>${shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>

              <hr>

              <div class="flex justify-between text-2xl font-bold">
                <span>Total</span>
                <span class="text-accent">$${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    `;
  });

  ordersContainer.innerHTML = html;
}

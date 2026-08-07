import { IMAGE_PATH } from "./data.js";
import { updateCartBadge, updateWishlistBadge } from "./header.js";

updateCartBadge();
updateWishlistBadge();

const ordersContainer = document.getElementById("orders-container");

const orders = JSON.parse(localStorage.getItem("vendorHubOrders")) || [];

renderOrders();

function renderOrders() {
  if (orders.length === 0) {
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

    return;
  }

  let html = "";

  orders
    .slice()
    .reverse()
    .forEach((order) => {
      let productsHTML = "";

      order.items.forEach((product) => {
        productsHTML += `
          <div
            class="flex flex-col sm:flex-row gap-5 py-5 border-b border-border last:border-0"
          >

            <img
              src="${IMAGE_PATH}${product.image}"
              alt="${product.name}"
              class="w-28 h-28 object-cover rounded-xl border border-border"
            >

            <div class="flex-1">

              <h3 class="text-lg font-semibold">
                ${product.name}
              </h3>

              <p class="text-text-secondary mt-1">
                ${product.brand}
              </p>

              <div class="mt-3 flex flex-wrap gap-6">

                <p>
                  Qty:
                  <span class="font-semibold">
                    ${product.quantity}
                  </span>
                </p>

                <p>
                  Price:
                  <span class="font-semibold text-accent">
                    $${product.price.toFixed(2)}
                  </span>
                </p>

              </div>

            </div>

          </div>
        `;
      });

      html += `
        <article
          class="bg-white rounded-3xl border border-border shadow-sm overflow-hidden"
        >

          <!-- Header -->

          <div
            class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-primary text-white px-8 py-6"
          >

            <div>

              <h2 class="text-xl font-semibold">
                Order #${order.id}
              </h2>

              <p class="text-sm opacity-80 mt-1">
                ${order.date}
              </p>

            </div>

            <span
              class="inline-flex items-center px-4 py-2 rounded-full bg-yellow-500 text-black font-semibold"
            >
              ${order.status}
            </span>

          </div>

          <!-- Customer -->

          <div class="p-8">

            <h3 class="text-xl font-semibold mb-5">
              Customer Information
            </h3>

            <div
              class="grid grid-cols-1 md:grid-cols-2 gap-4 text-text-secondary"
            >

              <p>
                <strong>Name:</strong>
                ${order.customer.name}
              </p>

              <p>
                <strong>Phone:</strong>
                ${order.customer.phone}
              </p>

              <p>
                <strong>Email:</strong>
                ${order.customer.email}
              </p>

              <p>
                <strong>City:</strong>
                ${order.customer.city}
              </p>

              <p class="md:col-span-2">
                <strong>Address:</strong>
                ${order.customer.address}
              </p>

              <p>
                <strong>Postal Code:</strong>
                ${order.customer.postal}
              </p>

            </div>

            <!-- Products -->

            <h3 class="text-xl font-semibold mt-10 mb-5">
              Ordered Products
            </h3>

            ${productsHTML}

            <!-- Totals -->

            <div
              class="mt-8 border-t border-border pt-6 flex justify-end"
            >

              <div class="w-full max-w-sm space-y-3">

                <div class="flex justify-between">

                  <span>Subtotal</span>

                  <span>
                    $${order.subtotal.toFixed(2)}
                  </span>

                </div>

                <div class="flex justify-between">

                  <span>Shipping</span>

                  <span>
                    ${
                      order.shipping === 0
                        ? "Free"
                        : `$${order.shipping.toFixed(2)}`
                    }
                  </span>

                </div>

                <hr>

                <div class="flex justify-between text-2xl font-bold">

                  <span>Total</span>

                  <span class="text-accent">
                    $${order.total.toFixed(2)}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </article>
      `;
    });

  ordersContainer.innerHTML = html;
}

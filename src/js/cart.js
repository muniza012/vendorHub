import { updateCartBadge, updateWishlistBadge } from "./header.js";
import { IMAGE_PATH, products, deliveryOptions } from "./data.js";
const cartContainer = document.getElementById("cart-container");
const summaryContainer = document.getElementById("summary-container");
const orderSummary = document.getElementById("order-summary");
renderCart();

function renderCart() {
  const cart = JSON.parse(localStorage.getItem("vendorHubCart")) || [];

  if (cart.length === 0) {
    cartContainer.innerHTML = `
       <h3 class="text-2xl font-semibold text-text-primary">Your cart is empty</h3>
    `;

    summaryContainer.innerHTML = "";
    orderSummary.style.display = "none";

    return;
  }
  orderSummary.style.display = "block";
  let html = "";

  cart.forEach((product) => {
    html += /* HTML */ `
      <article
        class="bg-white rounded-2xl border border-border shadow-sm
       p-4 
       flex flex-col items-center sm:items-start
       gap-4"
      >
        <img
          src="${IMAGE_PATH}${product.image}"
          alt="${product.alt}"
          class="w-full max-w-[180px]
                     sm:w-32 sm:h-32
                      aspect-square
                      object-cover
                      rounded-xl
                      mx-auto sm:mx-0"
        />
        <div class="flex flex-col sm:items-start">
          <p class="text-sm text-text-secondary">${product.brand}</p>

          <h3 class="text-lg font-semibold mt-1 text-start">${product.name}</h3>

          <p class="text-accent mt-2 font-bold text-xl">$${product.price}</p>
        </div>
        <div class="mt-4 flex items-center justify-center gap-4">
          <p class="text-sm font-semibold text-text-secondary">Quantity</p>

          <div class="mt-2 flex items-center gap-3">
            <button
              class="decrease-quantity
               w-8 h-8 rounded-lg 
               border border-border"
              data-id="${product.id}"
            >
              -
            </button>

            <span class="font-semibold text-lg"> ${product.quantity} </span>

            <button
              class="increase-quantity
               w-8 h-8 rounded-lg
               border border-border"
              data-id="${product.id}"
            >
              +
            </button>
          </div>
        </div>

        <div class="mt-3">
          <h4 class="font-semibold mb-3">Delivery Options</h4>

          ${deliveryOptions
            .map(
              (option) => /* HTML */ `
                <label class="flex  gap-3 mb-3 cursor-pointer ">
                  <input
                    type="radio"
                    name="delivery-${product.id}"
                    value="${option.id}"
                    data-product-id="${product.id}"
                    class="delivery-option mt-1"
                    ${product.deliveryOptionId === option.id ? "checked" : ""}
                  />

                  <div class="flex flex-row  gap-4">
                    <p class="font-small">${option.name}</p>

                    <div class="flex  sm:items-center gap-3 sm:gap-4">
                      <p class="text-sm text-text-secondary">
                        ${option.deliveryDays}
                      </p>

                      <p class="text-sm text-accent">
                        ${option.price === 0 ? "Free" : `$${option.price}`}
                      </p>
                    </div>
                  </div>
                </label>
              `,
            )
            .join("")}
        </div>

        <button
          class="remove-cart-btn
        
           mt-4
           text-red-600
           
           hover:text-red-300
         
           
           font-medium"
          data-id="${product.id}"
        >
          Remove Item
        </button>
      </article>
    `;
  });
  cartContainer.innerHTML = html;
  /////////////////////delivery options

  const deliveryButtons = document.querySelectorAll(".delivery-option");
  deliveryButtons.forEach((button) => {
    button.addEventListener("change", () => {
      const productId = Number(button.dataset.productId);

      const selectedProduct = cart.find((item) => item.id === productId);

      selectedProduct.deliveryOptionId = button.value;

      localStorage.setItem("vendorHubCart", JSON.stringify(cart));

      renderCart();
    });
  });
  ////////////////increase count button

  const increaseButtons = document.querySelectorAll(".increase-quantity");
  increaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.id);
      const selectedProduct = cart.find((item) => item.id === productId);
      selectedProduct.quantity++;
      localStorage.setItem("vendorHubCart", JSON.stringify(cart));
      updateCartBadge();
      renderCart();
    });
  });

  /////////////////////delivery options

  //////////////////////decrease count button
  const decreaseButtons = document.querySelectorAll(".decrease-quantity");
  decreaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.id);
      const selectedProduct = cart.find((item) => item.id === productId);
      if (selectedProduct.quantity > 1) {
        selectedProduct.quantity--;
      }
      localStorage.setItem("vendorHubCart", JSON.stringify(cart));
      updateCartBadge();
      renderCart();
    });
  });

  ////////////remove  btn

  const removeButtons = document.querySelectorAll(".remove-cart-btn");
  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.id);
      const updatedCart = cart.filter((product) => {
        return product.id !== productId;
      });
      localStorage.setItem("vendorHubCart", JSON.stringify(updatedCart));
      updateCartBadge();
      renderCart();
    });
  });
  ///////////////////order summary
  const totalItems = cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
  const subtotal = cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  const shipping = cart.reduce((total, product) => {
    const option = deliveryOptions.find(
      (item) => item.id === product.deliveryOptionId,
    );

    return total + (option ? option.price : 0);
  }, 0);
  const grandTotal = subtotal + shipping;
  ///////////////render summary

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

        <span>

            ${shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}

        </span>

    </div>

    <hr class="border-border">

    <div class="flex justify-between text-xl font-bold">

        <span>Total</span>

        <span>$${grandTotal.toFixed(2)}</span>

    </div>

    <button
    id="checkout-btn"
        class="w-full mt-6 py-4 rounded-full
        
               bg-accent text-white
               hover:bg-accent-hover transition"
               
    >

        Proceed to Checkout

    </button>

</div>
`;
const checkoutBtn = document.getElementById("checkout-btn");

checkoutBtn.addEventListener("click", () => {
  window.location.href = "checkout.html";
});
}

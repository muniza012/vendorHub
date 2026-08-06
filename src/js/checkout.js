import { updateCartBadge } from "./header.js";
import { deliveryOptions } from "./data.js";
import {showToast} from './toast.js'
const cart = JSON.parse(localStorage.getItem("vendorHubCart")) || [];

if (cart.length === 0) {
  window.location.href = "cart.html";
}

const summaryContainer = document.getElementById("checkout-summary");
const placeOrderBtn = document.getElementById("place-order-btn");





// ---------- Calculate Totals ----------

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

// ---------- Render Summary ----------

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

// ---------- Place Order ----------

placeOrderBtn.addEventListener("click", (e) => {
  e.preventDefault();
  placeOrder();
});

function placeOrder() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const postal = document.getElementById("postal").value.trim();

  if (!name || !phone || !email || !address || !city || !postal) {
    showToast("Please fill all fields.");
    return;
  }

  const phoneRegex = /^03\d{9}$/;

  if (!phoneRegex.test(phone)) {
    showToast("Please enter a valid phone number.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    showToast("Please enter a valid email address.");
    return;
  }

  const terms = document.getElementById("terms");

  if (!terms.checked) {
    showToast("Please accept the Terms & Conditions.");
    return;
  }
  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = "Placing Order...";


  const order = {
    id: Date.now(),

    date: new Date().toLocaleString(),

    customer: {
      name,
      phone,
      email,
      address,
      city,
      postal,
    },

    items: cart,

    subtotal,

    shipping,

    total: grandTotal,

    status: "Processing",
  };

  const orders = JSON.parse(localStorage.getItem("vendorHubOrders")) || [];

  orders.push(order);

  localStorage.setItem("vendorHubOrders", JSON.stringify(orders));

  localStorage.removeItem("vendorHubCart");

  updateCartBadge();

  window.location.href = "orderSuccess.html";
}


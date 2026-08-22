import { animateBadge, setupHeaderAnimations } from "./headerAnimations.js";
const cartCount = document.getElementById("cart-count");

export function updateCartBadge() {
  const cartCount = document.getElementById("cart-count");

  // If this page doesn't have a cart badge, do nothing.
  if (!cartCount) return;

  const cart = JSON.parse(localStorage.getItem("vendorHubCart")) || [];

  let totalItems = 0;

  cart.forEach((item) => {
    totalItems += item.quantity;
  });

  if (totalItems === 0) {
    cartCount.classList.add("hidden");
  } else {
    cartCount.classList.remove("hidden");

    cartCount.textContent = totalItems;
  }
  animateBadge(cartCount);
}
updateCartBadge();



export function updateWishlistBadge() {
  const wishlist = JSON.parse(localStorage.getItem("vendorHubWishlist")) || [];

  const wishlistCount = document.getElementById("wishlist-count");

  if (!wishlistCount) return;

  if (wishlist.length === 0) {
    wishlistCount.classList.add("hidden");
  } else {
    wishlistCount.classList.remove("hidden");

    wishlistCount.textContent = wishlist.length;
  }
  animateBadge(wishlistCount);
}
updateWishlistBadge();


/////logout
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
import { updateCartBadge, updateWishlistBadge } from "./header.js";
import { products, IMAGE_PATH } from "./data.js";

const wishlistContainer = document.getElementById("wishlist-container");

renderWishlist();

function renderWishlist() {
  const wishlist = JSON.parse(localStorage.getItem("vendorHubWishlist")) || [];

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

  let html = "";

  wishlist.forEach((product) => {
    html += `
      <article
      class="wishlist bg-white rounded-2xl border border-border shadow-sm
      p-2 md:p-5 flex flex-col items-center sm:items-stretch  sm:flex-row gap-5 "
      >

        <img
          src="${IMAGE_PATH}${product.image}"
          class="w-30 h-30 object-cover rounded-xl"
          alt="${product.alt}"
        >

        <div class="flex-1">

          <p class="text-sm text-text-secondary">
            ${product.brand}
          </p>

          <h3 class="font-semibold text-lg mt-1">
            ${product.name}
          </h3>

          <p class="font-bold text-xl mt-2">
            $${product.price}
          </p>

        </div>

        <div class="flex flex-col gap-3">

          <button
            class="add-to-cart-btn bg-accent text-white px-5 py-2 rounded-lg"
            data-id="${product.id}"
          >
            Add to Cart
          </button>

          <button
            class="remove-wishlist-btn border border-red-500 text-red-500 px-5 py-2 rounded-lg"
            data-id="${product.id}"
          >
            Remove
          </button>

        </div>

      </article>
    `;
  });

  wishlistContainer.innerHTML = html;
  const removeButtons = document.querySelectorAll(".remove-wishlist-btn");

  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.id);

      const updatedWishlist = wishlist.filter((product) => {
        return product.id !== productId;
      });

      localStorage.setItem(
        "vendorHubWishlist",
        JSON.stringify(updatedWishlist),
      );
updateWishlistBadge()
      renderWishlist();
      showToast("Removed from Wishlist");

    });
  });
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.id);

      const product = wishlist.find((item) => item.id === productId);

      const cart = JSON.parse(localStorage.getItem("vendorHubCart")) || [];

      const existingProduct = cart.find((item) => item.id === product.id);

      if (existingProduct) {
        existingProduct.quantity++;
      } else {
        cart.push({
          ...product,
          quantity: 1,
        });
      }

      localStorage.setItem("vendorHubCart", JSON.stringify(cart));
      updateCartBadge();
      showToast(" Added to Cart");
    });
  });
}

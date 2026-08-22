import { products, IMAGE_PATH, deliveryOptions } from "./data.js";
import { showToast } from "./toast.js";
import { updateCartBadge, updateWishlistBadge } from "./header.js";
import { setupProductDetailsAnimations } from "./dashboardAnimations.js";
const productDetailsContainer = document.getElementById(
  "product-details-container",
);
let cart = JSON.parse(localStorage.getItem("vendorHubCart")) || [];
const wishlist = JSON.parse(localStorage.getItem("vendorHubWishlist")) || [];

//////////// read id of the product that was clicked

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");


const product = products.find((item) => {
  return item.id == productId;
 
});


function renderProductDetails() {
  productDetailsContainer.innerHTML = `
  <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
  
      <!-- LEFT -->
      <div>
  
          <!-- Main Image -->
          <div
              class="border border-border rounded-2xl bg-white p-8 shadow-sm"
          >
              <img
              id="main-product-image"
                  src="${IMAGE_PATH}${product.image}"
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
                      src="${IMAGE_PATH}${image}"
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
              ${product.brand}
          </p>
  
          <h1 class="text-4xl font-bold mt-2 text-text-primary">
              ${product.name}
          </h1>
  
          <div class="flex items-center gap-3 mt-4">
  
              <span class="text-yellow-500">
                  ★★★★★
              </span>
  
              <span class="text-text-secondary">
                  ${product.rating}
              </span>
  
              <span class="text-text-secondary">
                  (${product.reviews} Reviews)
              </span>
  
          </div>
  
          <div class="mt-8 flex items-center gap-4">
  
              <span class="text-4xl font-bold text-primary">
                  ${product.currency}${product.price}
              </span>
  
              <span class="line-through text-text-secondary">
                  ${product.currency}${product.originalPrice}
              </span>
  
              <span class="text-accent font-semibold">
                  ${product.discount}
              </span>
  
          </div>
  
          <div class="mt-4 space-y-5">

    <div class="flex items-center gap-3">

       

        <span class="${
          product.inStock ? "text-green-600" : "text-red-500"
        } font-medium">

            ${
              product.inStock
                ? `In Stock (${product.stock} left)`
                : "Out of Stock"
            }

        </span>

    </div>

    <div class="flex items-center gap-3">

        <span class="font-semibold">
            Shipping:
        </span>

        <span class='text-accent'>
            ${product.shipping}
        </span>

    </div>

    <div>

        <h3 class="font-semibold text-md mb-2">
            Description
        </h3>

        <p class="text-text-secondary ">
            ${product.description}
        </p>

    </div>

</div>

<div class="mt-8">

    <h3 class="font-semibold text-md mb-2">

        Features

    </h3>

    <ul ">

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

<div class="mt-10">

    <h3 class="font-semibold text-lg mb-3">
        Quantity
    </h3>

    <div class="flex items-center gap-5">

        <button
            id="decrease-qty"
            class="w-11 h-11 rounded-xl border border-border hover:border-accent hover:text-accent transition"
        >
            −
        </button>

        <span
            id="quantity"
            class="text-xl font-semibold"
        >
            1
        </span>

        <button
            id="increase-qty"
            class="w-11 h-11 rounded-xl border border-border hover:border-accent hover:text-accent transition"
        >
            +
        </button>

    </div>

</div>

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
    stroke="white"
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
  const addCartBtn = document.getElementById("add-cart-btn");

 
  addCartBtn.addEventListener("click", () => {
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.push({
        ...product,
        quantity: 1,
        deliveryOptionId: "1",
      });
    }

    localStorage.setItem("vendorHubCart", JSON.stringify(cart));

    updateCartBadge();
    showToast("Added to Cart");
  });

  const wishlistBtn = document.getElementById("wishlist-btn");
  const wishlistIcon = document.getElementById("wishlist-icon");

  function updateWishlistButton() {
    const isWishlisted = wishlist.some((item) => item.id === product.id);

    if (isWishlisted) {
      // Filled orange
      wishlistIcon.setAttribute("fill", "#F77F00");
      wishlistIcon.setAttribute("stroke", "#F77F00");
    } else {
      // Orange outline
      wishlistIcon.setAttribute("fill", "none");
      wishlistIcon.setAttribute("stroke", "#F77F00");
    }
  }
  updateWishlistButton();
  updateWishlistBadge();

  wishlistBtn.addEventListener("click", () => {
    const existingProduct = wishlist.find((item) => item.id === product.id);

    if (existingProduct) {
      const index = wishlist.findIndex((item) => item.id === product.id);

      wishlist.splice(index, 1);
    } else {
      wishlist.push(product);
    }

    localStorage.setItem("vendorHubWishlist", JSON.stringify(wishlist));

    updateWishlistButton();
    updateWishlistBadge()

    if (existingProduct) {
      showToast("Removed from Wishlist");
    } else {
      showToast(" Added to Wishlist");
    }
  });
  setupProductDetailsAnimations();
}
renderProductDetails();


///////////product images

const mainImage = document.getElementById("main-product-image");

const thumbnails = document.querySelectorAll(".thumbnail");

thumbnails.forEach((thumbnail) => {
  thumbnail.addEventListener("click", () => {
    mainImage.src = IMAGE_PATH + thumbnail.dataset.image;
  });
});

///////quantity functionality

let quantity = 1;

const quantityText = document.getElementById("quantity");
const increaseBtn = document.getElementById("increase-qty");
const decreaseBtn = document.getElementById("decrease-qty");

increaseBtn.addEventListener("click", () => {
  quantity++;

  quantityText.textContent = quantity;
});

decreaseBtn.addEventListener("click", () => {
  if (quantity > 1) {
    quantity--;

    quantityText.textContent = quantity;
  }
});



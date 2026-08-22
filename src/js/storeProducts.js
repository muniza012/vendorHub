import { stores, products, IMAGE_PATH } from "./data.js";

const storeHeader = document.getElementById("store-header");
const storeProductsContainer = document.getElementById(
  "store-products-container",
);
const storeProductsHeading = document.getElementById("store-products-heading");

// Get store ID from URL
const params = new URLSearchParams(window.location.search);
const storeId = Number(params.get("storeId"));

// Find selected store
const selectedStore = stores.find((store) => store.id === storeId);

// If store doesn't exist
if (!selectedStore) {
  storeHeader.innerHTML = `
    <div class="py-10 text-center">
      <h1 class="text-2xl font-bold text-text-primary">
        Store Not Found
      </h1>

      <p class="mt-3 text-text-secondary">
        The store you're looking for doesn't exist.
      </p>

      <a
        href="stores.html"
        class="inline-flex mt-6 px-6 py-3 rounded-full
               bg-accent text-white font-medium
               hover:bg-accent-hover transition"
      >
        Back to Stores
      </a>
    </div>
  `;

  storeProductsContainer.innerHTML = "";
} else {
  // Find products belonging to this store
  const storeProducts = products.filter(
    (product) => product.vendorId === storeId,
  );

  // Update page title
  document.title = `${selectedStore.name} - VendorHub`;

  // Render store header
  storeHeader.innerHTML = `
    <div class="flex flex-col sm:flex-row items-center gap-6">

      <div
        class="w-28 h-28 rounded-2xl bg-gray-50
               flex items-center justify-center shrink-0"
      >
        <img
          src="${IMAGE_PATH}${selectedStore.logo}"
          alt="${selectedStore.alt}"
          class="max-w-[90px] max-h-[70px] object-contain"
        />
      </div>

      <div class="text-center sm:text-left">
        <p class="text-sm text-white">
          Official Store
        </p>

        <h1
          class="text-3xl sm:text-4xl font-bold
                 text-white mt-1"
        >
          ${selectedStore.name}
        </h1>

        <p class="mt-2 text-white">
          ${storeProducts.length} ${
            storeProducts.length === 1 ? "product" : "products"
          }
          available
        </p>
      </div>

    </div>
  `;

  // Update heading
  storeProductsHeading.textContent = `${selectedStore.name} Products`;

  // No products
  if (storeProducts.length === 0) {
    storeProductsContainer.innerHTML = `
      <div class="col-span-full py-20 text-center">

        <h3 class="text-2xl font-semibold text-text-primary">
          No Products Available
        </h3>

        <p class="mt-3 text-text-secondary">
          This store doesn't have any products yet.
        </p>

      </div>
    `;
  } else {
    renderStoreProducts(storeProducts);
  }

  // Product rendering
  function renderStoreProducts(productsToRender) {
    let html = "";

    productsToRender.forEach((product) => {
      html += `
        <article
          class="group bg-white border border-border
                 rounded-2xl overflow-hidden shadow-sm
                 hover:shadow-lg hover:-translate-y-1
                 transition-all duration-300 cursor-pointer"
          data-product-id="${product.id}"
        >

          <!-- Product Image -->
          <div
            class="h-52 bg-gray-50 flex items-center
                   justify-center overflow-hidden"
          >
            <img
              src="${IMAGE_PATH}${product.image}"
              alt="${product.alt}"
              class="w-full h-full object-contain
                     group-hover:scale-105
                     transition-transform duration-300"
            />
          </div>

          <!-- Product Info -->
          <div class="p-4">

            <p class="text-xs text-text-secondary">
              ${product.brand}
            </p>

            <h3
              class="font-semibold text-text-primary
                     mt-1 line-clamp-2
                     group-hover:text-accent transition-colors"
            >
              ${product.name}
            </h3>

            <div class="flex items-center gap-2 mt-3">
              <span class="text-lg font-bold text-text-primary">
                ${product.currency}${product.price.toFixed(2)}
              </span>

              ${
                product.originalPrice
                  ? `
                    <span class="text-xs text-text-secondary line-through">
                      ${product.currency}${product.originalPrice.toFixed(2)}
                    </span>
                  `
                  : ""
              }
            </div>

            ${
              product.discount
                ? `
                  <p class="text-sm text-accent font-medium mt-2">
                    ${product.discount}
                  </p>
                `
                : ""
            }

            <div class="flex items-center gap-1 mt-3 text-sm">
              <span class="text-accent">★</span>
              <span class="font-medium">${product.rating}</span>
              <span class="text-text-secondary">
                (${product.reviews})
              </span>
            </div>

          </div>

        </article>
      `;
    });

    storeProductsContainer.innerHTML = html;
  }

  // Product click
  storeProductsContainer.addEventListener("click", (event) => {
    const productCard = event.target.closest("[data-product-id]");

    if (!productCard) return;

    const productId = Number(productCard.dataset.productId);

    window.location.href = `productDetails.html?id=${productId}`;
  });
}

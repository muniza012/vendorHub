import { db } from "../../firebase.config.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const storeHeader = document.getElementById("store-header");
const storeProductsContainer = document.getElementById(
  "store-products-container",
);
const storeProductsHeading = document.getElementById("store-products-heading");

// Get store ID from URL
const params = new URLSearchParams(window.location.search);
const storeId = params.get("storeId");


async function loadStore() {
  const storeRef = doc(db, "stores", storeId);
  const storeSnapshot = await getDoc(storeRef);

  if (!storeSnapshot.exists()) {
    showStoreNotFound();
    return;
  }

  const selectedStore = {
    id: storeSnapshot.id,
    ...storeSnapshot.data(),
  };

  const productsQuery = query(
    collection(db, "products"),
    where("vendorId", "==", storeId),
  );

  const productsSnapshot = await getDocs(productsQuery);

  const storeProducts = productsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  renderStore(selectedStore, storeProducts);
}

function showStoreNotFound() {
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
}

function renderStore(selectedStore, storeProducts) {
  document.title = `${selectedStore.storeName} - VendorHub`;

  storeHeader.innerHTML = `
    <div class="flex flex-col sm:flex-row items-center gap-6">

      <div
        class="w-28 h-28 rounded-2xl bg-gray-50
               flex items-center justify-center shrink-0"
      >
        <div class="text-4xl font-bold text-accent">
          ${selectedStore.storeName.charAt(0).toUpperCase()}
        </div>
      </div>

      <div class="text-center sm:text-left">
        <p class="text-sm text-white">
          Official Store
        </p>

        <h1
          class="text-3xl sm:text-4xl font-bold
                 text-white mt-1"
        >
          ${selectedStore.storeName}
        </h1>

        <p class="mt-2 text-white">
          ${storeProducts.length}
          ${storeProducts.length === 1 ? "product" : "products"}
          available
        </p>
      </div>

    </div>
  `;

  storeProductsHeading.textContent = `${selectedStore.storeName} Products`;

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

    return;
  }

  let html = "";

  storeProducts.forEach((product) => {
    html += `
    <a
    href="productDetails.html?id=${product.id}"
    class="product-card"
  >

        <div class="product-image-wrap">
          <img
            src="${product.imageUrl}"
            alt="${product.name}"
          >
        </div>

        <div class="product-card-body">

          <p class="product-category" style='color:red'>
            ${product.category}
          </p>

          <h3>
          <strong>
            ${product.name}
            </strong>
          </h3>

          <div class="product-meta">
            <strong>
              $${product.price}
            </strong>

            <span style='color:green ; padding-left:10px'>
              ${
                product.stock === 0
                  ? "Out of stock"
                  : `${product.stock} in stock`
              }
            </span>
          </div>

        </div>

      </a>
    `;
  });

  storeProductsContainer.innerHTML = html;
}
loadStore();
storeProductsContainer.addEventListener("click", (event) => {
  const productCard = event.target.closest("[data-product-id]");

  if (!productCard) return;

  const productId = productCard.dataset.productId;

  window.location.href = `productDetails.html?productId=${productId}`;
});


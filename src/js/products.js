import { db } from "../../firebase.config.js";
import { updateCartBadge, updateWishlistBadge } from "./header.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

/* =========================================================
   DOM ELEMENTS
========================================================= */
const productsContainer = document.getElementById("products-container");
const categoryDropdown = document.getElementById("category-dropdown");
const categoryFilterSelect = document.getElementById("category-filter");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const sortProducts = document.getElementById("sort-products");

/* =========================================================
   STATE VARIABLES
========================================================= */
let allProducts = [];
let categoriesList = [];
let currentSearch = "";
let currentCategory = "All";
let currentSort = "";

const FALLBACK_IMAGE = "../../assets/category-assets/clothing.png";

/* =========================================================
   HELPERS & UTILS
========================================================= */
function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function isActiveProduct(product) {
  return (
    product.status === undefined ||
    product.status === "published" ||
    product.status === "active"
  );
}

/* =========================================================
   FIRESTORE DATA FETCHING
========================================================= */
async function loadFirestoreData() {
  if (productsContainer) {
    productsContainer.innerHTML = `<div class="col-span-full py-20 text-center text-text-secondary">Loading products...</div>`;
  }

  try {
    // 1. Fetch Products
    const querySnapshot = await getDocs(collection(db, "products"));
    allProducts = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(isActiveProduct);

    // 2. Extract unique categories dynamically from Firestore products
    const uniqueCategories = new Set();
    allProducts.forEach((p) => {
      if (p.category && typeof p.category === "string") {
        uniqueCategories.add(p.category.trim());
      }
    });
    categoriesList = Array.from(uniqueCategories).sort();

    // 3. Populate dynamic dropdowns and filters
    populateCategoryFilters();

    // 4. Parse initial URL parameters (e.g., ?category=Electronics or ?search=shoe)
    parseURLParams();

    // 5. Initial Render
    updateProducts();
  } catch (error) {
    console.error("Error loading products from Firestore:", error);
    if (productsContainer) {
      productsContainer.innerHTML = `
        <div class="col-span-full py-20 text-center">
          <h4 class="text-2xl font-semibold text-text-primary">Failed to load products</h4>
          <p class="mt-2 text-text-secondary">Please try refreshing the page.</p>
        </div>
      `;
    }
  }
}

/* =========================================================
   URL PARAMETER PARSER
========================================================= */
function parseURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get("category");
  const searchParam = urlParams.get("search");

  if (categoryParam) {
    currentCategory = categoryParam;
    if (categoryFilterSelect) categoryFilterSelect.value = categoryParam;
  }

  if (searchParam) {
    currentSearch = searchParam.trim().toLowerCase();
    if (searchInput) searchInput.value = searchParam;
  }
}

/* =========================================================
   CATEGORY FILTER POPULATION
========================================================= */
function populateCategoryFilters() {
  // Populate Header Dropdown
  if (categoryDropdown) {
    let dropdownHTML = "";
    categoriesList.forEach((cat) => {
      dropdownHTML += `
        <a
          href="./products.html?category=${encodeURIComponent(cat)}"
          data-category="${escapeHTML(cat)}"
          class="block px-5 py-3 text-sm font-medium text-text-primary border-l-4 border-transparent hover:border-accent hover:bg-background hover:text-accent transition-all duration-200"
        >
          ${escapeHTML(cat)}
        </a>
      `;
    });
    categoryDropdown.innerHTML = dropdownHTML;
  }

  // Populate Select Dropdown Filter
  if (categoryFilterSelect) {
    categoryFilterSelect.innerHTML = `<option value="">All Categories</option>`;
    categoriesList.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categoryFilterSelect.appendChild(option);
    });
  }
}

/* =========================================================
   RENDER PRODUCTS
========================================================= */
function renderProducts(productsToRender) {
  if (!productsContainer) return;

  if (productsToRender.length === 0) {
    productsContainer.innerHTML = `
      <div class="col-span-full py-20 text-center">
        <h4 class="text-2xl font-semibold text-text-primary">
          No products available
        </h4>
        <button
          id="show-all-products"
          class="mt-6 px-6 py-3 rounded-full bg-accent text-white hover:bg-accent-hover transition cursor-pointer"
        >
          Browse All Products
        </button>
      </div>
    `;

    document
      .getElementById("show-all-products")
      ?.addEventListener("click", () => {
        currentSearch = "";
        currentCategory = "All";
        currentSort = "";

        if (searchInput) searchInput.value = "";
        if (sortProducts) sortProducts.value = "";
        if (categoryFilterSelect) categoryFilterSelect.value = "";

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        updateProducts();
      });

    return;
  }

  let html = "";

  productsToRender.forEach((product) => {
    const imageUrl = product.imageUrl || product.image || FALLBACK_IMAGE;
    const brand = product.brand || product.category || "General";
    const name = product.name || "Unnamed Product";
    const price = Number(product.price) || 0;
    const originalPrice = Number(product.originalPrice) || 0;
    const discountText = product.discount || "";

    html += `
      <a href="./productDetails.html?id=${encodeURIComponent(product.id)}" class="block">
        <article class="product-card bg-white rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full">
          
          <div class="relative overflow-hidden aspect-square">
            <img
              src="${escapeHTML(imageUrl)}"
              alt="${escapeHTML(name)}"
              class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            ${
              discountText
                ? `<span class="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
                    ${escapeHTML(discountText)}
                  </span>`
                : ""
            }
          </div>

          <div class="p-4 flex flex-col flex-grow justify-between">
            <div>
              <p class="text-xs text-text-secondary uppercase tracking-wider">${escapeHTML(brand)}</p>
              <h3 class="font-semibold text-text-primary mt-1 line-clamp-2">
                ${escapeHTML(name)}
              </h3>
            </div>

            <div class="mt-4">
              <div class="flex items-baseline gap-2">
                <span class="text-base md:text-lg font-bold text-text-primary">
                  ${formatMoney(price)}
                </span>
                ${
                  originalPrice > price
                    ? `<span class="text-xs text-text-secondary line-through">${formatMoney(originalPrice)}</span>`
                    : ""
                }
              </div>
            </div>
          </div>

        </article>
      </a>
    `;
  });

  productsContainer.innerHTML = html;
}

/* =========================================================
   FILTER & SORT ENGINE
========================================================= */
function updateProducts() {
  let filteredProducts = [...allProducts];

  // Search filter
  if (currentSearch) {
    filteredProducts = filteredProducts.filter((product) => {
      const nameMatch = (product.name || "")
        .toLowerCase()
        .includes(currentSearch);
      const brandMatch = (product.brand || "")
        .toLowerCase()
        .includes(currentSearch);
      const categoryMatch = (product.category || "")
        .toLowerCase()
        .includes(currentSearch);
      return nameMatch || brandMatch || categoryMatch;
    });
  }

  // Category filter
  if (currentCategory !== "All" && currentCategory !== "") {
    filteredProducts = filteredProducts.filter(
      (product) =>
        String(product.category || "")
          .trim()
          .toLowerCase() === currentCategory.trim().toLowerCase(),
    );
  }

  // Sorting logic
  switch (currentSort) {
    case "price-low":
      filteredProducts.sort(
        (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0),
      );
      break;

    case "price-high":
      filteredProducts.sort(
        (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0),
      );
      break;

    case "az":
      filteredProducts.sort((a, b) =>
        (a.name || "").localeCompare(b.name || ""),
      );
      break;

    case "za":
      filteredProducts.sort((a, b) =>
        (b.name || "").localeCompare(a.name || ""),
      );
      break;

    case "rating":
      filteredProducts.sort(
        (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0),
      );
      break;
  }

  renderProducts(filteredProducts);
}

/* =========================================================
   EVENT LISTENERS
========================================================= */

// Search Handlers
const handleSearch = () => {
  if (!searchInput) return;
  currentSearch = searchInput.value.trim().toLowerCase();
  updateProducts();
};

if (searchInput) {
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleSearch();
  });
}

if (searchBtn) searchBtn.addEventListener("click", handleSearch);

// Header Category Dropdown Event
if (categoryDropdown) {
  categoryDropdown.addEventListener("click", (event) => {
    const item = event.target.closest("[data-category]");
    if (!item) return;
    event.preventDefault();
    currentCategory = item.dataset.category;
    if (categoryFilterSelect) categoryFilterSelect.value = currentCategory;
    updateProducts();
  });
}

// Select Inputs Event Handling
if (categoryFilterSelect) {
  categoryFilterSelect.addEventListener("change", () => {
    currentCategory = categoryFilterSelect.value || "All";
    updateProducts();
  });
}

if (sortProducts) {
  sortProducts.addEventListener("change", () => {
    currentSort = sortProducts.value;
    updateProducts();
  });
}

/* =========================================================
   INIT
========================================================= */
loadFirestoreData();
updateCartBadge?.();
updateWishlistBadge?.();

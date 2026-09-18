import { db } from "../../firebase.config.js";
import { updateCartBadge, updateWishlistBadge } from "./header.js";
import { animateProducts, animateCategories } from "./dashboardAnimations.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

/* =========================================================
   DOM ELEMENTS
========================================================= */
const productsContainer = document.getElementById("products-container");
const storesContainer = document.getElementById("stores-container");
const categoryDropdown = document.getElementById("category-dropdown");
const categoryCarouselContainer = document.getElementById(
  "category-carousel-container",
);
const discoverCategoriesContainer = document.getElementById(
  "discover-categories-container",
);
const trendingPicksSection = document.getElementById("trending-picks");
const productsHeading = document.getElementById("products-heading");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const slidesContainer = document.getElementById("slides");
const dotsContainer = document.getElementById("hero-dots");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

/* =========================================================
   FIRESTORE DATA
========================================================= */
let products = [];
let stores = [];

/* =========================================================
   CATEGORY & HERO DATA
========================================================= */
const categories = [
  { name: "Food", image: "food.png" },
  { name: "Electronics", image: "electronics.png" },
  { name: "Makeup", image: "makeup.png" },
  { name: "Home", image: "home.png" },
  { name: "Travel", image: "travel.png" },
  { name: "Fashion", image: "clothing.png" },
];

const heroSlides = [
  {
    title: "Summer Sale",
    offer: "Up to 50% Off",
    description: "Discover amazing products from your favorite stores.",
    buttonText: "Shop Now",
    image: "slider-4.avif",
  },
  {
    title: "Latest Gadgets",
    offer: "Starting at $99",
    description: "Phones, laptops, gaming and more.",
    buttonText: "Explore",
    image: "slider-3.avif",
  },
  {
    title: "Trending Styles",
    offer: "Buy 2 Get 1",
    description: "Upgrade your wardrobe with top brands.",
    buttonText: "Discover",
    image: "slider-2.avif",
  },
];

const IMAGE_PATH = "../../assets/category-assets/";

/* =========================================================
   HELPERS
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

function getProductDate(product) {
  if (!product?.createdAt) return 0;
  if (typeof product.createdAt === "object" && product.createdAt.seconds) {
    return product.createdAt.seconds * 1000;
  }
  const date = new Date(product.createdAt).getTime();
  return Number.isNaN(date) ? 0 : date;
}

// Fixed filter to support both "published" and "active"
function isActiveProduct(product) {
  return (
    product.status === undefined ||
    product.status === "published" ||
    product.status === "active"
  );
}

/* =========================================================
   LOAD PRODUCTS & STORES FROM FIRESTORE
========================================================= */
async function loadProductsFromFirestore() {
  const snapshot = await getDocs(collection(db, "products"));

  products = snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter(isActiveProduct);

  console.log("FIRESTORE PRODUCTS LOADED:", products);
}

async function loadStoresFromFirestore() {
  const snapshot = await getDocs(collection(db, "stores"));

  stores = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  console.log("FIRESTORE STORES LOADED:", stores);
}

function getTopProducts() {
  return [...products]
    .sort((a, b) => {
      const ratingDifference = Number(b.rating || 0) - Number(a.rating || 0);
      if (ratingDifference !== 0) return ratingDifference;
      return getProductDate(b) - getProductDate(a);
    })
    .slice(0, 12);
}

/* =========================================================
   RENDER PRODUCTS Across All Shops
========================================================= */
function renderProducts(productsToRender) {
  if (!productsContainer) return;

  if (productsToRender.length === 0) {
    productsContainer.innerHTML = `
      <div class="col-span-full py-20 text-center">
        <h4 class="text-2xl font-semibold text-text-primary">
          No products found
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
        renderProducts(getTopProducts());
        if (productsHeading) productsHeading.textContent = "Trending Picks";
      });

    return;
  }

  let html = "";

  productsToRender.forEach((product) => {
    const imageUrl = product.imageUrl || `${IMAGE_PATH}clothing.png`;
    const brand = product.brand || product.category || "General";
    const name = product.name || "Unnamed Product";
    const price = Number(product.price) || 0;
    const originalPrice = Number(product.originalPrice) || 0;
    const discountText = product.discount || "";

    html += `
      <div class="bg-white rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between">
        
        <a href="./productDetails.html?id=${encodeURIComponent(product.id)}" class="block relative group overflow-hidden">
          <img
            src="${escapeHTML(imageUrl)}"
            alt="${escapeHTML(name)}"
            class="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
          />
          ${
            discountText
              ? `<span class="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
                  ${escapeHTML(discountText)}
                </span>`
              : ""
          }
        </a>

        <div class="p-4 flex flex-col flex-grow justify-between">
          <div>
            <p class="text-xs text-text-secondary uppercase tracking-wider">
              ${escapeHTML(brand)}
            </p>
            <a href="./productDetails.html?id=${encodeURIComponent(product.id)}">
              <h3 class="font-semibold text-text-primary mt-1 line-clamp-2 hover:text-accent transition">
                ${escapeHTML(name)}
              </h3>
            </a>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-lg font-bold text-text-primary">
                ${formatMoney(price)}
              </span>
              ${
                originalPrice > price
                  ? `<span class="text-xs text-text-secondary line-through">${formatMoney(originalPrice)}</span>`
                  : ""
              }
            </div>

            <a
              href="./productDetails.html?id=${encodeURIComponent(product.id)}"
              class="w-9 h-9 flex items-center justify-center bg-accent/10 text-accent rounded-full hover:bg-accent hover:text-white transition"
              aria-label="View product"
            >
              <i class="fa-solid fa-arrow-right text-sm"></i>
            </a>
          </div>
        </div>

      </div>
    `;
  });

  productsContainer.innerHTML = html;
  if (typeof animateProducts === "function") animateProducts();
}

/* =========================================================
   RENDER STORES
========================================================= */
function renderStores(storesToRender) {
  if (!storesContainer) return;

  if (storesToRender.length === 0) {
    storesContainer.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <h3 class="text-xl font-semibold text-text-primary">No stores available</h3>
      </div>
    `;
    return;
  }

  let html = "";

  storesToRender.slice(0, 10).forEach((store) => {
    const storeName = store.storeName || "Unnamed Store";
    const logoUrl = store.logoUrl || "";

    html += `
      <a
        href="./storeProducts.html?storeId=${encodeURIComponent(store.id)}"
        class="group rounded-2xl border border-primary overflow-hidden shadow-sm hover:shadow-lg transition bg-white"
      >
        <div class="aspect-square flex items-center bg-primary justify-center px-3">
          ${
            logoUrl
              ? `<img
                  src="${escapeHTML(logoUrl)}"
                  alt="${escapeHTML(storeName)}"
                  class="max-w-full max-h-full object-contain transition duration-300 group-hover:scale-105"
                />`
              : `<div class="text-4xl font-bold text-accent">
                  ${escapeHTML(storeName.charAt(0).toUpperCase())}
                </div>`
          }
        </div>
        <div class="py-4 text-center font-medium text-sm group-hover:text-accent">
          ${escapeHTML(storeName)}
        </div>
      </a>
    `;
  });

  storesContainer.innerHTML = html;
}

/* =========================================================
   CATEGORIES RENDER & FILTERS
========================================================= */
function renderCategories() {
  if (!categoryDropdown) return;
  let html = "";
  categories.forEach((category) => {
    html += `
      <a
        href="#"
        data-category="${escapeHTML(category.name)}"
        class="block px-5 py-3 text-sm font-medium text-text-primary border-l-4 border-transparent hover:border-accent hover:bg-background hover:text-accent transition-all duration-200"
      >
        ${escapeHTML(category.name)}
      </a>
    `;
  });
  categoryDropdown.innerHTML = html;
}

function renderCategoryCarousel() {
  if (!categoryCarouselContainer) return;
  let html = "";
  categories.forEach((category) => {
    html += `
      <a
        href="#"
        data-category="${escapeHTML(category.name)}"
        class="flex flex-col items-center gap-2 shrink-0 group"
      >
        <div class="w-14 h-14 rounded-full bg-surface border border-border shadow-sm flex items-center justify-center transition-all duration-300 group-hover:bg-secondary group-hover:scale-105">
          <img src="${IMAGE_PATH}${category.image}" alt="${escapeHTML(category.name)}" class="w-8 h-8"/>
        </div>
        <span class="text-xs text-text-primary font-medium group-hover:text-accent">${escapeHTML(category.name)}</span>
      </a>
    `;
  });
  categoryCarouselContainer.innerHTML = html;
  if (typeof animateCategories === "function") animateCategories();
}

function renderDiscoverCategories() {
  if (!discoverCategoriesContainer) return;
  let html = "";
  categories.forEach((category) => {
    html += `
      <div>
        <a href="#" data-category="${escapeHTML(category.name)}" class="group flex flex-col items-center">
          <div class="w-full h-full flex items-center justify-center">
            <img src="${IMAGE_PATH}${category.image}" alt="${escapeHTML(category.name)}" class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"/>
          </div>
          <span class="mt-2 text-center text-sm font-medium group-hover:text-accent transition-colors">${escapeHTML(category.name)}</span>
        </a>
      </div>
    `;
  });
  discoverCategoriesContainer.innerHTML = html;
}

function filterByCategory(selectedCategory) {
  const filteredProducts = products.filter((product) => {
    return (
      String(product.category || "")
        .trim()
        .toLowerCase() === selectedCategory.trim().toLowerCase()
    );
  });

  renderProducts(filteredProducts);
  if (productsHeading)
    productsHeading.textContent = `${selectedCategory} Products`;
  if (trendingPicksSection) {
    trendingPicksSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function handleCategoryClick(event) {
  const categoryItem = event.target.closest("[data-category]");
  if (!categoryItem) return;
  event.preventDefault();
  filterByCategory(categoryItem.dataset.category);
}

if (categoryDropdown)
  categoryDropdown.addEventListener("click", handleCategoryClick);
if (categoryCarouselContainer)
  categoryCarouselContainer.addEventListener("click", handleCategoryClick);
if (discoverCategoriesContainer)
  discoverCategoriesContainer.addEventListener("click", handleCategoryClick);

/* =========================================================
   SEARCH
========================================================= */
function handleSearch() {
  const searchText = searchInput ? searchInput.value.trim().toLowerCase() : "";

  if (!searchText) {
    renderProducts(getTopProducts());
    renderStores(stores);
    if (productsHeading) productsHeading.textContent = "Trending Picks";
    return;
  }

  const filteredProducts = products.filter((product) => {
    return [
      product.name,
      product.brand,
      product.category,
      product.description,
      product.sku,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(searchText);
  });

  const filteredStores = stores.filter((store) => {
    return [store.storeName, store.ownerName, store.category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(searchText);
  });

  renderProducts(filteredProducts);
  renderStores(filteredStores);

  if (productsHeading)
    productsHeading.textContent = `Search results for "${searchInput.value.trim()}"`;
  if (trendingPicksSection) {
    trendingPicksSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
  });
}
if (searchBtn) searchBtn.addEventListener("click", handleSearch);

/* =========================================================
   HERO SLIDER
========================================================= */
let currentSlide = 0;

function renderHeroSlides() {
  if (!slidesContainer) return;
  let html = "";
  heroSlides.forEach((slide) => {
    html += `
      <div class="min-w-full bg-primary flex items-center">
        <div class="w-full lg:w-1/2 p-4 lg:p-14">
          <h2 class="text-2xl md:text-4xl lg:text-6xl font-bold text-white mt-3">${escapeHTML(slide.title)}</h2>
          <p class="text-accent text-2xl md:text-3xl font-bold md:mt-3">${escapeHTML(slide.offer)}</p>
          <p class="text-gray-300 mt-5">${escapeHTML(slide.description)}</p>
          <button class="mt-8 px-7 py-3 rounded-full bg-accent hover:bg-accent-hover transition text-white font-semibold cursor-pointer">${escapeHTML(slide.buttonText)}</button>
        </div>
        <div class="w-full h-full lg:w-1/2 overflow-hidden rounded-l-3xl">
          <img src="${IMAGE_PATH}${slide.image}" class="w-full h-full object-cover" alt="${escapeHTML(slide.title)}"/>
        </div>
      </div>
    `;
  });
  slidesContainer.innerHTML = html;
  renderHeroDots();
  updateSlider();
}

function renderHeroDots() {
  if (!dotsContainer) return;
  let html = "";
  heroSlides.forEach((_, index) => {
    html += `<span class="dot w-3 h-3 rounded-full ${index === 0 ? "bg-accent" : "bg-white/60"} cursor-pointer" data-index="${index}"></span>`;
  });
  dotsContainer.innerHTML = html;
}

function updateSlider() {
  if (!slidesContainer || !dotsContainer) return;
  slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
  const dots = dotsContainer.querySelectorAll(".dot");
  dots.forEach((dot, index) => {
    dot.classList.toggle("bg-accent", index === currentSlide);
    dot.classList.toggle("bg-white/60", index !== currentSlide);
  });
}

if (nextBtn) {
  nextBtn.onclick = () => {
    currentSlide = (currentSlide + 1) % heroSlides.length;
    updateSlider();
  };
}

if (prevBtn) {
  prevBtn.onclick = () => {
    currentSlide = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
    updateSlider();
  };
}

if (dotsContainer) {
  dotsContainer.addEventListener("click", (e) => {
    const dot = e.target.closest(".dot");
    if (dot) {
      currentSlide = Number(dot.dataset.index);
      updateSlider();
    }
  });
}

setInterval(() => {
  if (heroSlides.length && slidesContainer) {
    currentSlide = (currentSlide + 1) % heroSlides.length;
    updateSlider();
  }
}, 4000);

/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */
async function initializeDashboard() {
  if (productsContainer) {
    productsContainer.innerHTML = `<div class="col-span-full py-20 text-center text-text-secondary">Loading products...</div>`;
  }
  if (storesContainer) {
    storesContainer.innerHTML = `<div class="col-span-full py-16 text-center text-text-secondary">Loading stores...</div>`;
  }

  try {
    await Promise.all([loadProductsFromFirestore(), loadStoresFromFirestore()]);

    renderProducts(getTopProducts());
    renderStores(stores);

    renderCategories();
    renderCategoryCarousel();
    renderDiscoverCategories();
    renderHeroSlides();

    updateCartBadge?.();
    updateWishlistBadge?.();
  } catch (error) {
    console.error("DASHBOARD FIRESTORE ERROR:", error);
    if (productsContainer) {
      productsContainer.innerHTML = `
        <div class="col-span-full py-20 text-center">
          <h4 class="text-2xl font-semibold text-text-primary">Unable to load products</h4>
          <p class="mt-3 text-text-secondary">Please refresh the page and try again.</p>
        </div>`;
    }
  }
}

initializeDashboard();

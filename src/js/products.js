import { stores, products, IMAGE_PATH, categories } from "./data.js";
import { updateCartBadge,updateWishlistBadge } from "./header.js";
let currentSearch = "";
let currentCategory = "All";
let currentSort = "";
const productsContainer = document.getElementById("products-container");
const storesContainer = document.getElementById("stores-container");
const categoryDropdown = document.getElementById("category-dropdown");
const trendingPicksSection = document.getElementById("trending-picks");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const sortProducts = document.getElementById("sort-products");

////   rendering products
function renderProducts(productsToRender) {
  let html = "";

  if (productsToRender.length === 0) {
    productsContainer.innerHTML = `
    <div class="col-span-full py-20 text-center">
      <h4 class="text-2xl font-semibold text-text-primary">
        No products available
      </h4>
      <button
        id="show-all-products"
        class="mt-6 px-6 py-3 rounded-full bg-accent text-white hover:bg-accent-hover transition"
      >
        Browse All Products
      </button>
    </div>
  `;

    const showAllBtn = document.getElementById("show-all-products");

    showAllBtn.addEventListener("click", () => {
      currentSearch = "";
      currentCategory = "All";
      currentSort = "";

      searchInput.value = "";
      sortProducts.value = "";

      updateProducts();
    });
    return;
  }

  productsToRender.forEach((product) => {
    const productCard = `
    <a href="./productDetails.html?id=${product.id}">
        <article
          class="product-card bg-white rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          <img
            src=${IMAGE_PATH}${product.image}
            alt=${product.alt}
            class="w-full aspect-square object-cover"
          />

          <div class="p-4">
            <p class="text-xs text-text-secondary">${product.brand}</p>

            <h3 class="font-semibold mt-1 line-clamp-2">
              ${product.name}
            </h3>

            <p class="text-sm md:text-xl font-bold text-text-primary mt-3">
           ${product.price}
            </p>

            <p class="text-accent text-sm font-medium mt-2">
             ${product.discount}
            </p>
          </div>
        </article>
</a>
   
        `;
    html += productCard;
  });
  productsContainer.innerHTML = html;
}
updateProducts();

////   rendering categories

function renderCategories() {
  let html = "";
  categories.forEach((category) => {
    const categoryHTML = `
    <a
    href="./products.html?category=${encodeURIComponent(category.name)}"
        data-category="${category.name}"
      class="block px-5 py-3 text-sm font-medium text-text-primary border-l-4 border-transparent hover:border-accent hover:bg-background hover:text-accent transition-all duration-200"
    >
      ${category.name}
    </a>
    `;
    html += categoryHTML;
  });
  categoryDropdown.innerHTML = html;
}
renderCategories();

/////////     category dropdown

categoryDropdown.addEventListener("click", (event) => {
  event.preventDefault();

  const selectedCategory = event.target.dataset.category;

  if (!selectedCategory) return;

  currentCategory = selectedCategory;

  updateProducts();

 
});

/////////// Search products

const handleSearch = () => {
  currentSearch = searchInput.value.trim().toLowerCase();

  updateProducts();
};

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

searchBtn.addEventListener("click", handleSearch);

//////////////////filter/sort products

sortProducts.addEventListener("change", () => {
  currentSort = sortProducts.value;

  updateProducts();
});

//////////////Products refactor

function updateProducts() {
  let filteredProducts = [...products];

  // Search
  if (currentSearch) {
    filteredProducts = filteredProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(currentSearch) ||
        product.brand.toLowerCase().includes(currentSearch)
      );
    });
  }

  // Category
  if (currentCategory !== "All") {
    filteredProducts = filteredProducts.filter((product) => {
      return product.category === currentCategory;
    });
  }

  /////sort

  switch (currentSort) {
    case "price-low":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;

    case "price-high":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;

    case "az":
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;

    case "za":
      filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;

    case "rating":
      filteredProducts.sort((a, b) => b.rating - a.rating);
      break;
  }

  renderProducts(filteredProducts);
}

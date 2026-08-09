import { stores, products, IMAGE_PATH, categories } from './data.js';
import { updateCartBadge ,updateWishlistBadge} from "./header.js";
const productsContainer = document.getElementById("products-container");
const storesContainer = document.getElementById("stores-container");
const categoryDropdown = document.getElementById("category-dropdown");
const trendingPicksSection = document.getElementById("trending-picks");
const productsHeading = document.getElementById("products-heading");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

/////slider start

const slides = document.getElementById("slides");
const dots = document.querySelectorAll(".dot");

const totalSlides = dots.length;

let index = 0;

function updateSlider() {
  slides.style.transform = `translateX(-${index * 100}%)`;

  dots.forEach((dot) => {
    dot.classList.remove("bg-accent");
    dot.classList.add("bg-white/60");
  });

  dots[index].classList.remove("bg-white/60");
  dots[index].classList.add("bg-accent");
}

document.getElementById("next").onclick = () => {
  index++;

  if (index >= totalSlides) {
    index = 0;
  }

  updateSlider();
};

document.getElementById("prev").onclick = () => {
  index--;

  if (index < 0) {
    index = totalSlides - 1;
  }

  updateSlider();
};

dots.forEach((dot, i) => {
  dot.onclick = () => {
    index = i;

    updateSlider();
  };
});

setInterval(() => {
  index++;

  if (index >= totalSlides) {
    index = 0;
  }

  updateSlider();
}, 4000);

/////slider end

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
      renderProducts(products);
      productsHeading.textContent = "Top Picks";
  });
    return;


  }

  productsToRender.forEach((product) => {
    const productCard = `
    
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

   
        `;
    html += productCard;
  });
  productsContainer.innerHTML = html;
}
renderProducts(products.slice(0, 10));


//////// render stores

function renderStores(storesToRender) {
  if (storesToRender.length === 0) {

    storesContainer.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <h3 class="text-xl font-semibold text-text-primary">
          No stores available
        </h3>

      
      </div>
    `;

    return;
  }
  let storesHtml = "";

  storesToRender.forEach((store) => {
    let storeCard = `
        <a
        href="#"
        class="group rounded-2xl border border-primary overflow-hidden shadow-sm hover:shadow-lg transition"
      >
        <div
          class="aspect-square flex items-center bg-primary ${store.hoverBg} justify-center px-3"
        >
          <img
            src=${IMAGE_PATH}${store.logo}
            alt="hotels"
            class="max-w-full max-h-full object-contain transition duration-300 group-hover:scale-105"
          />
        </div>

        <div
          class="py-4 text-center font-medium text-sm group-hover:text-accent"
        >
          ${store.name}
        </div>
      </a>
        `;
    storesHtml += storeCard;
  });
  storesContainer.innerHTML = storesHtml;
}

renderStores(stores.slice(0, 10));

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

  const filteredProducts = products.filter((product) => {
    return product.category === selectedCategory;
  });

  renderProducts(filteredProducts);
  productsHeading.textContent = `${selectedCategory} Products`;

  trendingPicksSection.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

/////////// Search products 

const handleSearch = () => {

  const searchText = searchInput.value.trim().toLowerCase(); 
  console.log(searchText);
  
  if (searchText === "") {
    renderProducts(products);
    renderStores();
    productsHeading.textContent = "Top Picks";
    return;
  }
  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchText) ||
      product.brand.toLowerCase().includes(searchText)
    );
  })
  renderProducts(filteredProducts);
  trendingPicksSection.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  const filteredStores = stores.filter((store) => {
    return store.name.toLowerCase().includes(searchText);
  });
  renderStores(filteredStores);
  trendingPicksSection.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

}

searchInput.addEventListener("keydown", (event) => {

  if (event.key === "Enter") {

      handleSearch();

  }

});

searchBtn.addEventListener('click', handleSearch)


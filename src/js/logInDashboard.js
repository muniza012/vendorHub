import {
  stores,
  products,
  IMAGE_PATH,
  categories,
  categoryCarouselItems,
  heroSlides,
} from "./data.js";
import { updateCartBadge, updateWishlistBadge } from "./header.js";
import {
  animateProducts,
  animateCategories,
  
} from "./dashboardAnimations.js";
const productsContainer = document.getElementById("products-container");
const storesContainer = document.getElementById("stores-container");
const categoryDropdown = document.getElementById("category-dropdown");
const trendingPicksSection = document.getElementById("trending-picks");
const productsHeading = document.getElementById("products-heading");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

/////create slider dynamically
const slidesContainer = document.getElementById("slides");

heroSlides.forEach((slide) => {
  const slideElement = document.createElement("div");

  slideElement.className = "min-w-full bg-primary flex items-center";

  slideElement.innerHTML = `
    <div class="w-full lg:w-1/2 p-4 lg:p-14">

      <h2 class="hero-title text-2xl md:text-4xl lg:text-6xl font-bold text-white mt-2">
        ${slide.title}
      </h2>

      <p class="hero-offer text-accent text-2xl md:text-3xl font-bold md:mt-3">
        ${slide.offer}
      </p>

      <p class="hero-description text-gray-300 mt-5">
        ${slide.description}
      </p>

      <button
        class="hero-button mt-8 px-7 py-3 rounded-full bg-accent hover:bg-accent-hover transition text-white font-semibold cursor-pointer"
      >
        ${slide.button}
      </button>

    </div>

    <div class="w-full h-full lg:w-1/2 overflow-hidden rounded-l-3xl">

      <img
        src="${IMAGE_PATH}${slide.image}"
        class="hero-image w-full h-full object-cover"
        alt="${slide.title}"
      />

    </div>
  `;

  slidesContainer.appendChild(slideElement);
});

//////create slider 3 dots

const dotsContainer = document.getElementById("hero-dots");

heroSlides.forEach((slide, i) => {
  const dot = document.createElement("span");

  dot.className =
    i === 0
      ? "dot w-3 h-3 rounded-full bg-accent cursor-pointer"
      : "dot w-3 h-3 rounded-full bg-white/60 cursor-pointer";

  dot.dataset.index = i;

  dotsContainer.appendChild(dot);
});

//////////make slider dynamic

///// slider start

const slides = document.getElementById("slides");
const dots = document.querySelectorAll(".dot");

const totalSlides = heroSlides.length;

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

///// slider end

// const slides = document.getElementById("slides");
// const dots = document.querySelectorAll(".dot");

// const totalSlides = dots.length;

// let index = 0;

// function updateSlider() {
//   slides.style.transform = `translateX(-${index * 100}%)`;

//   dots.forEach((dot) => {
//     dot.classList.remove("bg-accent");
//     dot.classList.add("bg-white/60");
//   });

//   dots[index].classList.remove("bg-white/60");
//   dots[index].classList.add("bg-accent");
// }

// document.getElementById("next").onclick = () => {
//   index++;

//   if (index >= totalSlides) {
//     index = 0;
//   }

//   updateSlider();
// };

// document.getElementById("prev").onclick = () => {
//   index--;

//   if (index < 0) {
//     index = totalSlides - 1;
//   }

//   updateSlider();
// };

// dots.forEach((dot, i) => {
//   dot.onclick = () => {
//     index = i;

//     updateSlider();
//   };
// });

// setInterval(() => {
//   index++;

//   if (index >= totalSlides) {
//     index = 0;
//   }

//   updateSlider();
// }, 4000);

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
    
        <a
        href="./productDetails.html?id=${product.id}"
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
        </a>

   
        `;
    html += productCard;
  });
  productsContainer.innerHTML = html;
  //  Products now exist in the DOM now apply animation
  animateProducts();
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
        <a
        href="./storeProducts.html?storeId=${store.id}"
        class="group rounded-2xl border border-primary overflow-hidden shadow-sm hover:shadow-lg transition"
      >
        <div
          class="aspect-square flex items-center bg-primary ${store.hoverBg} justify-center px-3"
        >
          <img
            src=${IMAGE_PATH}${store.logo}
            alt="hotels"
            class="max-w-full max-h-full object-contain transition duration-300 group-hover:scale-105 invert"
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
  });
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
};

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

searchBtn.addEventListener("click", handleSearch);

////////////////category carousal container//////////////

const categoryCarouselContainer = document.getElementById(
  "category-carousel-container",
);

function renderCategoryCarousel() {
  let html = "";

  categoryCarouselItems.forEach((category) => {
    html += `
    <a
    href="${category.type === "link" ? category.link : "#"}"
    ${category.type !== "link" ? `data-category="${category.name}"` : ""}
    class="flex flex-col items-center gap-2 shrink-0 group"
  >
        <div
          class="w-14 h-14 rounded-full bg-surface border border-border shadow-sm
                 flex items-center justify-center
                 transition-all duration-300
                 group-hover:bg-secondary group-hover:scale-105"
        >
          <img
            src="${IMAGE_PATH}${category.image}"
            alt="${category.alt}"
            class="w-8 h-8"
          />
        </div>

        <span
          class="text-xs text-text-primary font-medium
                 group-hover:text-accent"
        >
          ${category.name}
        </span>
      </a>
    `;
  });

  categoryCarouselContainer.innerHTML = html;
  animateCategories();
}

renderCategoryCarousel();

/////////////
categoryCarouselContainer.addEventListener("click", (event) => {
  const categoryItem = event.target.closest("[data-category]");

  if (!categoryItem) return;

  event.preventDefault();

  const selectedCategory = categoryItem.dataset.category;

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



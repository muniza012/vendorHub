import { stores, products, IMAGE_PATH } from "./data.js";
const urlParams = new URLSearchParams(window.location.search);
const storeFilter = urlParams.get("filter");
const storesContainer = document.getElementById("stores-container");

let storesToRender = [...stores];

if (storeFilter === "new") {
  storesToRender = stores.filter((store) => store.isNew);
}

function renderStores() {
  let html = "";

  storesToRender.forEach((store) => {
    html += `
      <article
        class="group bg-white border border-border rounded-2xl
               overflow-hidden shadow-sm hover:shadow-lg
               hover:-translate-y-1 transition-all duration-300
               cursor-pointer"
        data-store-id="${store.id}"
      >
        <div
          class="h-40 flex items-center justify-center
                 bg-gray-50 group-hover:bg-background
                 transition-colors duration-300"
        >
          <img
            src="${IMAGE_PATH}${store.logo}"
            alt="${store.alt}"
            class="max-w-[120px] max-h-[90px] object-contain
                   group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div class="p-4 text-center border-t border-border">
          <h2
            class="font-semibold text-text-primary
                   group-hover:text-accent transition-colors"
          >
            ${store.name}
          </h2>

          <p class="mt-1 text-xs text-text-secondary">
            View Store
          </p>
        </div>
      </article>
    `;
  });

  storesContainer.innerHTML = html;
}

renderStores();

storesContainer.addEventListener("click", (event) => {
  const storeCard = event.target.closest("[data-store-id]");

  if (!storeCard) return;

  const storeId = Number(storeCard.dataset.storeId);

  const selectedStore = stores.find((store) => store.id === storeId);

  if (!selectedStore) return;

  window.location.href = `storeProducts.html?storeId=${storeId}`;
});

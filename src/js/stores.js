import { db } from "../../firebase.config.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const storesContainer = document.getElementById("stores-container");

let storesToRender = [];
async function loadStores() {
  const snapshot = await getDocs(collection(db, "stores"));

  storesToRender = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  renderStores();
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
                  group-hover:bg-background
                 transition-colors duration-300"
        >
        ${
          store.logoUrl
            ? `
              <img
                src="${store.logoUrl}"
                alt="${store.storeName} logo"
                class="w-full h-full object-contain"
              />
            `
            : `
              <div class="text-4xl font-bold  text-accent">
                ${store.storeName.charAt(0).toUpperCase()}
              </div>
            `
        }
        </div>

        <div class="p-4 text-center border-t border-border">
          <h2
            class="font-semibold text-text-primary
                   group-hover:text-accent transition-colors"
          >
          ${store.storeName}
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
loadStores();

storesContainer.addEventListener("click", (event) => {
  const storeCard = event.target.closest("[data-store-id]");

  if (!storeCard) return;

  const storeId = storeCard.dataset.storeId;

  window.location.href = `storeProducts.html?storeId=${storeId}`;
});

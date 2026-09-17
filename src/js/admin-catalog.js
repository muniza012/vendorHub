import { db, auth, logOutUser } from "../../firebase.config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Header DOM Elements
const userNameDisplay = document.querySelector("#user-name-display");
const logoutBtn = document.querySelector("#logout-btn");

// Logout Click Event Listener
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await logOutUser();
      window.location.href = "home-before.html";
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to log out.");
    }
  });
}

// Authentication State Observer
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // 1. Fetch user display name from Firestore
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data().displayName) {
        userNameDisplay.textContent = userDocSnap.data().displayName;
      } else if (user.displayName) {
        userNameDisplay.textContent = user.displayName;
      } else {
        userNameDisplay.textContent = user.email.split("@")[0];
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      userNameDisplay.textContent = user.email
        ? user.email.split("@")[0]
        : "User";
    }

    // 2. Load catalog stores and products
    stores = await loadStoresFromFirestore(user);
    populateVendors();
    await renderCatalog();
  } else {
    // Redirect if unauthenticated
    window.location.href = "home-before.html";
  }
});

const CLOUDINARY_CLOUD_NAME = "jpzoc8y7";
const CLOUDINARY_UPLOAD_PRESET = "vendorhub_products";

const vendorKey = "vendorhub-active-vendor";

const elements = {
  vendor: document.querySelector("#vendor-select"),
  search: document.querySelector("#product-search"),
  category: document.querySelector("#category-filter"),
  status: document.querySelector("#status-filter"),
  sort: document.querySelector("#sort-products"),
  grid: document.querySelector("#product-grid"),
  resultCount: document.querySelector("#catalog-result-count"),
  modal: document.querySelector("#product-modal"),
  form: document.querySelector("#product-form"),
};

let stores = [];
let activeVendor = null;
let firestoreProducts = [];

function currentProducts() {
  return firestoreProducts;
}

function escapeHTML(value) {
  return String(value || "").replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character],
  );
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("Image upload failed.");
  }

  const data = await response.json();
  return data.secure_url;
}

async function loadStoresFromFirestore(user) {
  if (!user) return [];

  const storesQuery = query(
    collection(db, "stores"),
    where("ownerId", "==", user.uid),
  );

  const snapshot = await getDocs(storesQuery);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function loadProductsFromFirestore() {
  if (!activeVendor) return [];

  const productsQuery = query(
    collection(db, "products"),
    where("vendorId", "==", activeVendor),
  );

  const snapshot = await getDocs(productsQuery);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

function populateVendors() {
  if (stores.length === 0) {
    elements.vendor.innerHTML = `<option value="">No Stores Found</option>`;
    activeVendor = null;
    return;
  }

  elements.vendor.innerHTML = stores
    .map(
      (store) =>
        `<option value="${store.id}">
          ${escapeHTML(store.storeName || "Unnamed Store")}
        </option>`,
    )
    .join("");

  const savedVendor = localStorage.getItem(vendorKey);
  if (savedVendor && stores.some((s) => s.id === savedVendor)) {
    activeVendor = savedVendor;
    elements.vendor.value = savedVendor;
  } else {
    activeVendor = stores[0].id;
    elements.vendor.value = activeVendor;
  }
}

function updateCategories() {
  const selected = elements.category.value;
  const categories = [
    ...new Set(
      currentProducts()
        .map((product) => product.category)
        .filter(Boolean),
    ),
  ].sort();

  elements.category.innerHTML = `<option value="all">All categories</option>${categories
    .map(
      (category) =>
        `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`,
    )
    .join("")}`;

  elements.category.value = categories.includes(selected) ? selected : "all";
}

function filteredProducts() {
  const query = elements.search.value.trim().toLowerCase();
  const products = currentProducts().filter((product) => {
    const matchesQuery =
      !query ||
      `${product.name} ${product.category} ${product.sku || ""}`
        .toLowerCase()
        .includes(query);
    return (
      matchesQuery &&
      (elements.category.value === "all" ||
        product.category === elements.category.value) &&
      (elements.status.value === "all" ||
        product.status === elements.status.value)
    );
  });

  return products.sort((a, b) => {
    if (elements.sort.value === "name") return a.name.localeCompare(b.name);
    if (elements.sort.value === "price-low") return a.price - b.price;
    if (elements.sort.value === "stock-low") return a.stock - b.stock;
    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
  });
}

function renderSummary() {
  const products = currentProducts();
  document.querySelector("#total-products").textContent = products.length;
  document.querySelector("#published-products").textContent = products.filter(
    (product) => product.status === "published",
  ).length;
  document.querySelector("#low-stock-products").textContent = products.filter(
    (product) => product.stock < 10,
  ).length;
  document.querySelector("#catalog-value").textContent = formatMoney(
    products.reduce(
      (total, product) => total + (product.price || 0) * (product.stock || 0),
      0,
    ),
  );
}

async function renderCatalog() {
  firestoreProducts = await loadProductsFromFirestore();
  updateCategories();
  renderSummary();

  const products = filteredProducts();
  elements.resultCount.textContent = `${products.length} product${products.length === 1 ? "" : "s"}`;

  elements.grid.innerHTML = products.length
    ? products
        .map(
          (product) =>
            `<article class="product-card">
              <div class="product-image-wrap">
                <img src="${escapeHTML(product.imageUrl)}" alt="${escapeHTML(product.name)}">
                <span class="product-status ${product.status}">${product.status}</span>
                <button class="product-delete" type="button" data-delete="${product.id}" aria-label="Remove ${escapeHTML(product.name)}">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
              <div class="product-card-body">
                <p class="product-category">${escapeHTML(product.category)}</p>
                <h3>${escapeHTML(product.name)}</h3>
                <div class="product-meta">
                  <strong>${formatMoney(product.price)}</strong>
                  <span class="stock ${product.stock < 10 ? "low" : ""}">
                    ${product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}
                  </span>
                </div>
              </div>
            </article>`,
        )
        .join("")
    : `<div class="catalog-empty"><i class="fa-solid fa-box-open"></i><h3>No products found</h3><p>Try a different search or add a new product to this catalog.</p></div>`;
}

function openModal() {
  elements.modal.hidden = false;
  elements.form.elements.name.focus();
}

function closeModal() {
  elements.modal.hidden = true;
  elements.form.reset();
}

// Event Listeners Setup
elements.vendor.addEventListener("change", (event) => {
  activeVendor = event.target.value;
  localStorage.setItem(vendorKey, activeVendor);
  renderCatalog();
});

[elements.search, elements.category, elements.status, elements.sort].forEach(
  (element) => element.addEventListener("input", () => renderCatalog()),
);

document.querySelector("#clear-filters").addEventListener("click", () => {
  elements.search.value = "";
  elements.category.value = "all";
  elements.status.value = "all";
  elements.sort.value = "recent";
  renderCatalog();
});

document
  .querySelector("#add-product-button")
  .addEventListener("click", openModal);
document
  .querySelector("#close-product-modal")
  .addEventListener("click", closeModal);
document.querySelector("#cancel-product").addEventListener("click", closeModal);

elements.modal.addEventListener("click", (event) => {
  if (event.target === elements.modal) closeModal();
});

// Firestore Delete Operation
elements.grid.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;

  const productId = button.dataset.delete;
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      await deleteDoc(doc(db, "products", productId));
      await renderCatalog();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Could not delete product.");
    }
  }
});

// Firestore Add Operation
elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = elements.form.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  const formData = new FormData(elements.form);
  const imageFile = formData.get("image");

  try {
    const imageUrl = await uploadImageToCloudinary(imageFile);
    const price = Number(formData.get("price"));
    const originalPrice = Number(formData.get("originalPrice"));
    const stock = Number(formData.get("stock"));

    const productData = {
      name: formData.get("name"),
      sku: formData.get("sku"),
      brand: formData.get("brand"),
      category: formData.get("category"),
      price: price,
      originalPrice: originalPrice,
      discount:
        originalPrice > price
          ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`
          : "",
      currency: "$",
      stock: stock,
      inStock: stock > 0,
      shipping: formData.get("shipping"),
      description: formData.get("description"),
      features: formData
        .get("features")
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      imageUrl: imageUrl,
      images: [imageUrl],
      rating: 0,
      reviews: 0,
      status: "published",
      vendorId: activeVendor,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "products"), productData);

    closeModal();
    await renderCatalog();
  } catch (error) {
    console.error("PRODUCT ADD ERROR:", error);
    alert("Failed to add product.");
  } finally {
    submitButton.disabled = false;
  }
});

// Initialize with Firebase Auth Observer
onAuthStateChanged(auth, async (user) => {
  if (user) {
    stores = await loadStoresFromFirestore(user);
    populateVendors();
    await renderCatalog();
  } else {
    console.log("No authenticated user.");
  }
});

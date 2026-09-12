(() => {
  const storageKey = "vendorhub-catalogs";
  const vendorKey = "vendorhub-active-vendor";
  const imageRoot = "../../assets/";
  const vendors = {
    "north-star": { name: "North Star Home", products: [
      { id: "ns-1", name: "Linen Cloud Cushion", category: "Home & Living", price: 34, stock: 18, status: "published", image: "ikea-product1.jpg", added: 6 },
      { id: "ns-2", name: "Cedar & Sage Candle", category: "Home & Living", price: 22, stock: 7, status: "published", image: "big-pic1.jpg", added: 5 },
      { id: "ns-3", name: "Weekend Market Tote", category: "Fashion", price: 28, stock: 42, status: "published", image: "big-pic2.jpg", added: 4 },
      { id: "ns-4", name: "Stoneware Breakfast Set", category: "Home & Living", price: 68, stock: 0, status: "draft", image: "ikea-product1.jpg", added: 3 }
    ] },
    "bloom-lab": { name: "Bloom Lab Skincare", products: [
      { id: "bl-1", name: "Daily Glow Serum", category: "Beauty", price: 42, stock: 24, status: "published", image: "makeup-product3.jpg", added: 6 },
      { id: "bl-2", name: "Calm Skin Cleanser", category: "Beauty", price: 26, stock: 9, status: "published", image: "makeup-product3.jpg", added: 5 },
      { id: "bl-3", name: "Rosewater Travel Kit", category: "Beauty", price: 31, stock: 3, status: "draft", image: "makeup-product3.jpg", added: 2 }
    ] },
    "orchard-table": { name: "Orchard Table Foods", products: [
      { id: "ot-1", name: "Citrus Morning Box", category: "Food & Drink", price: 36, stock: 16, status: "published", image: "juice-product2.jpg", added: 6 },
      { id: "ot-2", name: "Sparkling Ginger Tonic", category: "Food & Drink", price: 18, stock: 5, status: "published", image: "juice-product2.jpg", added: 4 }
    ] }
  };

  const elements = {
    vendor: document.querySelector("#vendor-select"), search: document.querySelector("#product-search"), category: document.querySelector("#category-filter"),
    status: document.querySelector("#status-filter"), sort: document.querySelector("#sort-products"), grid: document.querySelector("#product-grid"),
    resultCount: document.querySelector("#catalog-result-count"), modal: document.querySelector("#product-modal"), form: document.querySelector("#product-form")
  };
  let catalogs = loadCatalogs();
  let activeVendor = localStorage.getItem(vendorKey) || "north-star";

  function loadCatalogs() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (stored) Object.keys(stored).forEach((key) => { if (vendors[key]) vendors[key].products = stored[key]; });
    } catch (error) { console.warn("Catalog data could not be restored.", error); }
    return vendors;
  }
  function saveCatalogs() {
    localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(Object.entries(catalogs).map(([key, vendor]) => [key, vendor.products]))));
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }
  function currentProducts() { return catalogs[activeVendor].products; }
  function formatMoney(value) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value); }
  function populateVendors() {
    elements.vendor.innerHTML = Object.entries(catalogs).map(([key, vendor]) => `<option value="${key}">${escapeHTML(vendor.name)}</option>`).join("");
    elements.vendor.value = activeVendor;
  }
  function updateCategories() {
    const selected = elements.category.value;
    const categories = [...new Set(currentProducts().map((product) => product.category))].sort();
    elements.category.innerHTML = `<option value="all">All categories</option>${categories.map((category) => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("")}`;
    elements.category.value = categories.includes(selected) ? selected : "all";
  }
  function filteredProducts() {
    const query = elements.search.value.trim().toLowerCase();
    const products = currentProducts().filter((product) => {
      const matchesQuery = !query || `${product.name} ${product.category} ${product.id}`.toLowerCase().includes(query);
      return matchesQuery && (elements.category.value === "all" || product.category === elements.category.value) && (elements.status.value === "all" || product.status === elements.status.value);
    });
    return products.sort((a, b) => {
      if (elements.sort.value === "name") return a.name.localeCompare(b.name);
      if (elements.sort.value === "price-low") return a.price - b.price;
      if (elements.sort.value === "stock-low") return a.stock - b.stock;
      return b.added - a.added;
    });
  }
  function renderSummary() {
    const products = currentProducts();
    document.querySelector("#total-products").textContent = products.length;
    document.querySelector("#published-products").textContent = products.filter((product) => product.status === "published").length;
    document.querySelector("#low-stock-products").textContent = products.filter((product) => product.stock < 10).length;
    document.querySelector("#catalog-value").textContent = formatMoney(products.reduce((total, product) => total + product.price * product.stock, 0));
  }
  function renderCatalog() {
    updateCategories();
    renderSummary();
    const products = filteredProducts();
    elements.resultCount.textContent = `${products.length} product${products.length === 1 ? "" : "s"}`;
    elements.grid.innerHTML = products.length ? products.map((product) => `<article class="product-card"><div class="product-image-wrap"><img src="${imageRoot}${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}"><span class="product-status ${product.status}">${product.status}</span><button class="product-delete" type="button" data-delete="${product.id}" aria-label="Remove ${escapeHTML(product.name)}"><i class="fa-solid fa-trash-can"></i></button></div><div class="product-card-body"><p class="product-category">${escapeHTML(product.category)}</p><h3>${escapeHTML(product.name)}</h3><div class="product-meta"><strong>${formatMoney(product.price)}</strong><span class="stock ${product.stock < 10 ? "low" : ""}">${product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}</span></div></div></article>`).join("") : `<div class="catalog-empty"><i class="fa-solid fa-box-open"></i><h3>No products found</h3><p>Try a different search or add a new product to this catalog.</p></div>`;
  }
  function openModal() { elements.modal.hidden = false; elements.form.elements.name.focus(); }
  function closeModal() { elements.modal.hidden = true; elements.form.reset(); }

  elements.vendor.addEventListener("change", (event) => { activeVendor = event.target.value; localStorage.setItem(vendorKey, activeVendor); renderCatalog(); });
  [elements.search, elements.category, elements.status, elements.sort].forEach((element) => element.addEventListener("input", renderCatalog));
  document.querySelector("#clear-filters").addEventListener("click", () => { elements.search.value = ""; elements.category.value = "all"; elements.status.value = "all"; elements.sort.value = "recent"; renderCatalog(); });
  document.querySelector("#add-product-button").addEventListener("click", openModal);
  document.querySelector("#close-product-modal").addEventListener("click", closeModal);
  document.querySelector("#cancel-product").addEventListener("click", closeModal);
  elements.modal.addEventListener("click", (event) => { if (event.target === elements.modal) closeModal(); });
  elements.grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete]");
    if (!button) return;
    catalogs[activeVendor].products = currentProducts().filter((product) => product.id !== button.dataset.delete);
    saveCatalogs();
    renderCatalog();
  });
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(elements.form);
    currentProducts().unshift({ id: `${activeVendor}-${Date.now()}`, name: formData.get("name"), category: formData.get("category"), price: Number(formData.get("price")), stock: Number(formData.get("stock")), status: "published", image: "big-pic1.jpg", added: Date.now() });
    saveCatalogs();
    closeModal();
    renderCatalog();
  });

  populateVendors();
  renderCatalog();
})();

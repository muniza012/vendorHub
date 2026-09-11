(() => {
  const orders = window.VendorHubOrders;
  const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  const table = document.querySelector("#order-table");
  const search = document.querySelector("#order-search");
  const filter = document.querySelector("#order-filter");
  const render = () => {
    const query = search.value.toLowerCase().trim();
    const visible = orders.filter((order) => (!query || `${order.id} ${order.customer} ${order.email}`.toLowerCase().includes(query)) && (filter.value === "all" || order.status === filter.value));
    document.querySelector("#order-count").textContent = `${visible.length} order${visible.length === 1 ? "" : "s"}`;
    table.innerHTML = visible.length ? visible.map((order) => `<tr><td class="order-id">${order.id}</td><td><div class="customer-cell"><span>${order.customer}</span><small>${order.email}</small></div></td><td>${order.items} item${order.items === 1 ? "" : "s"}</td><td>${order.date}</td><td><strong>${money(order.total)}</strong></td><td><span class="status-badge ${order.status}">${order.status}</span></td><td>${order.status === "pending" ? `<button class="order-action" data-complete="${order.id}">Mark complete</button>` : `<button class="btn-action" title="View order"><i class="fa-solid fa-eye"></i></button>`}</td></tr>`).join("") : `<tr><td colspan="7" class="empty-row">No orders match your filters.</td></tr>`;
  };
  document.querySelector("#pending-count").textContent = orders.filter((order) => order.status === "pending").length;
  document.querySelector("#completed-count").textContent = orders.filter((order) => order.status === "completed").length;
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  document.querySelector("#revenue-total").textContent = money(revenue);
  document.querySelector("#average-order").textContent = money(revenue / orders.length);
  [search, filter].forEach((control) => control.addEventListener("input", render));
  table.addEventListener("click", (event) => { const button = event.target.closest("[data-complete]"); if (!button) return; const order = orders.find((item) => item.id === button.dataset.complete); order.status = "completed"; window.saveVendorHubOrders(); document.querySelector("#pending-count").textContent = orders.filter((item) => item.status === "pending").length; document.querySelector("#completed-count").textContent = orders.filter((item) => item.status === "completed").length; render(); });
  document.querySelector("#export-orders").addEventListener("click", () => { const csv = ["Order,Customer,Items,Date,Total,Status", ...orders.map((order) => `${order.id},${order.customer},${order.items},${order.date},${order.total},${order.status}`)].join("\n"); const link = document.createElement("a"); link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; link.download = "vendorhub-orders.csv"; link.click(); });
  render();
})();

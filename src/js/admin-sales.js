import { db, auth } from "../../firebase.config.js";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

let ordersList = [];

// ======================================================
// AUTHENTICATION STATE & INITIALIZATION
// ======================================================

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/";
    return;
  }

  const nameDisplay = document.getElementById("user-name-display");
  if (nameDisplay) {
    nameDisplay.textContent = user.displayName || user.email || "Vendor Admin";
  }

  await loadSalesData(user);
});

// Logout Handler
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  });
}

// ======================================================
// UTILITIES
// ======================================================

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value || 0,
  );

const escapeHTML = (value) =>
  String(value || "").replace(
    /[&<>'"]/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[char],
  );

// ======================================================
// FETCH & LOAD DATA FROM FIRESTORE
// ======================================================

async function loadSalesData(user) {
  try {
    let fetchedOrders = [];

    // 1. Direct query matching vendorId
    const ordersQuery = query(
      collection(db, "orders"),
      where("vendorId", "==", user.uid),
    );
    const ordersSnap = await getDocs(ordersQuery);

    if (!ordersSnap.empty) {
      fetchedOrders = ordersSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
    } else {
      // Fallback fallback scan check
      const allOrdersSnap = await getDocs(collection(db, "orders"));
      allOrdersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const items = data.items || [];
        const belongs =
          items.some((i) => i.vendorId === user.uid) ||
          data.vendorId === user.uid;
        if (belongs) {
          fetchedOrders.push({ id: docSnap.id, ...data });
        }
      });
    }

    ordersList = fetchedOrders;

    // Sort newest first
    ordersList.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );

    updateMetricsAndSidebar(ordersList);
    renderOrdersTable(ordersList);
  } catch (error) {
    console.error("Error loading sales data:", error);
  }
}

// ======================================================
// METRICS & SIDEBAR UPDATER
// ======================================================

function updateMetricsAndSidebar(orders) {
  let pendingCount = 0;
  let completedCount = 0;
  let processingCount = 0;
  let otherCount = 0;
  let totalRevenue = 0;

  orders.forEach((order) => {
    const total = Number(order.total || order.grandTotal || 0);
    totalRevenue += total;

    const status = (order.status || "processing").toLowerCase();
    if (status.includes("complet") || status.includes("deliver")) {
      completedCount++;
    } else if (status.includes("process") || status.includes("pend")) {
      pendingCount++;
      processingCount++;
    } else {
      otherCount++;
    }
  });

  const totalOrders = orders.length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Update Metric Cards UI
  document.getElementById("pending-count").textContent = pendingCount;
  document.getElementById("completed-count").textContent = completedCount;
  document.getElementById("revenue-total").textContent = money(totalRevenue);
  document.getElementById("average-order").textContent = money(avgOrder);
  document.getElementById("order-count").textContent =
    `${totalOrders} order${totalOrders === 1 ? "" : "s"}`;

  // Update Sidebar Progress Bars
  if (totalOrders > 0) {
    const compPct = Math.round((completedCount / totalOrders) * 100);
    const procPct = Math.round((processingCount / totalOrders) * 100);
    const othPct = Math.max(0, 100 - (compPct + procPct));

    document.getElementById("stat-completed-pct").textContent = `${compPct}%`;
    document.getElementById("bar-completed").style.width = `${compPct}%`;

    document.getElementById("stat-processing-pct").textContent = `${procPct}%`;
    document.getElementById("bar-processing").style.width = `${procPct}%`;

    document.getElementById("stat-other-pct").textContent = `${othPct}%`;
    document.getElementById("bar-other").style.width = `${othPct}%`;
  }
}

// ======================================================
// TABLE RENDERING & FILTERS
// ======================================================

function renderOrdersTable(dataToRender) {
  const tableBody = document.querySelector("#order-table");
  if (!tableBody) return;

  if (dataToRender.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="empty-row" style="text-align: center; padding: 25px; color: #666;">No orders match your filters.</td></tr>`;
    return;
  }

  tableBody.innerHTML = dataToRender
    .map((order) => {
      const customerName = order.customer?.name || "Guest Customer";
      const customerEmail = order.customer?.email || "No email";
      const itemCount = order.items
        ? order.items.reduce((acc, item) => acc + Number(item.quantity || 1), 0)
        : 1;
      const dateFormatted = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString()
        : "N/A";
      const totalAmount = Number(order.total || order.grandTotal || 0);
      const status = order.status || "Processing";
      const statusClass = status.toLowerCase().includes("complet")
        ? "completed"
        : "pending";

      return `
      <tr>
        <td class="order-id">#${escapeHTML(order.id.slice(0, 8))}</td>
        <td>
          <div class="customer-cell">
            <span>${escapeHTML(customerName)}</span>
            <small>${escapeHTML(customerEmail)}</small>
          </div>
        </td>
        <td>${itemCount} item${itemCount === 1 ? "" : "s"}</td>
        <td>${escapeHTML(dateFormatted)}</td>
        <td><strong>${money(totalAmount)}</strong></td>
        <td><span class="status-badge ${statusClass}">${escapeHTML(status)}</span></td>
        <td>
          ${
            statusClass === "pending"
              ? `<button class="order-action" data-complete="${order.id}" style="background: #F77F00; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Mark complete</button>`
              : `<button class="btn-action" title="Completed"><i class="fa-solid fa-circle-check" style="color: #2a9d8f;"></i></button>`
          }
        </td>
      </tr>
    `;
    })
    .join("");
}

// Search and Filter Event Listeners
const searchInput = document.querySelector("#order-search");
const filterSelect = document.querySelector("#order-filter");

function applyFilters() {
  const searchTerm = (searchInput?.value || "").toLowerCase().trim();
  const filterVal = filterSelect?.value || "all";

  const filtered = ordersList.filter((order) => {
    const custName = (order.customer?.name || "").toLowerCase();
    const custEmail = (order.customer?.email || "").toLowerCase();
    const orderId = order.id.toLowerCase();

    const matchesSearch =
      !searchTerm ||
      orderId.includes(searchTerm) ||
      custName.includes(searchTerm) ||
      custEmail.includes(searchTerm);

    const statusStr = (order.status || "").toLowerCase();
    let matchesFilter = true;
    if (filterVal === "completed") {
      matchesFilter =
        statusStr.includes("complet") || statusStr.includes("deliver");
    } else if (filterVal === "pending") {
      matchesFilter =
        statusStr.includes("process") || statusStr.includes("pend");
    }

    return matchesSearch && matchesFilter;
  });

  renderOrdersTable(filtered);
}

if (searchInput) searchInput.addEventListener("input", applyFilters);
if (filterSelect) filterSelect.addEventListener("change", applyFilters);

// ======================================================
// INTERACTION (MARK COMPLETE & EXPORT)
// ======================================================

document
  .querySelector("#order-table")
  .addEventListener("click", async (event) => {
    const button = event.target.closest("[data-complete]");
    if (!button) return;

    const orderId = button.dataset.complete;
    try {
      button.disabled = true;
      button.textContent = "Updating...";

      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: "Completed" });

      // Update local state and UI
      const targetOrder = ordersList.find((o) => o.id === orderId);
      if (targetOrder) targetOrder.status = "Completed";

      updateMetricsAndSidebar(ordersList);
      applyFilters();
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Could not update order status.");
      button.disabled = false;
      button.textContent = "Mark complete";
    }
  });

// CSV Export Handler
document.querySelector("#export-orders").addEventListener("click", () => {
  if (ordersList.length === 0) {
    alert("No orders available to export.");
    return;
  }

  const csvRows = [
    [
      "OrderID",
      "CustomerName",
      "CustomerEmail",
      "TotalItems",
      "Date",
      "Total",
      "Status",
    ],
    ...ordersList.map((order) => [
      order.id,
      `"${order.customer?.name || "Guest"}"`,
      order.customer?.email || "",
      order.items
        ? order.items.reduce((acc, i) => acc + Number(i.quantity || 1), 0)
        : 1,
      order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "",
      order.total || order.grandTotal || 0,
      order.status || "Processing",
    ]),
  ];

  const csvContent =
    "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "vendorhub-orders.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

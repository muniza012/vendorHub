import { db, auth } from "../../firebase.config.js";
import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

let salesChartInstance = null;

// ======================================================
// AUTHENTICATION STATE & INITIALIZATION
// ======================================================

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "home-before.html";
    return;
  }

  // Display current vendor name/email in the top navbar
  const nameDisplay = document.getElementById("user-name-display");
  if (nameDisplay) {
    nameDisplay.textContent = user.displayName || user.email || "Vendor Admin";
  }

  // Load dashboard data filtered specifically for this vendor
  await loadDashboardData(user);
});

// Logout Handler
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "home-before.html";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  });
}

// ======================================================
// HELPER UTILITIES
// ======================================================

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value || 0,
  );

const escapeHTML = (value) =>
  String(value || "").replace(
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

// ======================================================
// MAIN DATA FETCHER & CALCULATOR
// ======================================================

async function loadDashboardData(user) {
  try {
    let orders = [];

    // 1. Try querying orders directly by top-level vendorId
    const ordersQuery = query(
      collection(db, "orders"),
      where("vendorId", "==", user.uid),
    );
    const ordersSnap = await getDocs(ordersQuery);

    if (!ordersSnap.empty) {
      orders = ordersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } else {
      // Fallback: Fetch all orders and check if any item matches this vendor's ID
      // (Useful if your cart/checkout saves orders with items containing vendorId)
      const allOrdersSnap = await getDocs(collection(db, "orders"));
      allOrdersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const items = data.items || data.cart || [];
        const belongsToVendor = items.some(
          (item) => item.vendorId === user.uid || item.sellerId === user.uid,
        );
        if (belongsToVendor || data.sellerId === user.uid) {
          orders.push({ id: docSnap.id, ...data });
        }
      });
    }

    // 2. Query products ONLY for the currently logged-in vendor
    const productsQuery = query(
      collection(db, "products"),
      where("vendorId", "==", user.uid),
    );
    const productsSnap = await getDocs(productsQuery);
    const totalProducts = productsSnap.size;

    // Initialize metrics
    const totalOrders = orders.length;
    let totalSales = 0;
    const uniqueCustomers = new Set();
    let completedCount = 0;
    let processingCount = 0;

    orders.forEach((order) => {
      totalSales += Number(
        order.total || order.grandTotal || order.amount || 0,
      );

      if (order.customer?.email) {
        uniqueCustomers.add(order.customer.email);
      } else if (order.userId) {
        uniqueCustomers.add(order.userId);
      }

      const status = (order.status || "").toLowerCase();
      if (status.includes("complet") || status.includes("deliver")) {
        completedCount++;
      } else if (status.includes("process") || status.includes("pend")) {
        processingCount++;
      }
    });

    // Update KPI Cards UI
    document.getElementById("kpi-total-orders").textContent = totalOrders;
    document.getElementById("kpi-total-sales").textContent =
      totalSales >= 1000
        ? `${(totalSales / 1000).toFixed(1)}K`
        : money(totalSales);
    document.getElementById("kpi-total-customers").textContent =
      uniqueCustomers.size || totalOrders;
    document.getElementById("kpi-total-products").textContent = totalProducts;

    // Update Sidebar Progress Bars
    if (totalOrders > 0) {
      const compPct = Math.round((completedCount / totalOrders) * 100);
      const procPct = Math.round((processingCount / totalOrders) * 100);
      const othPct = Math.max(0, 100 - (compPct + procPct));

      document.getElementById("stat-completed-pct").textContent = `${compPct}%`;
      document.getElementById("bar-completed").style.width = `${compPct}%`;

      document.getElementById("stat-processing-pct").textContent =
        `${procPct}%`;
      document.getElementById("bar-processing").style.width = `${procPct}%`;

      document.getElementById("stat-other-pct").textContent = `${othPct}%`;
      document.getElementById("bar-other").style.width = `${othPct}%`;
    }

    // Sort orders newest first
    orders.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB - dateA;
    });

    // Render interface elements
    renderLatestOrders(orders.slice(0, 5));
    renderActivity(orders.slice(0, 5));
    renderChart(orders);
  } catch (error) {
    console.error("Error loading vendor dashboard data from Firestore:", error);
  }
}
// ======================================================
// RENDERERS (TABLES, ACTIVITY, CHART)
// ======================================================

function renderLatestOrders(recentOrders) {
  const target = document.querySelector("#latest-orders-body");
  if (!target) return;

  if (recentOrders.length === 0) {
    target.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #666;">No orders found for your store yet.</td></tr>`;
    return;
  }

  target.innerHTML = recentOrders
    .map((order) => {
      const customerName = order.customer?.name || "Guest Customer";
      const orderDate = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString()
        : "N/A";
      const status = order.status || "Processing";
      const total = Number(order.total || order.grandTotal || 0);

      return `
      <tr>
        <td>#${escapeHTML(order.id.slice(0, 8))}</td>
        <td>${escapeHTML(customerName)}</td>
        <td><span class="badge ${escapeHTML(status.toLowerCase())}">${escapeHTML(status)}</span></td>
        <td>${escapeHTML(orderDate)}</td>
        <td>${money(total)}</td>
        <td><a href="admin-sales.html" class="btn-action" title="View details"><i class="fa-solid fa-eye"></i></a></td>
      </tr>
    `;
    })
    .join("");
}

function renderActivity(recentOrders) {
  const target = document.querySelector("#recent-activity-list");
  if (!target) return;

  if (recentOrders.length === 0) {
    target.innerHTML = `<li class="activity-item"><div class="activity-text">No recent activity recorded.</div></li>`;
    return;
  }

  target.innerHTML = recentOrders
    .map((order) => {
      const customerName = order.customer?.name || "A customer";
      const orderDate = order.createdAt
        ? new Date(order.createdAt).toLocaleString()
        : "Recently";
      const status = order.status || "Processing";

      return `
      <li class="activity-item">
        <div class="activity-text">
          <a href="admin-sales.html">${escapeHTML(customerName)}</a> placed order <a href="admin-sales.html">#${escapeHTML(order.id.slice(0, 8))}</a>.
        </div>
        <div class="activity-time">
          <i class="fa-regular fa-clock"></i> ${escapeHTML(orderDate)} · <span style="font-weight: 600; color: #F77F00;">${escapeHTML(status)}</span>
        </div>
      </li>
    `;
    })
    .join("");
}

function renderChart(orders) {
  if (!window.Chart) return;
  const canvasEl = document.querySelector("#sales-chart");
  if (!canvasEl) return;

  // Group vendor orders by date
  const grouped = {};
  orders.forEach((order) => {
    if (!order.createdAt) return;
    const dateKey = new Date(order.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    grouped[dateKey] ||= { orders: 0, revenue: 0 };
    grouped[dateKey].orders += 1;
    grouped[dateKey].revenue += Number(order.total || order.grandTotal || 0);
  });

  const labels = Object.keys(grouped).slice(-7); // Last 7 active timeline entries
  const orderCounts = labels.map((date) => grouped[date].orders);
  const revenues = labels.map((date) => grouped[date].revenue);

  if (salesChartInstance) {
    salesChartInstance.destroy();
  }

  salesChartInstance = new Chart(canvasEl, {
    type: "bar",
    data: {
      labels: labels.length > 0 ? labels : ["No Data Available"],
      datasets: [
        {
          label: "Orders",
          data: labels.length > 0 ? orderCounts : [0],
          backgroundColor: "#F77F00",
          borderRadius: 6,
          yAxisID: "orders",
        },
        {
          type: "line",
          label: "Revenue ($)",
          data: labels.length > 0 ? revenues : [0],
          borderColor: "#003049",
          backgroundColor: "rgba(247, 127, 0, 0.12)",
          pointBackgroundColor: "#F77F00",
          pointBorderColor: "#FFFFFF",
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.35,
          fill: true,
          yAxisID: "revenue",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { usePointStyle: true, padding: 16 } },
        tooltip: {
          callbacks: {
            label: (context) =>
              context.dataset.label.includes("Revenue")
                ? ` Revenue: ${money(context.raw)}`
                : ` Orders: ${context.raw}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        orders: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          title: { display: true, text: "Orders Count" },
        },
        revenue: {
          beginAtZero: true,
          position: "right",
          grid: { drawOnChartArea: false },
          ticks: { callback: (value) => `$${value}` },
          title: { display: true, text: "Revenue ($)" },
        },
      },
    },
  });
}

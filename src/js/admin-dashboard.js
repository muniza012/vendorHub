(() => {
  const orders = window.VendorHubOrders || [];
  const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  const escapeHTML = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

  function renderLatestOrders() {
    const target = document.querySelector("#latest-orders-body");
    target.innerHTML = orders.map((order) => `<tr><td>${escapeHTML(order.id)}</td><td>${escapeHTML(order.customer)}</td><td><span class="badge ${order.status}">${escapeHTML(order.status)}</span></td><td>${escapeHTML(order.date)}</td><td>${money(order.total)}</td><td><button class="btn-action" title="View ${escapeHTML(order.id)}"><i class="fa-solid fa-eye"></i></button></td></tr>`).join("");
  }

  function renderActivity() {
    const target = document.querySelector("#recent-activity-list");
    target.innerHTML = orders.map((order) => `<li class="activity-item"><div class="activity-text"><a href="admin-sales.html">${escapeHTML(order.customer)}</a> placed <a href="admin-sales.html">${escapeHTML(order.id)}</a>.</div><div class="activity-time"><i class="fa-regular fa-clock"></i> ${escapeHTML(order.date)} · ${escapeHTML(order.status)}</div></li>`).join("");
  }

  function renderChart() {
    if (!window.Chart) return;
    const grouped = orders.reduce((result, order) => {
      result[order.date] ||= { orders: 0, revenue: 0 };
      result[order.date].orders += 1;
      result[order.date].revenue += order.total;
      return result;
    }, {});
    const labels = Object.keys(grouped).reverse();
    new Chart(document.querySelector("#sales-chart"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Orders", data: labels.map((date) => grouped[date].orders), backgroundColor: ["#F77F00", "#D96D00", "#00B4D8", "#003049", "#B0C8D7", "#F77F00"], borderRadius: 7, yAxisID: "orders" },
          { type: "line", label: "Revenue", data: labels.map((date) => grouped[date].revenue), borderColor: "#003049", backgroundColor: "rgba(247, 127, 0, .16)", pointBackgroundColor: "#F77F00", pointBorderColor: "#FFFFFF", pointBorderWidth: 2, pointRadius: 5, tension: .35, fill: true, yAxisID: "revenue" }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { labels: { usePointStyle: true, padding: 18 } }, tooltip: { callbacks: { label: (context) => context.dataset.label === "Revenue" ? ` Revenue: ${money(context.raw)}` : ` Orders: ${context.raw}` } } },
        scales: { x: { grid: { display: false } }, orders: { beginAtZero: true, ticks: { stepSize: 1 }, title: { display: true, text: "Orders" } }, revenue: { beginAtZero: true, position: "right", grid: { drawOnChartArea: false }, ticks: { callback: (value) => `$${value}` }, title: { display: true, text: "Revenue" } } }
      }
    });
  }

  renderLatestOrders();
  renderActivity();
  renderChart();
})();

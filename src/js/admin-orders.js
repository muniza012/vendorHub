const defaultVendorHubOrders = [
  { id: "VH-2041", customer: "Ava Thompson", email: "ava@example.com", items: 3, date: "11 Sep 2026", total: 128.50, status: "pending" },
  { id: "VH-2040", customer: "Noah Williams", email: "noah@example.com", items: 1, date: "11 Sep 2026", total: 42.00, status: "pending" },
  { id: "VH-2039", customer: "Mia Carter", email: "mia@example.com", items: 4, date: "10 Sep 2026", total: 214.75, status: "completed" },
  { id: "VH-2038", customer: "Ethan Miller", email: "ethan@example.com", items: 2, date: "09 Sep 2026", total: 86.00, status: "completed" },
  { id: "VH-2037", customer: "Sofia Davis", email: "sofia@example.com", items: 5, date: "08 Sep 2026", total: 302.40, status: "completed" },
  { id: "VH-2036", customer: "Lucas Wilson", email: "lucas@example.com", items: 1, date: "07 Sep 2026", total: 29.99, status: "pending" }
];

const storedVendorHubOrders = localStorage.getItem("vendorhub-orders");
window.VendorHubOrders = storedVendorHubOrders ? JSON.parse(storedVendorHubOrders) : defaultVendorHubOrders;
window.saveVendorHubOrders = () => localStorage.setItem("vendorhub-orders", JSON.stringify(window.VendorHubOrders));

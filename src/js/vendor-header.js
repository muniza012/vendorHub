import { auth, getVendorProfile, logOutUser } from "../../firebase.config.js";

const navigationItems = [
  ["admin-Dashboard.html", "fa-gauge-high", "Dashboard"],
  ["admin-catalog.html", "fa-folder-open", "Catalog"],
  ["admin-sales.html", "fa-cart-shopping", "Sales"],
  ["admin-reviews.html", "fa-chart-line", "Reviews"]
];

function renderSidebar() {
  const menu = document.querySelector(".sidebar-menu");
  if (!menu) return;
  const currentPage = window.location.pathname.split("/").pop().toLowerCase();
  menu.innerHTML = navigationItems.map(([href, icon, label]) => {
    const active = href.toLowerCase() === currentPage;
    return `<li${active ? ' class="active"' : ""}><a href="${href}"><span class="menu-title"><i class="fa-solid ${icon}"></i> <span>${label}</span></span></a></li>`;
  }).join("");
}

async function loadVendorHeader() {
  renderSidebar();
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) {
    window.location.href = "../../home-before.html";
    return;
  }
  const profile = await getVendorProfile(user.uid);
  if (!profile || profile.role !== "seller") {
    window.location.href = "../../home-before.html";
    return;
  }
  const name = profile.storeName || profile.displayName || "Your store";
  const profileLink = document.querySelector(".profile-link");
  const profileName = document.querySelector(".profile-link span");
  if (profileName) profileName.textContent = name;
  if (profileLink) profileLink.href = "vendor-profile.html";
  const logoutLink = document.querySelector(".navbar-user .logout-link");
  logoutLink?.addEventListener("click", async (event) => {
    event.preventDefault();
    await logOutUser();
    window.location.href = "../../home-before.html";
  });
}

loadVendorHeader().catch(() => { window.location.href = "../../home-before.html"; });

import { db, auth } from "../../firebase.config.js";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

let allVendorsData = [];

// ======================================================
// AUTH GUARD & INITIALIZATION
// ======================================================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    loadMasterDashboard();
  } catch (err) {
    console.error("Authorization error:", err);
    window.location.href = "login.html";
  }
});

// Logout handler
document.getElementById("logout-btn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

const money = (val) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    val || 0,
  );

// ======================================================
// LOAD ALL VENDORS & METRICS
// ======================================================
async function loadMasterDashboard() {
  try {
    const tableBody = document.getElementById("vendors-table-body");

    // 1. Fetch all users who are sellers
    const usersSnap = await getDocs(collection(db, "users"));
    const sellers = [];
    usersSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.role === "seller") {
        sellers.push({ uid: docSnap.id, ...data });
      }
    });

    // 2. Fetch all products and orders once to map efficiently
    const productsSnap = await getDocs(collection(db, "products"));
    const allProducts = productsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const ordersSnap = await getDocs(collection(db, "orders"));
    const allOrders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    let globalProductsCount = 0;
    let globalSalesTotal = 0;

    allVendorsData = sellers.map((seller) => {
      // Filter products belonging to this vendor
      const vendorProducts = allProducts.filter(
        (p) => p.vendorId === seller.uid,
      );
      globalProductsCount += vendorProducts.length;

      // Filter orders belonging to this vendor
      const vendorOrders = allOrders.filter(
        (o) =>
          o.vendorId === seller.uid ||
          (o.items && o.items.some((i) => i.vendorId === seller.uid)),
      );

      let vendorSalesSum = 0;
      vendorOrders.forEach((o) => {
        vendorSalesSum += Number(o.total || o.grandTotal || 0);
      });
      globalSalesTotal += vendorSalesSum;

      return {
        uid: seller.uid,
        name:
          seller.name ||
          seller.displayName ||
          seller.ownerName ||
          "Unnamed Owner",
        phone: seller.phone || seller.phoneNumber || "No phone",
        email: seller.email || "No email",
        shopName:
          seller.shopName || seller.brand || seller.storeName || "Vendor Shop",
        productsCount: vendorProducts.length,
        salesTotal: vendorSalesSum,
        createdAt: seller.createdAt
          ? new Date(seller.createdAt).toLocaleDateString()
          : "N/A",
      };
    });

    // Update Top KPI Cards
    document.getElementById("total-vendors").textContent =
      allVendorsData.length;
    document.getElementById("total-products").textContent = globalProductsCount;
    document.getElementById("total-sales").textContent =
      money(globalSalesTotal);
    document.getElementById("vendor-count").textContent =
      `${allVendorsData.length} shop${allVendorsData.length === 1 ? "" : "s"} registered`;

    // Render Table
    if (allVendorsData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 25px; color: #666;">No vendors found in the database.</td></tr>`;
      return;
    }

    tableBody.innerHTML = allVendorsData
      .map(
        (vendor) => `
      <tr>
        <td><strong>${escapeHTML(vendor.name)}</strong></td>
        <td><span style="color: #444; font-weight: 500;">${escapeHTML(vendor.phone)}</span></td>
        <td>
          <div style="font-weight: 600; color: #F77F00;">${escapeHTML(vendor.shopName)}</div>
          <small style="color: #777;">${escapeHTML(vendor.email)}</small>
        </td>
        <td><span style="font-weight: 600; color: #2a9d8f;">${vendor.productsCount} items</span></td>
        <td><strong>${money(vendor.salesTotal)}</strong></td>
        <td>${escapeHTML(vendor.createdAt)}</td>
        <td>
          <button class="order-action" data-delete-vendor="${vendor.uid}" style="background: #e76f51; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
            <i class="fa-solid fa-trash"></i> Remove Shop
          </button>
        </td>
      </tr>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading master admin dashboard:", error);
  }
}

// ======================================================
// DELETE VENDOR / SHOP ACTION
// ======================================================
document
  .getElementById("vendors-table-body")
  .addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-delete-vendor]");
    if (!btn) return;

    const vendorUid = btn.dataset.deleteVendor;
    const confirmDelete = confirm(
      "Are you sure you want to remove this shop and all associated products? This action cannot be undone.",
    );

    if (!confirmDelete) return;

    try {
      btn.disabled = true;
      btn.textContent = "Removing...";

      // 1. Delete vendor user profile document from Firestore
      await deleteDoc(doc(db, "users", vendorUid));

      // 2. Delete all products belonging to this vendor
      const productsSnap = await getDocs(collection(db, "products"));
      const deletionPromises = [];
      productsSnap.forEach((productDoc) => {
        if (productDoc.data().vendorId === vendorUid) {
          deletionPromises.push(deleteDoc(doc(db, "products", productDoc.id)));
        }
      });

      await Promise.all(deletionPromises);

      alert("Shop and its products successfully removed.");
      loadMasterDashboard(); // Refresh table
    } catch (err) {
      console.error("Error deleting vendor:", err);
      alert("Failed to delete shop.");
      btn.disabled = false;
      btn.textContent = "Remove Shop";
    }
  });

function escapeHTML(str) {
  return String(str || "").replace(
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
}

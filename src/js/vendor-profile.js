import { auth, getVendorProfile, updateVendorProfile } from "../../firebase.config.js";

const form = document.querySelector("#profile-form");
const details = document.querySelector("#profile-details");
const editButton = document.querySelector("#edit-profile");
const cancelButton = document.querySelector("#cancel-edit");
const message = document.querySelector("#profile-message");
let profile = null;

const escapeHTML = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

function showDetails() {
  document.querySelector("#profile-store-name").textContent = profile.storeName || "Your store";
  document.querySelector("#profile-category").textContent = profile.storeCategory || "Vendor store";
  details.innerHTML = [
    ["Owner name", profile.ownerName],
    ["Business email", profile.email],
    ["Phone number", profile.phone],
    ["Store category", profile.storeCategory],
    ["Account ID", profile.uid],
    ["Created", profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Not available"]
  ].map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value || "Not provided")}</dd></div>`).join("");
}

function openEditor() {
  Object.entries(profile).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value || ""; });
  details.hidden = true;
  form.hidden = false;
  editButton.hidden = true;
}

function closeEditor() {
  form.hidden = true;
  details.hidden = false;
  editButton.hidden = false;
}

async function loadProfile() {
  await auth.authStateReady();
  if (!auth.currentUser) {
    window.location.href = "../../home-before.html";
    return;
  }
  profile = await getVendorProfile(auth.currentUser.uid);
  if (!profile || profile.role !== "seller") {
    window.location.href = "../../home-before.html";
    return;
  }
  showDetails();
}

editButton.addEventListener("click", openEditor);
cancelButton.addEventListener("click", closeEditor);
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(form));
  try {
    await updateVendorProfile(auth.currentUser.uid, values);
    profile = { ...profile, ...values };
    showDetails();
    closeEditor();
    message.textContent = "Your seller details were updated.";
    message.hidden = false;
  } catch (error) {
    message.textContent = "Could not update your seller details. Please try again.";
    message.hidden = false;
    message.style.background = "#fdecec";
    message.style.color = "#9b1c1c";
  }
});

loadProfile().catch(() => { window.location.href = "../../home-before.html"; });

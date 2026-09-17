import {
  auth,
  db,
  loginFunction,
  signUpFunction,
  createStoreFunction,
} from "../../firebase.config.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const CLOUDINARY_CLOUD_NAME = "jpzoc8y7";
const CLOUDINARY_UPLOAD_PRESET = "vendorhub_products";

// ==============================
// ELEMENTS
// ==============================

const loginModal = document.getElementById("loginModal");
const signUpChoiceModal = document.getElementById("signUpChoiceModal");
const customerSignupModal = document.getElementById("customerSignupModal");
const vendorSignupModal = document.getElementById("vendorSignupModal");

const loginBtn = document.getElementById("log");
const signUpBtn = document.getElementById("openBtn");
const sellWithVendorBtn = document.getElementById("sellWithVendorBtn");

const loginCloseBtn = document.getElementById("loginCloseBtn");
const signupChoiceCloseBtn = document.getElementById("signupChoiceCloseBtn");
const customerSignupCloseBtn = document.getElementById(
  "customerSignupCloseBtn",
);
const vendorSignupCloseBtn = document.getElementById("vendorSignupCloseBtn");

const customerSignupBtn = document.getElementById("customerSignupBtn");
const vendorSignupBtn = document.getElementById("vendorSignupBtn");

const loginForm = document.getElementById("loginForm");
const customerSignupForm = document.getElementById("customerSignupForm");
const vendorSignupForm = document.getElementById("vendorSignupForm");

// ==============================
// CLOUDINARY
// ==============================

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

// ==============================
// MODAL HELPERS
// ==============================

function openModal(modal) {
  modal.style.display = "block";

  document.body.classList.add("modal-open");
}

function closeModal(modal) {
  modal.style.display = "none";

  document.body.classList.remove("modal-open");
}

function closeAllModals() {
  loginModal.style.display = "none";
  signUpChoiceModal.style.display = "none";
  customerSignupModal.style.display = "none";
  vendorSignupModal.style.display = "none";

  document.body.classList.remove("modal-open");
}

// ==============================
// LOGIN
// ==============================

loginBtn.addEventListener("click", () => {
  openModal(loginModal);
});

loginCloseBtn.addEventListener("click", () => {
  closeModal(loginModal);
});

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const submitButton = document.getElementById("submitBtn");

  submitButton.disabled = true;

  try {
    // Login through Firebase Authentication
    const user = await loginFunction(email, password);

    // Get user's Firestore document
    const userRef = doc(db, "users", user.uid);

    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      throw new Error("User profile was not found.");
    }

    const userData = userSnapshot.data();

    console.log("LOGGED IN USER:", userData);

    // ==========================
    // CHECK USER ROLE
    // ==========================

    if (userData.role === "seller") {
      // Vendor
      window.location.href = "src/pages/admin-dashboard.html";
    } else if (userData.role === "customer") {
      // Customer
      window.location.href = "src/pages/loginDashboard.html";
    } else {
      throw new Error("Invalid user role.");
    }
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    alert(getAuthErrorMessage(error));
  } finally {
    submitButton.disabled = false;
  }
}

loginForm.addEventListener("submit", handleLogin);

// ==============================
// SIGN UP CHOICE
// ==============================

signUpBtn.addEventListener("click", () => {
  openModal(signUpChoiceModal);
});

signupChoiceCloseBtn.addEventListener("click", () => {
  closeModal(signUpChoiceModal);
});

// ==============================
// CUSTOMER SIGNUP
// ==============================

customerSignupBtn.addEventListener("click", () => {
  closeModal(signUpChoiceModal);

  openModal(customerSignupModal);
});

customerSignupCloseBtn.addEventListener("click", () => {
  closeModal(customerSignupModal);
});

async function handleCustomerSignup(event) {
  event.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();

  const lastName = document.getElementById("lastName").value.trim();

  const email = document.getElementById("signupEmail").value.trim();

  const password = document.getElementById("signupPassword").value;

  const confirmation = document.getElementById("confirmSignupPassword").value;

  // ==========================
  // PASSWORD CHECK
  // ==========================

  if (password !== confirmation) {
    alert("Passwords do not match.");

    return;
  }

  try {
    await signUpFunction(`${firstName} ${lastName}`, email, password, {
      role: "customer",
    });

    alert("Customer account created successfully.");

    customerSignupForm.reset();

    closeModal(customerSignupModal);
  } catch (error) {
    console.error("CUSTOMER SIGNUP ERROR:", error);

    alert(getAuthErrorMessage(error));
  }
}

customerSignupForm.addEventListener("submit", handleCustomerSignup);

// ==============================
// VENDOR SIGNUP
// ==============================

// "Sign Up as Vendor"
vendorSignupBtn.addEventListener("click", () => {
  closeModal(signUpChoiceModal);

  openModal(vendorSignupModal);
});

// "Sell With VendorHub"
sellWithVendorBtn.addEventListener("click", () => {
  openModal(vendorSignupModal);
});

vendorSignupCloseBtn.addEventListener("click", () => {
  closeModal(vendorSignupModal);
});

async function handleVendorSignup(event) {
  event.preventDefault();

  const storeName = document.getElementById("storeName").value.trim();

  const ownerName = document.getElementById("ownerName").value.trim();

  const phone = document.getElementById("phone").value.trim();

  const category = document.getElementById("storeCategory").value;

  const email = document.getElementById("vendorEmail").value.trim();

  const password = document.getElementById("vendorPassword").value;

  const confirmation = document.getElementById("confirmVendorPassword").value;

  const logoFile = document.getElementById("store-logo").files[0];

  // ==========================
  // PASSWORD CHECK
  // ==========================

  if (password !== confirmation) {
    alert("Passwords do not match.");

    return;
  }

  try {
    // ==========================
    // UPLOAD STORE LOGO
    // ==========================

    const logoUrl = logoFile ? await uploadImageToCloudinary(logoFile) : "";

    // ==========================
    // CREATE FIREBASE USER
    // ==========================

    const user = await signUpFunction(
      `${storeName} - ${ownerName}`,
      email,
      password,
      {
        role: "seller",

        storeName: storeName,

        ownerName: ownerName,

        phone: phone,

        storeCategory: category,
      },
    );

    // ==========================
    // CREATE STORE
    // ==========================

    await createStoreFunction(user.uid, {
      storeName: storeName,

      ownerName: ownerName,

      email: email,

      phone: phone,

      category: category,

      logoUrl: logoUrl,
    });

    alert("Vendor account created successfully.");

    vendorSignupForm.reset();

    closeModal(vendorSignupModal);

    // ==========================
    // GO TO VENDOR DASHBOARD
    // ==========================

    window.location.href = "src/pages/admin-dashboard.html";
  } catch (error) {
    console.error("VENDOR SIGNUP ERROR:", error);

    alert(getAuthErrorMessage(error));
  }
}

vendorSignupForm.addEventListener("submit", handleVendorSignup);

// ==============================
// CLOSE MODAL WHEN CLICKING
// OUTSIDE THE MODAL CONTENT
// ==============================

window.addEventListener("click", (event) => {
  if (event.target === loginModal) {
    closeModal(loginModal);
  }

  if (event.target === signUpChoiceModal) {
    closeModal(signUpChoiceModal);
  }

  if (event.target === customerSignupModal) {
    closeModal(customerSignupModal);
  }

  if (event.target === vendorSignupModal) {
    closeModal(vendorSignupModal);
  }
});

// ==============================
// FIREBASE ERROR MESSAGES
// ==============================

function getAuthErrorMessage(error) {
  const messages = {
    "auth/email-already-in-use": "An account already exists for this email.",

    "auth/invalid-credential": "The email or password is incorrect.",

    "auth/weak-password": "Password must be at least 6 characters.",

    "auth/invalid-email": "Please enter a valid email address.",

    "auth/user-not-found": "The email or password is incorrect.",

    "auth/wrong-password": "The email or password is incorrect.",
  };

  return (
    messages[error.code] ||
    error.message ||
    "Authentication failed. Please try again."
  );
}

// ==============================
// REVIEW CARDS
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".review-card");

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      console.log(`Review card ${index + 1} clicked`);
    });
  });
});

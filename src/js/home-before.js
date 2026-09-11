// import {auth,createUserWithEmailAndPassword}from "../firebase.config.js"
const modal = document.getElementById("signUpModal");
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");
const modal1 = document.getElementById("loginModal")
const loginBtn = document.getElementById("log")

// Button click hone par modal dikhayen
openBtn.onclick = function() {
  modal.style.display = "block";
  document.body.classList.add("modal-open");
}
loginBtn.onclick = function(){
    modal1.style.display="block" ;
    document.body.classList.add("modal-open");
}

// Close (X) click hone par modal band karein
closeBtn.onclick = function() {
 modal.style.display = "none";
 document.body.classList.remove("modal-open");
}
closeBtn.onclick = function() {
  modal1.style.display = "none";
  document.body.classList.remove("modal-open");
}

// Modal se bahar (overlay) par click karne se bhi band ho jaye
window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
  }
  if (event.target === modal1) {
    modal1.style.display = "none";
    document.body.classList.remove("modal-open");
  }
}
function switchRole(role) {
  const loginCard = document.querySelector('.login-card');
  const customerTab = document.getElementById('customerTab');
  const vendorTab = document.getElementById('vendorTab');
  const userRoleInput = document.getElementById('userRole');
  const formTitle = document.getElementById('formTitle');
  const formSubtitle = document.getElementById('formSubtitle');
  const submitBtn = document.getElementById('submitBtn');
  const loginFields = document.getElementById('loginFields');
  const signupFields = document.getElementById('vendorSignupFields');
  const loginForm = document.getElementById('loginForm');
  const customerInputs = loginFields.querySelectorAll('input');
  const vendorInputs = signupFields.querySelectorAll('input, select');

  const isSignup = role === 'vendor-signup';
  const isVendor = role === 'vendor' || isSignup;
  loginCard.classList.toggle('seller-mode', isVendor);
  customerTab.classList.toggle('active', role === 'customer');
  vendorTab.classList.toggle('active', role === 'vendor');
  userRoleInput.value = isVendor ? 'vendor' : 'customer';
  loginFields.hidden = isSignup;
  signupFields.hidden = !isSignup;
  customerInputs.forEach((input) => { input.required = !isSignup; });
  vendorInputs.forEach((input) => { input.required = isSignup; });

  if (isSignup) {
    formTitle.textContent = 'Open your store';
    formSubtitle.textContent = 'Create your vendor account and start selling with VendorHub.';
  } else if (isVendor) {
    formTitle.textContent = 'Welcome, vendor!';
    formSubtitle.textContent = 'Log in to manage your products, orders, and store.';
    submitBtn.textContent = 'Log In as Vendor';
  } else {
    formTitle.textContent = 'Welcome Back!';
    formSubtitle.textContent = 'Log in to manage your orders and wishlist.';
    submitBtn.textContent = 'Log In as Customer';
  }
  loginForm.reset();
  userRoleInput.value = isVendor ? 'vendor' : 'customer';
}
  // const card = document.querySelector('.login-card');
  // const customerTab = document.getElementById('customerTab');
  // const sellerTab = document.getElementById('sellerTab');
  // const userRoleInput = document.getElementById('userRole');
  // const formTitle = document.getElementById('formTitle');
  // const formSubtitle = document.getElementById('formSubtitle');
  // const submitBtn = document.getElementById('submitBtn');

  // Update backend form role value
//   userRoleInput.value = role;

//   if (role === 'customer') {
//     customerTab.classList.add('active');
//     sellerTab.classList.remove('active');
//     card.classList.remove('seller-mode');

//     formTitle.textContent = "Welcome Back!";
//     formSubtitle.textContent = "Log in to manage your orders and wishlist.";
//     submitBtn.textContent = "Log In as Customer";
//   } else {
//     sellerTab.classList.add('active');
//     customerTab.classList.remove('active');
//     card.classList.add('seller-mode');

//     formTitle.textContent = "Vendor Dashboard Sign In";
//     formSubtitle.textContent = "Access sales analytics, inventory, and payout management.";
//     submitBtn.textContent = "Log In as Seller";
//   }
// }

function handleLogin(event) {
  event.preventDefault();

  const role = document.getElementById('userRole').value;
  if (role === 'vendor' && !document.getElementById('vendorSignupFields').hidden) {
    const password = document.getElementById('vendorPassword').value;
    const confirmation = document.getElementById('confirmVendorPassword').value;
    if (password !== confirmation) {
      document.getElementById('confirmVendorPassword').setCustomValidity('Passwords do not match.');
      document.getElementById('confirmVendorPassword').reportValidity();
      return;
    }
    document.getElementById('confirmVendorPassword').setCustomValidity('');
    console.log('Vendor store registration submitted:', {
      storeName: document.getElementById('storeName').value,
      ownerName: document.getElementById('ownerName').value,
      email: document.getElementById('vendorEmail').value,
      category: document.getElementById('storeCategory').value
    });
    return;
  }
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log("Form Submitted:", {
    role,
    email,
    password
  });
}

window.switchRole = switchRole;
window.handleLogin = handleLogin;
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".review-card");

  // Optional subtle click interaction logging or animation logic
  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      console.log(`Review card ${index + 1} clicked`);
    });
  });
});
import {auth,createUserWithEmailAndPassword}from "../firebase.config.js"
const modal = document.getElementById("signUpModal");
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");
const modal1 = document.getElementById("loginModal")
const loginBtn = document.getElementById("log")

// Button click hone par modal dikhayen
openBtn.onclick = function() {
  modal.style.display = "block";
}
loginBtn.onclick = function(){
    modal1.style.display="block" ;
}

// Close (X) click hone par modal band karein
closeBtn.onclick = function() {
 modal.style.display = "none";
}
closeBtn.onclick = function() {
  modal1.style.display = "none";
}

// Modal se bahar (overlay) par click karne se bhi band ho jaye
window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
}
function switchRole(role) {
  const card = document.querySelector('.login-card');
  const customerTab = document.getElementById('customerTab');
  const sellerTab = document.getElementById('sellerTab');
  const userRoleInput = document.getElementById('userRole');
  const formTitle = document.getElementById('formTitle');
  const formSubtitle = document.getElementById('formSubtitle');
  const submitBtn = document.getElementById('submitBtn');

  // Update backend form role value
  userRoleInput.value = role;

  if (role === 'customer') {
    customerTab.classList.add('active');
    sellerTab.classList.remove('active');
    card.classList.remove('seller-mode');

    formTitle.textContent = "Welcome Back!";
    formSubtitle.textContent = "Log in to manage your orders and wishlist.";
    submitBtn.textContent = "Log In as Customer";
  } else {
    sellerTab.classList.add('active');
    customerTab.classList.remove('active');
    card.classList.add('seller-mode');

    formTitle.textContent = "Vendor Dashboard Sign In";
    formSubtitle.textContent = "Access sales analytics, inventory, and payout management.";
    submitBtn.textContent = "Log In as Seller";
  }
}

function handleLogin(event) {
  event.preventDefault();

  const role = document.getElementById('userRole').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log("Form Submitted:", {
    role,
    email,
    password
  });
}
import { loginFunction, signUpFunction } from "../../firebase.config.js";
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

async function handleLogin(event) {
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
    try {
      await signUpFunction(
        `${document.getElementById('storeName').value} - ${document.getElementById('ownerName').value}`,
        document.getElementById('vendorEmail').value,
        password,
        {
          role: 'seller',
          storeName: document.getElementById('storeName').value,
          ownerName: document.getElementById('ownerName').value,
          phone: document.getElementById('phone').value,
          storeCategory: document.getElementById('storeCategory').value,
        }
      );
      alert('Vendor account created successfully.');
      document.getElementById('loginForm').reset();
    } catch (error) {
      alert(getAuthErrorMessage(error));
    }
    return;
  }
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await loginFunction(email, password);
    alert(`${role === 'vendor' ? 'Vendor' : 'Customer'} login successful.`);
  } catch (error) {
    alert(getAuthErrorMessage(error));
  }
}

async function handleSignup(event) {
  event.preventDefault();
  const password = document.getElementById('signupPassword').value;
  const confirmation = document.getElementById('confirmSignupPassword').value;
  if (password !== confirmation) {
    document.getElementById('confirmSignupPassword').setCustomValidity('Passwords do not match.');
    document.getElementById('confirmSignupPassword').reportValidity();
    return;
  }
  document.getElementById('confirmSignupPassword').setCustomValidity('');

  try {
    await signUpFunction(
      `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
      document.getElementById('signupEmail').value,
      password,
      { role: 'customer' }
    );
    alert('Customer account created successfully.');
    document.getElementById('customerSignupForm').reset();
  } catch (error) {
    alert(getAuthErrorMessage(error));
  }
}

function getAuthErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'An account already exists for this email.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.'
  };
  return messages[error.code] || 'Authentication failed. Please try again.';
}

window.switchRole = switchRole;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".review-card");

  // Optional subtle click interaction logging or animation logic
  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      console.log(`Review card ${index + 1} clicked`);
    });
  });
});
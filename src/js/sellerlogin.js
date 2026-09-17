import { getUserProfile, loginFunction } from "../../firebase.config.js";
const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

    togglePassword.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Toggle eye / eye-slash icon
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });

const email = document.querySelector("#email");
const password = document.querySelector("#password");
  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const user = await loginFunction(email.value, password.value);
      const profile = await getUserProfile(user.uid);
      if (profile?.role !== 'seller') {
        throw new Error('This account is not registered as a vendor.');
      }
      window.location.href = './admin-Dashboard.html';
    } catch (error) {
      alert(error.message || 'Login failed. Please check your email and password.');
    }
  });
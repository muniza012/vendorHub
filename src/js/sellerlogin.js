import { loginFunction } from "../../firebase.config.js";
const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('passwordInput');

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
      await loginFunction(email.value, password.value);
      alert('Login successful.');
    } catch (error) {
      alert('Login failed. Please check your email and password.');
    }
  });
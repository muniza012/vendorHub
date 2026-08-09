const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('passwordInput');

    togglePassword.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Toggle eye / eye-slash icon
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });

    // Form Submit Handler
    function handleLogin(event) {
      event.preventDefault();
      alert('Login submitted successfully!');
    }
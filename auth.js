'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const pageName = window.location.pathname.split('/').pop();

  if (pageName === 'signin.html') {
    initSignInForm();
  }

  if (pageName === 'signup.html') {
    initSignUpForm();
  }

  if (pageName === 'resetpassword.html') {
    initResetPasswordForm();
  }
});

function setButtonState(button, isLoading, loadingLabel, idleLabel) {
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingLabel : idleLabel;
}

function getApiClient() {
  if (!window.ProjexaAPI) {
    throw new Error('API client is not available.');
  }

  return window.ProjexaAPI;
}

function initSignInForm() {
  const form = document.querySelector('form');
  if (!form) return;

  const emailInput = form.querySelector('#email');
  const passwordInput = form.querySelector('#password');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const api = getApiClient();
    const originalLabel = submitButton ? submitButton.textContent : 'Sign In';
    setButtonState(submitButton, true, 'Signing in...', originalLabel);

    try {
      const response = await api.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: emailInput ? emailInput.value : '',
          password: passwordInput ? passwordInput.value : ''
        })
      });

      sessionStorage.setItem('projexa.user', JSON.stringify(response.user));
      if (response.token) {
        sessionStorage.setItem('projexa.token', response.token);
      }
      window.location.href = './dashboard.html';
    } catch (error) {
      window.alert(error.message);
      setButtonState(submitButton, false, 'Signing in...', originalLabel);
    }
  });
}

function initSignUpForm() {
  const form = document.querySelector('form');
  if (!form) return;

  const fullNameInput = form.querySelector('#fullName');
  const emailInput = form.querySelector('#email');
  const passwordInput = form.querySelector('#password');
  const termsInput = form.querySelector('#terms');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    if (termsInput && !termsInput.checked) {
      window.alert('You need to accept the terms before creating an account.');
      return;
    }

    const api = getApiClient();
    const originalLabel = submitButton ? submitButton.textContent : 'Create Account';
    setButtonState(submitButton, true, 'Creating account...', originalLabel);

    try {
      const response = await api.request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullNameInput ? fullNameInput.value : '',
          email: emailInput ? emailInput.value : '',
          password: passwordInput ? passwordInput.value : ''
        })
      });

      if (response.token) {
        sessionStorage.setItem('projexa.token', response.token);
      }
      window.alert(response.message || 'Account created successfully.');
      window.location.href = './signin.html';
    } catch (error) {
      window.alert(error.message);
      setButtonState(submitButton, false, 'Creating account...', originalLabel);
    }
  });
}

function initResetPasswordForm() {
  const form = document.querySelector('form');
  if (!form) return;

  const emailInput = form.querySelector('#email');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const api = getApiClient();
    const originalLabel = submitButton ? submitButton.textContent : 'Send Reset Link';
    setButtonState(submitButton, true, 'Sending...', originalLabel);

    try {
      const response = await api.request('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: emailInput ? emailInput.value : ''
        })
      });

      window.alert(response.message || 'Reset request sent.');
      form.reset();
    } catch (error) {
      window.alert(error.message);
    } finally {
      setButtonState(submitButton, false, 'Sending...', originalLabel);
    }
  });
}
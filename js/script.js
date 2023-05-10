const form = document.querySelector('#login-form');
const tokenInput = document.querySelector('#token');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = form.elements.email.value;
  const password = form.elements.password.value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (response.ok) {
    const { token } = await response.json();
    tokenInput.value = token;
    form.submit();
  } else {
    const { message } = await response.json();
    alert(message);
  }
});

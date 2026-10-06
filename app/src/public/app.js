// Confirm destructive form submissions (CSP forbids inline handlers).
document.addEventListener('submit', (e) => {
  const message = e.target.dataset?.confirm;
  if (message && !window.confirm(message)) e.preventDefault();
});

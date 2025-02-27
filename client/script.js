document.getElementById('login-btn').addEventListener('click', async () => {
    window.location.href = 'http://localhost:8080/auth/github';
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    const response = await fetch('http://localhost:8080/auth/logout', { method: 'POST', credentials: 'include' });
    const data = await response.json();
    alert(data.message);
});

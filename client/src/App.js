// src/App.js
import React from 'react';

function App() {
  // click login with Github button
  const handleLogin = () => {
    // should redirect to github login page
    window.location.href = 'http://localhost:8080/auth/github';
  };

  // click logout button
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        credentials: 'include' // allow bring cookie
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert('logout failed');
    }
  };

  return (
    <div>
      <h1>Github OAuth Login</h1>
      <button id="login-btn" onClick={handleLogin}>login with Github</button>
      <button id="logout-btn" onClick={handleLogout}>logout</button>
    </div>
  );
}

export default App;
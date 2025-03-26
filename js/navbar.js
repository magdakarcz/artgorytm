fetch('/artgorytm/components/navbar.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('navbar-container').innerHTML = data;
        initializeNavbar();
    })
    .catch(error => {
        console.error('Error loading navbar:', error);
        document.getElementById('navbar-container').innerHTML = '<p>Error loading navigation.</p>';
    });

function initializeNavbar() {
    const loginLogoutLink = document.getElementById('login-logout-link');
    const userInfo = document.getElementById('user-info');

    // Check if the user is logged in
    const username = sessionStorage.getItem('username');
    const isLoggedIn = username !== null;

    if (isLoggedIn) {
        // Display the user's name
        userInfo.textContent = `Witaj ${username}!`;
        userInfo.style.display = 'inline';

        // Change the link text to "Wyloguj"
        loginLogoutLink.textContent = 'WYLOGUJ';
        loginLogoutLink.href = '/artgorytm/php/logout.php'; // Point to logout.php

        // Add logout functionality
        loginLogoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            sessionStorage.removeItem('username'); // Clear sessionStorage
            window.location.href = '/artgorytm/php/logout.php'; // Redirect to logout.php
        });
    } else {
        // Hide the user info
        userInfo.style.display = 'none';

        // Change the link text to "Zaloguj się"
        loginLogoutLink.textContent = 'ZALOGUJ SIĘ';
        loginLogoutLink.href = '/artgorytm/html/login.html';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const menuItems = document.getElementById('menu-items');
  
    menuToggle.addEventListener('click', function () {
      menuItems.classList.toggle('menu-visible');
    });
  });
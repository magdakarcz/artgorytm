document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Hide error message initially
        errorMessage.style.display = 'none';

        // Basic validation
        if (!username || !password) {
            showError('Proszę wypełnić wszystkie pola.');
            return;
        }

        // Send data to the server using AJAX
        try {
            const response = await fetch('../php/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
            });

            // Check if the response is OK (status code 200-299)
            if (!response.ok) {
                throw new Error(`Błąd sieci: ${response.statusText}`);
            }

            // Parse the JSON response
            const result = await response.json();

            if (result.success) {
                // Store the username in sessionStorage
                sessionStorage.setItem('username', username);

                // Redirect to the editor page on successful login
                window.location.href = '../html/edytor.html';
            } else {
                // Display error message from the server
                showError(result.message || 'Nieprawidłowa nazwa użytkownika lub hasło.');
            }
        } catch (error) {
            console.error('Błąd podczas logowania:', error);
            showError('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
        }
    });

    // Function to display error messages
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});
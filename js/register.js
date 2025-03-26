document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Hide error message initially
        errorMessage.style.display = 'none';

        // Basic validation
        if (!username || !password || !confirmPassword) {
            showError('Proszę wypełnić wszystkie pola.');
            return;
        }

        if (password !== confirmPassword) {
            showError('Hasła nie są identyczne.');
            return;
        }

        // Send data to the server using AJAX
        try {
            const response = await fetch('../php/register.php', { // Update path if needed
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
                // Redirect to the login page on successful registration
                window.location.href = '../html/login.html';
            } else {
                // Display error message from the server
                showError(result.message || 'Wystąpił błąd podczas rejestracji.');
            }
        } catch (error) {
            console.error('Błąd podczas rejestracji:', error);
            showError('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
        }
    });

    // Function to display error messages
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});
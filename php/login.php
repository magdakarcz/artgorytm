<?php
session_start();
include '../database_connection.php';

$response = ['success' => false, 'message' => ''];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Basic validation
    if (empty($username) || empty($password)) {
        $response['message'] = "Proszę wypełnić wszystkie pola.";
    } else {
        // Escape inputs to prevent SQL injection
        $username = $conn->real_escape_string($username);

        // Query to fetch the user's hashed password
        $sql = "SELECT id_user, password FROM user WHERE username = '$username'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $hashedPassword = $row['password'];

            // Verify the password
            if (password_verify($password, $hashedPassword)) {
                // Login successful
                $_SESSION['username'] = $username;
                $_SESSION['user_id'] = $row['id_user']; // Store user_id in session
                $response['success'] = true;
                $response['message'] = "Logowanie pomyślne!";
            } else {
                // Login failed (incorrect password)
                $response['message'] = "Nieprawidłowa nazwa użytkownika lub hasło.";
            }
        } else {
            // User not found
            $response['message'] = "Nieprawidłowa nazwa użytkownika lub hasło.";
        }
    }
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>
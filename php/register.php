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

        // Hash the password for security
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Check if the username already exists
        $checkQuery = "SELECT id_user FROM user WHERE username = '$username'";
        $checkResult = $conn->query($checkQuery);

        if ($checkResult->num_rows > 0) {
            $response['message'] = "Nazwa użytkownika jest już zajęta.";
        } else {
            // Insert new user into the database
            $insertQuery = "INSERT INTO user (username, password) VALUES ('$username', '$hashedPassword')";
            if ($conn->query($insertQuery) === TRUE) {
                $response['success'] = true;
                $response['message'] = "Rejestracja pomyślna! Możesz się teraz zalogować.";
            } else {
                $response['message'] = "Wystąpił błąd podczas rejestracji: " . $conn->error;
            }
        }
    }
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>
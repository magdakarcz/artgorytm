<?php
session_start();
include '../database_connection.php';

$response = ['success' => false, 'message' => ''];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the user_id from the session (assuming it's stored during login)
    if (!isset($_SESSION['user_id'])) {
        $response['message'] = "Użytkownik nie jest zalogowany.";
        echo json_encode($response);
        exit;
    }

    $userId = $_SESSION['user_id'];
    $algorithmName = $_POST['algorithm_name'];
    $imageName = $_POST['image_name'];
    $description = $_POST['description'];
    $imageData = $_POST['image_data'];

    // Basic validation
    if (empty($userId) || empty($algorithmName) || empty($imageName) || empty($imageData)) {
        $response['message'] = "Proszę wypełnić wszystkie wymagane pola.";
    } else {
        // Escape inputs to prevent SQL injection
        $userId = $conn->real_escape_string($userId);
        $algorithmName = $conn->real_escape_string($algorithmName);
        $imageName = $conn->real_escape_string($imageName);
        $description = $conn->real_escape_string($description);
        $imageData = $conn->real_escape_string($imageData);

        // Insert into the database
        $sql = "INSERT INTO my_gallery (user_id, algorithm_name, image_name, description, image_data) 
                VALUES ('$userId', '$algorithmName', '$imageName', '$description', '$imageData')";

        if ($conn->query($sql) === TRUE) {
            $response['success'] = true;
            $response['message'] = "Obraz został pomyślnie udostępniony do galerii.";
        } else {
            $response['message'] = "Błąd: " . $sql . "<br>" . $conn->error;
        }
    }
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>
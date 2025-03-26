<?php
session_start();
include '../database_connection.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Prevent caching
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$response = ['success' => false, 'message' => '', 'images' => []];

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    $response['message'] = "Użytkownik nie jest zalogowany.";
    echo json_encode($response);
    exit;
}

$userId = $_SESSION['user_id'];

// Fetch images from the database
$sql = "SELECT image_name, description, image_data, algorithm_name, created_at FROM my_gallery WHERE user_id = ?";
$stmt = $conn->prepare($sql);

if ($stmt) {
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Format the creation date and time
            $createdAt = new DateTime($row['created_at']);
            $row['created_date'] = $createdAt->format('Y-m-d'); // Date
            $row['created_time'] = $createdAt->format('H:i:s'); // Time

            // Limit description to 200 characters
            if (strlen($row['description']) > 200) {
                $row['description'] = substr($row['description'], 0, 200) . '...';
            }

            $response['images'][] = $row;
        }
        $response['success'] = true;
    } else {
        $response['message'] = "Brak obrazów w galerii.";
    }

    $stmt->close();
} else {
    $response['message'] = "Błąd zapytania SQL: " . $conn->error;
}

$conn->close();

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>
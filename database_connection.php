<?php
$servername = "localhost";  // Database server (usually 'localhost')
$username = "root";         // Database username (default is 'root' for local development)
$password = "";             // Database password (default is empty for local development)
$dbname = "artgorytmdb";    // Name of your database

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Połączenie nieudane: " . $conn->connect_error);
}

// Set character encoding to utf8mb4
if (!$conn->set_charset("utf8mb4")) {
    die("Błąd ustawienia kodowania: " . $conn->error);
}
?>
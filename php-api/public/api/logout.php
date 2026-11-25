<?php
declare(strict_types=1);
// api/logout.php — like /api/logout: forget the session on the server and in the browser → 204
require __DIR__ . '/../../src/shop.php';

startSession();
$_SESSION = [];
session_destroy();
setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
http_response_code(204);

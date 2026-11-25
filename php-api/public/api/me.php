<?php
declare(strict_types=1);
// api/me.php — like GET /api/me: who is logged in with this cookie
require __DIR__ . '/../../src/shop.php';

startSession();
$user = currentUser();
$user === null ? sendJson(401, ['error' => 'login required']) : sendJson(200, $user);

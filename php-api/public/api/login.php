<?php
declare(strict_types=1);
// api/login.php — like POST /api/login in server.js: {username, password} as JSON → 200 {user} + a session cookie, or 401
require __DIR__ . '/../../src/shop.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') sendJson(405, ['error' => 'method not allowed', 'allow' => ['POST']], ['Allow' => 'POST']);
$body = jsonBody();                                                  // 415 / 400 like readJson() in server.js — broken JSON is not a wrong password
$username = (string) ($body['username'] ?? '');

$users = require __DIR__ . '/../../data/users.php';
$user = $users[$username] ?? null;
if ($user === null || !password_verify((string) ($body['password'] ?? ''), $user['hash'])) {
    sendJson(401, ['error' => 'wrong username or password']);       // the same words for both cases
}
startSession();
session_regenerate_id(true);                                         // a fresh id at login
$_SESSION['user'] = $username;
sendJson(200, ['user' => currentUser()]);

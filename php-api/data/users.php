<?php
// data/users.php — the shop's users with HASHED passwords (password_hash, bcrypt).
// The same logins as server/data/users.json, without keeping any password in plain text.
// A new hash:  php -r 'echo password_hash($argv[1], PASSWORD_DEFAULT), PHP_EOL;' 'the-password'
return [
    'siraj' => ['id' => 1, 'name' => 'سراج',   'role' => 'customer', 'hash' => '$2y$10$lycgkDmnQTFWjuBRMB6WsemDHee1iA6hgQBhNd/I7Vw5/10e65R8y'],
    'admin' => ['id' => 2, 'name' => 'المدير', 'role' => 'admin',    'hash' => '$2y$10$bDts8TfBzWNwIu9n0ZCXYe5y50HbsVFi0GF38B/FIG3e2eiJWdKiK'],
];

<?php
declare(strict_types=1);
// bin/lint.php — read the code without running it: syntax, strict_types, debug calls left behind
//   composer lint   (= php bin/lint.php src public bin)
$problems = 0;
foreach (array_slice($argv, 1) as $dir) {
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
    foreach ($files as $file) {
        if ($file->getExtension() !== 'php') continue;
        $path = $file->getPathname();
        exec(PHP_BINARY . ' -l ' . escapeshellarg($path) . ' 2>&1', $out, $code);
        if ($code !== 0) { echo "$path: syntax error\n"; $problems++; continue; }
        $source = file_get_contents($path);
        if (!str_contains($source, 'declare(strict_types=1)')) { echo "$path: no strict_types\n"; $problems++; }
        foreach (token_get_all($source) as $t) {
            if (is_array($t) && $t[0] === T_STRING && in_array($t[1], ['var_dump', 'print_r', 'dd'], true)) {
                echo "$path:{$t[2]} {$t[1]} left in the code\n"; $problems++;
            }
        }
    }
}
echo "problems: $problems\n";
exit($problems > 0 ? 1 : 0);

<?php
declare(strict_types=1);
namespace Shop;

/** one JSON file per cart in a folder — the cart id is the cookie, so only ids we made are ever a file name */
final class FileCartRepository implements CartRepository
{
    use ReadsJson;

    public function __construct(private readonly string $dir) {}

    public function has(string $cartId): bool
    {
        return self::validId($cartId) && is_file($this->file($cartId));
    }

    public function items(string $cartId): array
    {
        if (!$this->has($cartId)) return [];
        return array_column($this->readJson($this->file($cartId)), null, 'id');
    }

    public function save(string $cartId, array $items): void
    {
        if (!self::validId($cartId)) throw new \InvalidArgumentException('not a cart id');
        if (!is_dir($this->dir)) mkdir($this->dir, 0700, true);
        $tmp = $this->file($cartId) . '.' . getmypid() . '.tmp';
        file_put_contents($tmp, json_encode(array_values($items), JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
        rename($tmp, $this->file($cartId));                       // the whole cart or the old one, never half
    }

    /** a new random id in the shape randomUUID() gives in server.js */
    public static function newId(): string
    {
        $b = random_bytes(16);
        $b[6] = chr(ord($b[6]) & 0x0f | 0x40);                    // version 4
        $b[8] = chr(ord($b[8]) & 0x3f | 0x80);                    // variant
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
    }

    private static function validId(string $id): bool
    {
        return (bool) preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/', $id);
    }

    private function file(string $cartId): string
    {
        return "$this->dir/$cartId.json";
    }

    protected function what(): string { return 'cart'; }
}

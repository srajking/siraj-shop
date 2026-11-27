<?php
declare(strict_types=1);
namespace Shop;

/** the answer as a value: status, headers, body — nothing leaves until send(), so a test can look at it first */
final class Response
{
    public function __construct(
        public readonly int $status = 200,
        private array $headers = [],
        public readonly string $body = '',
    ) {}

    /** JSON as JSON.stringify writes it in server.js: Arabic and / as they are */
    public static function json(mixed $data, int $status = 200, array $headers = []): self
    {
        $body = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        return new self($status, ['Content-Type' => 'application/json; charset=utf-8'] + $headers, $body);
    }

    /** 204: no body and no Content-Type, like send(res, 204) in server.js */
    public static function noContent(array $headers = []): self
    {
        return new self(204, $headers);
    }

    public function withHeaders(array $headers): self
    {
        return new self($this->status, $headers + $this->headers, $this->body);
    }

    public function header(string $name): ?string
    {
        foreach ($this->headers as $key => $value) {
            if (strcasecmp($key, $name) === 0) return $value;
        }
        return null;
    }

    public function headers(): array { return $this->headers; }

    public function send(): never
    {
        if ($this->status === 204) ini_set('default_mimetype', '');   // PHP would add "text/html" by itself
        http_response_code($this->status);
        foreach ($this->headers as $name => $value) header("$name: $value");
        echo $this->body;
        exit;
    }
}

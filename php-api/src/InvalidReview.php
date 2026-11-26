<?php
declare(strict_types=1);
namespace Shop;

/** a review the customer sent wrong — which field, what to answer: a 422 in the same shape as server.js, not a bug */
final class InvalidReview extends ShopError
{
    private function __construct(
        public readonly string $field,     // the field that broke the rule
        private readonly string $key,      // the key server.js puts next to the error
        private readonly mixed $sent,      // what to show of what was sent
        string $rule,
    ) {
        parent::__construct($rule, 422);
    }

    public static function stars(mixed $sent): self { return new self('stars', 'stars', $sent, 'stars must be 1 to 5'); }
    public static function name(?string $sent): self { return new self('name', 'name', $sent, 'name must be 1 to 40 letters'); }
    public static function text(?int $length): self { return new self('text', 'length', $length, 'text must be 2 to 500 letters'); }

    /** the 422 body: ['error' => the rule, key => what was sent] */
    public function toArray(): array
    {
        return ['error' => $this->getMessage(), $this->key => $this->sent];
    }
}

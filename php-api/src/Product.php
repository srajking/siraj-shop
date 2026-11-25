<?php
declare(strict_types=1);
namespace Shop;

/** one product of the shop: the fields of server/data/products.json, each with its type and its rules — fixed once built */
class Product
{
    public function __construct(
        public readonly int $id,
        public readonly string $name,
        public readonly int $price,
        public readonly int $stock,
        public readonly string $category,
    ) {
        // the rules every product keeps for its whole life — checked once, here, so no page has to
        if ($id < 1) throw new \InvalidArgumentException("product id must be 1 or more, got $id");
        if (trim($name) === '') throw new \InvalidArgumentException("product $id: name is empty");
        if ($price < 1) throw new \InvalidArgumentException("product $id: price must be more than 0, got $price");
        if ($stock < 0) throw new \InvalidArgumentException("product $id: stock cannot be negative, got $stock");
    }

    /** the shape the API sends: the same keys, in the same order, as the JSON file */
    public function toArray(): array
    {
        return ['id' => $this->id, 'name' => $this->name, 'price' => $this->price, 'stock' => $this->stock, 'category' => $this->category];
    }
}

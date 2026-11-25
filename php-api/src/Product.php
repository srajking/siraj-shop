<?php
declare(strict_types=1);
namespace Shop;

/** one product of the shop: the fields of server/data/products.json, each with its type */
class Product
{
    public int $id;
    public string $name;
    public int $price;
    public int $stock;
    public string $category;

    /** the shape the API sends: the same keys, in the same order, as the JSON file */
    public function toArray(): array
    {
        return ['id' => $this->id, 'name' => $this->name, 'price' => $this->price, 'stock' => $this->stock, 'category' => $this->category];
    }
}

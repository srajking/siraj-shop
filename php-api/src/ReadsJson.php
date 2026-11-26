<?php
declare(strict_types=1);
namespace Shop;

/** reading one of the shop's JSON files — written once, used by every class that reads one */
trait ReadsJson
{
    /** the file's name in messages: "reviews", "products" */
    abstract protected function what(): string;

    protected function readJson(string $file): array
    {
        if (!is_file($file)) throw new StoreError("the {$this->what()} file is missing: $file");
        try {
            return json_decode(file_get_contents($file), true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            throw new StoreError("the {$this->what()} file is broken", previous: $e);   // say what broke, keep the cause
        }
    }
}

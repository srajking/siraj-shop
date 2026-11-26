<?php
declare(strict_types=1);
namespace Shop;

/** the shop's products, keyed by id — it HAS a ProductFile (given, not made) and reads it on first use */
final class Catalog
{
    private ?array $byId = null;

    public function __construct(private readonly ProductFile $file) {}

    /** every row goes through Product first, so the rest of the code only ever sees checked data */
    public function all(): array
    {
        return $this->byId ??= array_column(array_map(
            fn (array $row): array => \productFrom($row)->toArray(),
            $this->file->rows(),
        ), null, 'id');
    }

    public function find(int $id): ?array
    {
        return $this->all()[$id] ?? null;
    }
}

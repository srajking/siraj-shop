<?php
declare(strict_types=1);
namespace Shop;

/** the categories the shop sells — the only values products.json may use */
enum Category: string
{
    case Stationery = 'stationery';
    case Bags = 'bags';
}

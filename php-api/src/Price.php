<?php
declare(strict_types=1);
namespace Shop;

/** money in the shop: whole dinars, one currency, and the discount rule of server.js — in one place */
class Price
{
    public const CURRENCY = 'IQD';
    public const DISCOUNT_LIMIT = 10000;   // server.js: DISCOUNT.LIMIT
    public const DISCOUNT_RATE = 0.9;      // server.js: DISCOUNT.RATE

    /** 19000 → "19,000 IQD" — like toLocaleString("en") on the Next site */
    public static function text(int $price): string
    {
        return number_format($price) . ' ' . self::CURRENCY;
    }

    /** 10% off from 10,000 IQD, rounded to a whole dinar */
    public static function discounted(int $subtotal): int
    {
        return $subtotal >= self::DISCOUNT_LIMIT ? (int) round($subtotal * self::DISCOUNT_RATE) : $subtotal;
    }
}

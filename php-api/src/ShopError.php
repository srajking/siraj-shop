<?php
declare(strict_types=1);
namespace Shop;

/** every error the shop itself raises — never thrown as is, only as one of its children */
abstract class ShopError extends \RuntimeException {}

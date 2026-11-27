<?php
declare(strict_types=1);
namespace Shop\Tests;

use Shop\Request;

final class RequestTest extends TestCase
{
    public function testIntTakesOnlyWholeNumbersFromOne(): void
    {
        $got = array_map(fn ($typed) => (new Request('GET', '/', ['id' => $typed]))->int('id'), ['3', '03', '3abc', '-1', '0', ['1']]);
        $this->assertSame([3, null, null, null, null, null], $got);
    }

    public function testQueryArrayCountsAsMissing(): void
    {
        $req = new Request('GET', '/api/products', ['sort' => ['price'], 'q' => 'دفتر']);
        $this->assertSame(['-', 'دفتر'], [$req->query('sort', '-'), $req->query('q')]);
    }

    public function testHeaderNamesIgnoreCase(): void
    {
        $req = new Request('POST', '/api/login', [], ['content-type' => 'application/json']);
        $this->assertSame('application/json', $req->header('Content-Type'));
    }
}

<?php
declare(strict_types=1);
namespace Shop\Tests;

use Shop\Response;

final class ResponseTest extends TestCase
{
    public function testJsonLikeNode(): void
    {
        $res = Response::json(['name' => 'دفتر A5', 'url' => '/products/1'], 201, ['Location' => '/api/products/1']);
        $this->assertSame([201, '{"name":"دفتر A5","url":"/products/1"}', 'application/json; charset=utf-8', '/api/products/1'],
            [$res->status, $res->body, $res->header('content-type'), $res->header('Location')]);
    }

    public function testNoContentHasNoBodyAndNoType(): void
    {
        $res = Response::noContent(['Allow' => 'GET']);
        $this->assertSame([204, '', null, 'GET'], [$res->status, $res->body, $res->header('Content-Type'), $res->header('Allow')]);
    }

    public function testWithHeadersLeavesTheOriginal(): void
    {
        $res = Response::json([]);
        $res->withHeaders(['ETag' => '"x"']);
        $this->assertSame(null, $res->header('ETag'));
    }
}

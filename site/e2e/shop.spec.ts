import { test, expect } from "@playwright/test";

// one test for each promise the earlier chapters made — if one breaks, we hear about it
test("a missing product is a real 404 (chapter 12)", async ({ page }) => {
  expect((await page.goto("/products/99"))?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("We could not find that page");
});

test("a stranger sees a login link, not the review form (chapter 13)", async ({ page }) => {
  await page.goto("/products/3");
  await expect(page.getByText("to write a review")).toBeVisible();
  await expect(page.getByPlaceholder("Your review")).toHaveCount(0);
});

test("the cart follows you and survives a reload (chapter 14)", async ({ page }) => {
  await page.goto("/products/3");
  await page.getByRole("button", { name: /Add to cart/ }).click();
  await page.getByRole("button", { name: /Add to cart/ }).click();
  await page.locator("main ul a").first().click();
  await expect(page.locator(".cart-count")).toHaveText("Cart (2)");
  await page.reload();
  await expect(page.locator(".cart-count")).toHaveText("Cart (2)");
});

test("each product has its own title (chapter 15)", async ({ page }) => {
  await page.goto("/products/3");
  await expect(page).toHaveTitle("حقيبة ظهر · Siraj Shop");
});

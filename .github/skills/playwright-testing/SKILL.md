---
name: playwright-testing
description: Generer og kjør Playwright E2E-tester for webapplikasjoner med page objects, auth fixtures og tilgjengelighetstester
license: MIT
compatibility: Node.js with Playwright
metadata:
  domain: testing
  tags: playwright e2e testing accessibility responsive
---

# Playwright E2E Testing Skill

Generate Playwright tests for Nav web applications. Covers page object pattern, authentication fixtures, accessibility testing, and CI configuration.

## Existing project setup

- Start with [the E2E guide](../../../e2e/README.md), the existing [Playwright config](../../../playwright.config.ts), and a nearby spec in `e2e/tests/`.
- Reuse the project’s MSW handlers, fixtures, and test helpers. The existing config starts the frontend with `yarn start:e2e`.
- Use `yarn test:pw e2e/tests/<file>.spec.ts` for a focused run or `yarn test:pw` for the suite. If Chromium is missing, follow the install command in the E2E guide.
- Use the examples below as references when they fit the task. Follow existing specs for project structure and auth setup.

## Page Object Pattern

```typescript
// e2e/pages/oversikt.page.ts
import { type Locator, type Page, expect } from "@playwright/test";

export class OversiktPage {
  readonly heading: Locator;
  readonly searchField: Locator;
  readonly table: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole("heading", { name: /oversikt/i });
    this.searchField = page.getByRole("searchbox", { name: /søk/i });
    this.table = page.getByRole("table");
  }

  async goto() {
    await this.page.goto("/oversikt");
    await expect(this.heading).toBeVisible();
  }

  async search(query: string) {
    await this.searchField.fill(query);
    await this.searchField.press("Enter");
  }

  async expectRowCount(count: number) {
    const rows = this.table.getByRole("row");
    // Minus header row
    await expect(rows).toHaveCount(count + 1);
  }
}
```

## Auth Fixture (Azure AD / MockOAuth2Server)

```typescript
// e2e/fixtures/auth.ts
import { test as base } from "@playwright/test";

type AuthFixtures = {
  authenticatedPage: ReturnType<typeof base["page"]>;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page, context }, use) => {
    // Set auth cookie for test environment
    await context.addCookies([
      {
        name: "selvbetjening-idtoken",
        value: process.env.TEST_TOKEN ?? "test-token",
        domain: "localhost",
        path: "/",
      },
    ]);
    await use(page);
  },
});

export { expect } from "@playwright/test";
```

## Test Examples

### Page Navigation

```typescript
// e2e/tests/navigation.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate to oversikt page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /oversikt/i }).click();
    await expect(page).toHaveURL(/\/oversikt/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should show 404 for unknown routes", async ({ page }) => {
    const response = await page.goto("/ukjent-side");
    expect(response?.status()).toBe(404);
  });
});
```

### Form

```typescript
// e2e/tests/form.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Søknadsskjema", () => {
  test("should submit form successfully", async ({ page }) => {
    await page.goto("/soknad");

    await page.getByLabel("Navn").fill("Ola Nordmann");
    await page.getByLabel("E-post").fill("ola@nav.no");
    await page.getByRole("combobox", { name: /tema/i }).selectOption("dagpenger");
    await page.getByRole("button", { name: /send inn/i }).click();

    await expect(page.getByRole("alert")).toContainText("Sendt");
  });

  test("should show validation errors", async ({ page }) => {
    await page.goto("/soknad");
    await page.getByRole("button", { name: /send inn/i }).click();

    await expect(page.getByText("Navn er påkrevd")).toBeVisible();
    await expect(page.getByText("E-post er påkrevd")).toBeVisible();
  });
});
```

### Responsive Design

```typescript
// e2e/tests/responsive.spec.ts
import { test, expect, devices } from "@playwright/test";

test.describe("Responsive", () => {
  test("should show mobile menu on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(page.getByRole("button", { name: /meny/i })).toBeVisible();
    await expect(page.getByRole("navigation")).not.toBeVisible();

    await page.getByRole("button", { name: /meny/i }).click();
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("should show full navigation on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    await expect(page.getByRole("navigation")).toBeVisible();
  });
});
```

## Accessibility Testing med axe

```typescript
// e2e/tests/accessibility.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  const pages = ["/", "/oversikt", "/usage"];

  for (const path of pages) {
    test(`${path} should have no a11y violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
});
```

## CI

The existing [PR workflow](../../workflows/valid-pull-request.yml) runs the Playwright suite. Use the E2E guide for the report and failure artifacts.

## Locator Strategies

Prioritized order for finding elements:

```typescript
// 1. ✅ Role-based (best)
page.getByRole("button", { name: /send inn/i });
page.getByRole("heading", { level: 1 });
page.getByRole("link", { name: /oversikt/i });

// 2. ✅ Label-based (for form elements)
page.getByLabel("Fødselsnummer");
page.getByPlaceholder("Søk...");

// 3. ✅ Text-based (for static content)
page.getByText("Ingen resultater");

// 4. ⚠️ Test ID (only when role/label doesn't work)
page.getByTestId("metrics-chart");

// 5. ❌ CSS selectors (avoid)
page.locator(".my-class");
page.locator("#my-id");
```

## Tips

- **Implicit waiting**: Playwright waits automatically for elements — avoid `page.waitForTimeout()`
- **Isolate tests**: Each test should be able to run independently
- **Use `test.describe`** to group related tests
- **Parallel tests**: Keep tests independent so `fullyParallel: true` works
- **Screenshots**: Automatic on failure — check the `test-results/` directory

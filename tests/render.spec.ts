import { expect, test } from "@playwright/test";

test('has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Econ Tutor ChatBot/);
});

test('renders chat entrypoint', async ({ page }) => {
    await page.goto('/section/1-2-microeconomics-and-macroeconomics');
    await page.waitForSelector('.hydrated')
    await page.getByRole('button', { name: 'Practice with Staxly' }).click()
    await expect(page.getByText('Ask Staxly')).toBeVisible();
    // await expect(page.getByText('Hello, I’m Staxly.  Would you like to know more about Microeconomics and Macroeconomics Economics? I can also answer any other questions about economics')).toBeVisible();
});

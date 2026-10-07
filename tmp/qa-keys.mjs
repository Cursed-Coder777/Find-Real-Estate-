// Capture raw console args of React key warnings (component stack is in later args).
import { launch } from "../scripts/lib/browser.mjs";

const { browser, page } = await launch({ width: 1440, height: 900 });
const warnings = [];
page.on("console", (msg) => {
  if (msg.type() !== "warning" && msg.type() !== "error") return;
  if (!/unique "key" prop/i.test(msg.text()))
    return;
  const args = msg.args();
  Promise.all(
    args.map(async (a) => {
      try {
        return await a.evaluate((v) => (typeof v === "string" ? v : JSON.stringify(v)));
      } catch {
        return "<unserializable>";
      }
    }),
  ).then((parts) => warnings.push(parts.join("\n")));
});
await page.goto("http://localhost:3001/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);
await page.waitForTimeout(500);
console.log(warnings.join("\n\n-----\n\n") || "(no key warnings)");
await browser.close();

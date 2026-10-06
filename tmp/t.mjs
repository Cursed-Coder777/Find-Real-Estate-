import fs from "node:fs";
import { htmlToJsx } from "../scripts/port-dom.mjs";
const html = fs.readFileSync("docs/research/www-findrealestate-com-715c1bfa/root-8a5edab2/sections/01-why-us_root__aGsFp.html","utf8");
console.log(htmlToJsx(html));

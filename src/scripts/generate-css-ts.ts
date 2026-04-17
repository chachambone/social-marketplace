import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cssPath = path.join(process.cwd(), 'public', 'css', 'output.css');
const outputPath = path.join(process.cwd(), 'public', 'js', 'styles.ts');

const cssContent = fs.readFileSync(cssPath, 'utf-8');

const tsContent = `// Auto-generated from CSS. Do not edit manually.
export const tailwindCSS = \`${cssContent.replace(/`/g, '\\`')}\`;
`;

fs.writeFileSync(outputPath, tsContent);
console.log('✅ Generated styles.ts from CSS');
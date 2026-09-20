const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'http://localhost:3001/v1';
const filePath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

fs.writeFileSync(
  filePath,
  `export const environment = {\n  production: true,\n  apiUrl: '${apiUrl}'\n};\n`,
);

console.log(`environment.prod.ts generado con apiUrl = ${apiUrl}`);

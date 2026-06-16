const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'environments');
const file = path.join(dir, 'environment.ts');

const content = `export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL || ""}',
  supabaseKey: '${process.env.SUPABASE_KEY || ""}'
};
`;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(file, content);
console.log('environment.ts generated successfully for build.');

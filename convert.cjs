const fs = require('fs');
const path = require('path');

// 1. Rewrite lib/utils.js
fs.writeFileSync('src/lib/utils.js', `import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
`);
if (fs.existsSync('src/lib/utils.ts')) fs.unlinkSync('src/lib/utils.ts');

// 2. Rewrite main.jsx
let mainContent = fs.readFileSync('src/main.tsx', 'utf8');
mainContent = mainContent.replace('App.tsx', 'App.jsx').replace("document.getElementById('root')!", "document.getElementById('root')");
fs.writeFileSync('src/main.jsx', mainContent);
fs.unlinkSync('src/main.tsx');

// 3. Rename App.tsx -> App.jsx
fs.renameSync('src/App.tsx', 'src/App.jsx');

// 4. components/layout/DashboardLayout.jsx
let dlContent = fs.readFileSync('src/components/layout/DashboardLayout.tsx', 'utf8');
dlContent = dlContent.replace('{ children }: { children: React.ReactNode }', '{ children }');
fs.writeFileSync('src/components/layout/DashboardLayout.jsx', dlContent);
fs.unlinkSync('src/components/layout/DashboardLayout.tsx');

// 5. components/layout/AppSidebar.jsx
fs.renameSync('src/components/layout/AppSidebar.tsx', 'src/components/layout/AppSidebar.jsx');

// 6. components/dashboard/KpiCard.jsx
let kpiContent = fs.readFileSync('src/components/dashboard/KpiCard.tsx', 'utf8');
kpiContent = kpiContent.replace(/interface KpiCardProps {[\s\S]*?}\n\n/, '');
kpiContent = kpiContent.replace('({ title, value, change, icon: Icon, trend }: KpiCardProps)', '({ title, value, change, icon: Icon, trend })');
kpiContent = kpiContent.replace("import { LucideIcon } from 'lucide-react';\n", "");
fs.writeFileSync('src/components/dashboard/KpiCard.jsx', kpiContent);
fs.unlinkSync('src/components/dashboard/KpiCard.tsx');

// 7. Other dashboard components
['OccupancyChart', 'ResidentsTable', 'NoticesWidget'].forEach(name => {
  fs.renameSync(`src/components/dashboard/${name}.tsx`, `src/components/dashboard/${name}.jsx`);
});

// 8. Update components.json to tsx: false
let compJson = JSON.parse(fs.readFileSync('components.json', 'utf8'));
compJson.tsx = false;
fs.writeFileSync('components.json', JSON.stringify(compJson, null, 2));

// 9. Update vite.config.ts -> .js
fs.renameSync('vite.config.ts', 'vite.config.js');

// 10. Update index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('src="/src/main.tsx"', 'src="/src/main.jsx"');
fs.writeFileSync('index.html', html);

// 11. Create jsconfig.json
fs.writeFileSync('jsconfig.json', JSON.stringify({ compilerOptions: { baseUrl: '.', paths: { '@/*': ['./src/*'] } } }, null, 2));

// 12. Delete tsconfig files
['tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'src/vite-env.d.ts'].forEach(f => {
  if (fs.existsSync(f)) fs.unlinkSync(f);
});

// 13. Update package.json build script
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.build = 'vite build';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

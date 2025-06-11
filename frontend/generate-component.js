const fs = require("fs");
const path = require("path");

const componentName = process.argv[2];
if (!componentName) {
  console.error("❌ Please provide a component name.");
  process.exit(1);
}

const componentDir = path.join("src", "components", componentName);
const jsxFile = path.join(componentDir, `${componentName}.jsx`);
const cssFile = path.join(componentDir, `${componentName}.css`);

if (fs.existsSync(componentDir)) {
  console.error("❌ Component already exists.");
  process.exit(1);
}

fs.mkdirSync(componentDir, { recursive: true });

fs.writeFileSync(jsxFile, `import React from 'react';\nimport './${componentName}.css';\n\nconst ${componentName} = () => {\n  return <div className="${componentName.toLowerCase()}">Hello ${componentName}</div>;\n};\n\nexport default ${componentName};\n`);
fs.writeFileSync(cssFile, `.${componentName.toLowerCase()} {\n  /* Styles for ${componentName} */\n}\n`);

console.log(`✅ Component '${componentName}' created at src/components/${componentName}`);

# 项目配置

## 脚手架工具（推荐）

URL: [PassionFruitAXE/vite-template-react (github.com)](https://github.com/PassionFruitAXE/vite-template-react)

## 依赖

```json
{
  	"@vitejs/plugin-legacy": "^2.0.0",
    "@vitejs/plugin-react": "^2.0.0",
    "eslint": "8.20.0",
    "eslint-config-prettier": "8.5.0",
    "eslint-plugin-prettier": "4.2.1",
    "eslint-plugin-react": "7.30.1",
    "prettier": "2.7.1",
    "stylelint": "^14.9.1",
    "stylelint-config-prettier": "^9.0.3",
    "stylelint-config-recess-order": "^3.0.0",
    "stylelint-config-standard": "^26.0.0",
    "stylelint-prettier": "^2.0.0",
    "terser": "^5.14.2",
    "typescript": "4.7.4",
    "vite": "^3.0.2",
    "vite-plugin-eslint": "^1.7.0",
    "vite-plugin-mkcert": "1.9.0",
    "vite-tsconfig-paths": "3.5.0"
}
```



## vite.config.ts

```ts
import type { UserConfigFn, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import viteEslint from "vite-plugin-eslint";
import viteStylelint from "@amatlash/vite-plugin-stylelint";
import tsconfigPaths from "vite-tsconfig-paths";
import mkcert from "vite-plugin-mkcert";

const defineConfig: UserConfigFn = ({ command, mode }) => {
  const config: UserConfig = {
    server: {
      https: true,
    },
    plugins: [
      react(),
      tsconfigPaths(),
      legacy(),
      viteEslint(),
      viteStylelint({
        // 对某些文件排除检查
        exclude: /windicss|node_modules/,
      }),
      mkcert({
        source: "coding",
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react"],
            "react-dom": ["react-dom"],
          },
        },
      },
    },
  };
  return config;
};

export default defineConfig;
```



## .eslintrc

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:prettier/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint", "react", "prettier"],
  "rules": {
    "@typescript-eslint/ban-ts-comment": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  },
  "env": {
    "browser": true,
    "node": true
  },
  "settings": {
    "react": {
      "version": "18.0.0"
    }
  }
}
```



## .prettierrc

```json
{
  "trailingComma": "es5",
  "printWidth": 80,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": false,
  "jsxSingleQuote": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid"
}
```

## .stylelintrc

```json
{
  "plugins": ["stylelint-prettier"],
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-recess-order",
    "stylelint-config-prettier",
    "stylelint-prettier/recommended"
  ],
  "rules": {
    "prettier/prettier": true
  }
}
```


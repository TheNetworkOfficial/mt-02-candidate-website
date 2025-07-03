import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    ignores: ["frontend/dist/**"],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
];

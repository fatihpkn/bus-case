import { defineConfig } from 'i18next-cli'

export default defineConfig({
  locales: ['tr', 'en'],
  types: {
    input: ['public/locales/tr/*.json'],
    output: 'src/i18n/types/i18next.d.ts',
    resourcesFile: 'src/i18n/types/resources.d.ts',
    enableSelector: false,
  },
  extract: {
    input: 'src/**/*.{js,jsx,ts,tsx}',
    output: 'public/locales/{{language}}/{{namespace}}.json',
    functions: ['t', 'dynamicKey'],
  },
})

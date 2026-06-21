import { defineConfig } from 'orval';

export default defineConfig({
  bistroApi: {
    input: {
      target: 'http://localhost:3000/openapi.json',
    },
    output: {
      target: './src/api/generated',
      schemas: './src/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      mode: 'tags-split',
      clean: true,
      override: {
        mutator: {
          path: './src/api/mutator.ts',
          name: 'customInstance',
        },
      },
    },
  },
});

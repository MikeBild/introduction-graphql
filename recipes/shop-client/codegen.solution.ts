import type { CodegenConfig } from '@graphql-codegen/cli'

// Reads the schema of the server recipe and every graphql() document in solution/,
// and writes typed documents to solution/gql/. Never edit the generated files.
const config: CodegenConfig = {
  schema: '../shop-server/src/schema.graphql',
  documents: ['solution/**/*.tsx'],
  ignoreNoDocuments: true,
  generates: {
    'solution/gql/': {
      preset: 'client',
      presetConfig: { fragmentMasking: { unmaskFunctionName: 'useFragment' } },
      config: { useTypeImports: true, enumsAsTypes: true },
    },
  },
}

export default config

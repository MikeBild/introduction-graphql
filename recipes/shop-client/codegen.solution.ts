import type { CodegenConfig } from '@graphql-codegen/cli'

// Reads the schema of the server recipe and every gql document in solution/ and writes
// the result and variable types of each operation and fragment. Never edit the output.
const config: CodegenConfig = {
  schema: '../shop-server/src/schema.graphql',
  documents: ['solution/**/*.tsx'],
  generates: {
    'solution/__generated__/graphql.ts': {
      plugins: ['typescript-operations'],
      config: {
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
        useTypeImports: true,
        enumsAsTypes: true,
      },
    },
  },
}

export default config

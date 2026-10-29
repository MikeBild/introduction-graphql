# Authentication and Authorization

An order API (`src/app.ts`) without any checks: whoever asks sees every order and every email address. `src/data.ts` already has users, roles and `verifyToken(authorization)` – a stand-in for JWT or session verification.

| Token (`authorization: Bearer …`) | User  | Role       |
| --------------------------------- | ----- | ---------- |
| `token-ada`                       | `c-1` | `CUSTOMER` |
| `token-grace`                     | `c-2` | `CUSTOMER` |
| `token-support`                   | `u-1` | `SUPPORT`  |

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql, header "authorization: Bearer token-ada"
```

## Exercise

1. Run `npm test` and read `src/auth.test.ts`: what does an anonymous client get today?
2. Authentication: build the request context in `expressMiddleware(server, { context: async ({ req }) => ({ user: await verifyToken(req.headers.authorization ?? null) }) })`. No token means `user: null`, not an error.
3. Authorization in the business logic: write `requireUser`, `canSeeOrder` and `canSeeContactData` in `src/policies.ts` and call them from the resolvers. Return `UNAUTHENTICATED` and `FORBIDDEN` as `extensions.code`.
4. Allow `Customer.email` only for the role `SUPPORT`, as a field resolver – so the rule also holds on the nested path `order → customer → email`.
5. Prove it with tests: anonymous → `UNAUTHENTICATED`, a customer sees only their own orders and no email, a foreign order looks like a missing one, `customers` is `FORBIDDEN` for customers.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.

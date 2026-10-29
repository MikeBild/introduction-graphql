# Authentication, access tokens and authorization

An order API (`src/app.ts`) without any checks: whoever asks sees every order and every email address. `src/data.ts` already has users with roles and `verifyToken(authorization)` – a stand-in that maps fixed tokens to users. Part 2 replaces it with real access tokens.

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

## Part 1: Context and authorization

1. Run `npm test` and read `src/auth.test.ts`: what does an anonymous client get today?
2. Authentication: build the request context in `expressMiddleware(server, { context: async ({ req }) => ({ user: await verifyToken(req.headers.authorization ?? null) }) })`. No token means `user: null`, not an error.
3. Authorization in the business logic: write `requireUser`, `canSeeOrder` and `canSeeContactData` in `src/policies.ts` and call them from the resolvers. Return `UNAUTHENTICATED` and `FORBIDDEN` as `extensions.code`.
4. Allow `Customer.email` only for the role `SUPPORT`, as a field resolver – so the rule also holds on the nested path `order → customer → email`.
5. Prove it with tests: anonymous → `UNAUTHENTICATED`, a customer sees only their own orders and no email, a foreign order looks like a missing one, `customers` is `FORBIDDEN` for customers.

## Part 2: Access tokens with OAuth 2.0 / OpenID Connect

In production the browser logs in at an identity provider (Authorization Code Flow with PKCE) and sends the access token with every request. The API only checks it. `src/dev-issuer.ts` stands in for the identity provider: `startDevIssuer()` serves its public key at `/.well-known/jwks.json` and signs RS256 tokens with `sub`, `roles`, issuer and audience `shop-api`.

1. Write `createVerifyToken({ issuer, audience })` with `jose`: `createRemoteJWKSet(new URL(issuer + "/.well-known/jwks.json"))` and `jwtVerify(token, jwks, { issuer, audience })`. Map `sub` and the `roles` claim to the user; anything invalid means `null`.
2. Pass it to the context instead of the stand-in – the policies from part 1 stay untouched.
3. Prove it with tests: a valid token sees its own orders, the `SUPPORT` role comes from the claim; wrong audience, wrong issuer, expired token and a key that is not in the JWKS all end as `UNAUTHENTICATED`.
4. Client: send the token from Apollo Client with a `SetContextLink` (`@apollo/client/link/context`) in front of the `HttpLink`, and test that the client sees only its own orders.
5. Discuss: why does the API never see the user's password? Why should the access token be short-lived, and where does the browser keep it?

`npm run start:solution` starts the API with the dev issuer on port 4001 and prints two tokens to paste into Apollo Sandbox.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.

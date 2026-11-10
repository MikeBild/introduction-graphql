*[English](README.md) · Deutsch*

# Übungen: GraphQL

Übungs-Repo zum Workshop „GraphQL vom Schema bis zur Produktion“. Die 24 Übungen folgen dem Workshop von einfach nach schwer, jede mit Startpunkt (`src/`), Tests und Lösung (`solution/`). Alle Übungen spielen im Werkstatt-Shop mit Produkten, Kunden und Bestellungen – Server mit Apollo Server 5 auf Express 5, Clients mit Apollo Client 4, Tests mit Vitest.

## Was du lernst

- Ein Schema in SDL entwerfen, Resolver schreiben und mit Apollo Server 5 auf Express 5 ausliefern – geprüft über HTTP mit Vitest
- Clients mit Apollo Client 4 bauen: Operations mit Variables und Fragments, Pagination mit Connections, Optimistic UI mit dem normalisierten Cache
- Den Graph in die Produktion bringen: DataLoader und Context pro Request, Authentication und Authorization, Errors as Data, Subscriptions, Federation, Query Cost Limits, Response Caching, Schema Evolution und Tracing

## Voraussetzungen

- **Node.js 26** oder neuer – die Übungen führen TypeScript direkt mit `node src/server.ts` aus, ohne Build-Schritt (`engines` in jeder `package.json`). Die Übung `fast-reads` braucht Node.js 26.11 für `node:sqlite`.
- Ein Editor mit TypeScript-Support, zum Beispiel VS Code
- Ein Browser für Apollo Sandbox unter http://localhost:4000/graphql, dazu `curl` für Anfragen von der Kommandozeile
- Grundkenntnisse in TypeScript und Node.js, für die Client-Übungen auch React. Zum Auffrischen: [introduction-nodejs](https://github.com/MikeBild/introduction-nodejs) und [introduction-react](https://github.com/MikeBild/introduction-react)

## Einrichten

```bash
git clone https://github.com/MikeBild/introduction-graphql.git
cd introduction-graphql/recipes/shop-server
npm install
npm test             # Vitest
npm run typecheck    # TypeScript strict
npm start            # Apollo Sandbox auf http://localhost:4000/graphql
```

Es gibt kein gemeinsames `package.json` und kein Prüfscript für alle Übungen: Jede Übung unter `recipes/` ist ein eigenes npm-Projekt mit eigener `package-lock.json`.

## So arbeitest du mit einer Übung

Installiere die Abhängigkeiten im Ordner der Übung, nicht im Hauptverzeichnis:

```text
recipes/
  dataloader/
    README.md              Startpunkt, Aufgabe in Schritten, Lösung
    package.json           Scripts: start, start:solution, test, test:watch, typecheck, format
    src/                   dein Startpunkt
      app.ts               Schema, Resolver und Express-App
      server.ts            startet die App auf Port 4000 (PORT überschreibt)
      db.ts                Beispieldaten des Werkstatt-Shops
      test-client.ts       startet die App für die Tests auf einem freien Port
      dataloader.test.ts   Tests mit Vitest über echte HTTP-Requests
    solution/              eine mögliche Lösung, gleiche Struktur
```

1. Lies das `README.md` der Übung. Es beschreibt den Startpunkt und seine Schwächen, dann die Aufgabe in nummerierten Schritten.
2. Starte mit `npm test`. Die Tests in `src/` dokumentieren das Problem: Manche schlagen fehl, manche sind grün aus dem falschen Grund. Arbeite die Schritte in `src/` ab, bis `npm test` und `npm run typecheck` grün sind und die Tests den richtigen Grund prüfen.
3. Vergleiche danach mit `solution/`; `npm run start:solution` startet die Lösung.

```bash
cd recipes/dataloader
npm install
npm start               # Startpunkt mit Apollo Sandbox auf http://localhost:4000/graphql
npm test                # Vitest einmal
npm run test:watch      # Vitest im Watch Mode
npm run typecheck       # TypeScript strict
npm run start:solution  # die Lösung
```

Einige Übungen bringen eigene Scripts oder einen zweiten Prozess mit:

| Übung | Besonderheit |
| --- | --- |
| `shop-client` | Vite-Projekt: `npm start` öffnet http://localhost:5173 und leitet `/graphql` an Port 4000 weiter. Starte vorher `shop-server` in einem zweiten Terminal (`npm run start:solution`). `npm run codegen` erzeugt die Typen der Operations. |
| `fast-reads` | `npm run seed` schreibt `shop.db` mit 50.000 Bestellungen, `npm run load -- offset 0` misst Zugriffe und Latenz. |
| `schema-evolution` | `npm run schema:diff` vergleicht `schema/production.graphql` mit `schema/current.graphql` und bricht bei Breaking Changes ab. |
| `query-cost-limits` | `npm run manifest` baut `persisted-documents.json` aus den bekannten Operations neu. |
| `ddd-services` | `npm run start:shipping` startet den Shipping-Service auf Port 4001. |
| `federation` | Gateway auf Port 4000, die Subgraphs `customers` und `orders` auf 4001 und 4002. |
| `rest-wrapping` | Der Inventory-REST-Service läuft auf Port 4001. |
| `operations-fragments`, `optimistic-ui` | Kein `start:solution`: Die Lösung besteht aus Operations und Tests in `solution/`. |

## Übungen

Die Reihenfolge geht von einfach nach schwer. Die Stufe zeigt den Schwierigkeitsgrad: 1 Grundlagen, 2 Alltag, 3 Architektur und Betrieb. Jede Übung läuft auf Apollo Server 5 und Express 5; die Spalte „Dazu“ nennt, was darüber hinaus im Spiel ist.

### Stufe 1 – Grundlagen

| Nr. | Lektion | Übung | Dazu |
| --- | --- | --- | --- |
| 01 | REST und GraphQL liefern dieselbe Übersicht – zähle Requests und Bytes | [rest-vs-graphql](recipes/rest-vs-graphql/README.md) | – |
| 02 | Ein erster Apollo Server: SDL, Resolver, Mutation mit Input und Payload, Tests über HTTP | [shop-server](recipes/shop-server/README.md) | – |
| 03 | Operations: Variables, Fragments, Aliases | [operations-fragments](recipes/operations-fragments/README.md) | – |
| 04 | Resolver ohne N+1: DataLoader batcht pro Request | [dataloader](recipes/dataloader/README.md) | DataLoader |
| 05 | Errors as Data: fachliche Fehler gehören ins Schema | [errors-as-data](recipes/errors-as-data/README.md) | – |

### Stufe 2 – Alltag

| Nr. | Lektion | Übung | Dazu |
| --- | --- | --- | --- |
| 06 | Ein React-Client mit Apollo Client 4: ein Fragment pro Zeile, Typen aus GraphQL Codegen | [shop-client](recipes/shop-client/README.md) | React 19, Apollo Client 4, Vite, GraphQL Codegen |
| 07 | Ein Context pro Request: Identität, Loader, Tests ohne HTTP | [context](recipes/context/README.md) | DataLoader |
| 08 | Schichten und Module: ein Schema aus vielen Ordnern | [modules](recipes/modules/README.md) | DataLoader, zod |
| 09 | Authentication mit Access Tokens (OIDC, jose) und Authorization pro Feld | [auth](recipes/auth/README.md) | jose, Apollo Client 4 |
| 10 | Das me-Pattern: Wer fragt, bekommt seine eigene Sicht | [me-pattern](recipes/me-pattern/README.md) | DataLoader |
| 11 | Pagination mit Connections und Apollo Cache Policies | [pagination](recipes/pagination/README.md) | Apollo Client 4 |
| 12 | Optimistic UI mit dem normalisierten Apollo-Client-Cache | [optimistic-ui](recipes/optimistic-ui/README.md) | Apollo Client 4 |
| 13 | Custom Scalars prüfen an der Schema-Grenze | [custom-scalars](recipes/custom-scalars/README.md) | graphql-scalars |
| 14 | Wrapping REST: eine GraphQL-Fassade vor einem fremden Service | [rest-wrapping](recipes/rest-wrapping/README.md) | DataLoader |

### Stufe 3 – Architektur und Betrieb

| Nr. | Lektion | Übung | Dazu |
| --- | --- | --- | --- |
| 15 | Live-Bestellstatus mit Subscriptions über WebSocket | [subscriptions](recipes/subscriptions/README.md) | graphql-ws, ws, Apollo Client 4 |
| 16 | Apollo Federation: zwei Subgraphs, ein Supergraph | [federation](recipes/federation/README.md) | Apollo Gateway, Apollo Subgraph |
| 17 | Query Cost Limits und Persisted Operations für einen öffentlichen Graph | [query-cost-limits](recipes/query-cost-limits/README.md) | – |
| 18 | Response Caching mit `@cacheControl` | [response-caching](recipes/response-caching/README.md) | Apollo Response Cache Plugin |
| 19 | Schema Evolution: additiv erweitern, Breaking Changes finden | [schema-evolution](recipes/schema-evolution/README.md) | GraphQL Inspector |
| 20 | Tracing und Metrics pro Operation als Apollo-Server-Plugin | [tracing](recipes/tracing/README.md) | OpenTelemetry |
| 21 | DDD im Graph: Bounded Contexts und Aggregates | [ddd](recipes/ddd/README.md) | DataLoader |
| 22 | Der Graph bleibt, Services wachsen dahinter: ein Modul wird ein Service | [ddd-services](recipes/ddd-services/README.md) | DataLoader |
| 23 | Schnelle Reads: erst messen, dann Batches und Keyset-Pagination | [fast-reads](recipes/fast-reads/README.md) | DataLoader, node:sqlite |
| 24 | BFF und Domain Boundaries | [bff-gateway](recipes/bff-gateway/README.md) | – |

Drei Ordner unter `recipes/` sind Platzhalter ohne Inhalt: [prefetching](recipes/prefetching/README.md), [verify-graphql-tags](recipes/verify-graphql-tags/README.md) und [server-side-rendering-apollo](recipes/server-side-rendering-apollo/README.md).

## Der Werkstatt-Shop

Produkte, Kunden und Bestellungen. Geld steht immer in ganzen Cent (`priceCents`, `totalCents`). Eine Bestellung durchläuft `DRAFT → PLACED → PAID → SHIPPED`; `CANCELLED` ist nur aus `DRAFT` oder `PLACED` erlaubt. Das Schema steht in [`recipes/shop-server/src/schema.graphql`](recipes/shop-server/src/schema.graphql), jede Übung bringt ihre eigenen Beispieldaten in `src/` mit. Wer anfragt, steht im Header – in `shop-server` als `authorization: Bearer token-ada` für `c-1` oder `token-grace` für `c-2`; jede Übung nennt ihren Header in der README.

## Stack

**Stack (Oktober 2026):** Apollo Server 5 (`@apollo/server`) als Middleware in Express 5 (`@as-integrations/express5`) · graphql 16 · TypeScript 7 strict · Vitest 5 · Prettier. Es gibt keinen Build-Schritt: Node.js 26 führt die `.ts`-Dateien direkt aus, deshalb steht in jeder `tsconfig.json` `erasableSyntaxOnly`.

Weitere Pakete nur dort, wo die Übung sie braucht:

- DataLoader 2 in `dataloader`, `context`, `modules`, `me-pattern`, `rest-wrapping`, `ddd`, `ddd-services` und `fast-reads`
- Apollo Client 4 in `shop-client`, `auth`, `pagination`, `optimistic-ui` und `subscriptions`
- React 19, Vite 8, Testing Library, jsdom und GraphQL Codegen 7 (`typescript-operations`) in `shop-client`
- jose 6 in `auth`
- zod 4 in `modules`
- graphql-scalars 2 in `custom-scalars`
- graphql-ws 6, ws 8 und graphql-subscriptions 3 in `subscriptions`
- Apollo Gateway 2, `@apollo/subgraph` und `@apollo/composition` in `federation`
- `@apollo/server-plugin-response-cache` 5 in `response-caching`
- GraphQL Inspector 8 (`@graphql-inspector/core`) in `schema-evolution`
- OpenTelemetry (`@opentelemetry/api`, `@opentelemetry/sdk-trace-base`) in `tracing`
- `node:sqlite` aus der Node.js-Standardbibliothek in `fast-reads`

## Kapitel

Die Theorie liegt als englische Kapitel im Ordner [`introduction-graphql/`](introduction-graphql/). Sie stammen aus der früheren Fassung des Workshops (Stand Januar 2022); die Codebeispiele dort nutzen zum Teil noch `express-graphql` und Mocha. Die aktuelle Umsetzung mit Apollo Server 5 zeigen die Übungen.

- Einstieg: [Why GraphQL](introduction-graphql/intro.md) · [What is GraphQL](introduction-graphql/graphql.md) · [Architecture](introduction-graphql/architecture.md) · [Principles](introduction-graphql/principles.md)
- Abfragen: [Queries](introduction-graphql/queries.md) · [Variables](introduction-graphql/variables.md) · [Fragments](introduction-graphql/fragments.md) · [Directives](introduction-graphql/directives.md) · [Introspection](introduction-graphql/introspection.md) · [Clients](introduction-graphql/clients.md)
- Schema und Ausführung: [Type System](introduction-graphql/types.md) · [Schema](introduction-graphql/schema.md) · [Validation](introduction-graphql/validation.md) · [Resolver](introduction-graphql/resolver.md) · [Error Handling](introduction-graphql/errors.md) · [Mutations](introduction-graphql/mutations.md)
- Weiterführend: [Paging](introduction-graphql/paging.md) · [Versioning](introduction-graphql/versioning.md) · [Subscriptions](introduction-graphql/subscriptions.md) · [Authentication and Authorization](introduction-graphql/auth.md) · [Caching](introduction-graphql/caching.md) · [Advanced GraphQL](introduction-graphql/advanced-graphql.md) · [Batch, Defer, Live](introduction-graphql/soon.md) · [GraphQL with ExpressJS](introduction-graphql/expressjs.md) · [Testing GraphQL](introduction-graphql/testing.md)
- Außerdem: [GraphQL Specification](https://spec.graphql.org/) · [Resources](introduction-graphql/resources.md)

## Workshop und Folien

- Workshop: [„Architektur: DDD, CQRS und Event Sourcing“](https://workshops.mikebild.dev/w/architektur-ddd-cqrs/remote/)
- Workshop: [„Fullstack mit TypeScript, Node.js, GraphQL und React in 6 Tagen“](https://workshops.mikebild.dev/w/fullstack/onsite/)
- Workshop: [„GraphQL-APIs entwerfen und bauen“](https://workshops.mikebild.dev/w/graphql-kompakt/online/)
- Workshop: [„GraphQL vom Schema bis zur Produktion“](https://workshops.mikebild.dev/w/graphql/onsite/)
- Workshop: [„Microservices mit Node.js, Express 5 und Docker Compose“](https://workshops.mikebild.dev/w/microservices/remote/)
- Workshop: [„GraphQL in 60 Minuten“](https://workshops.mikebild.dev/w/mini-kurs/online/)
- Workshop: [„Node.js Backend, funktional und typsicher“](https://workshops.mikebild.dev/w/nodejs/remote/)
- Workshop: [„React mit Vite bis zur installierbaren PWA“](https://workshops.mikebild.dev/w/react-fortgeschritten/remote/)
- Workshop: [„React mit TypeScript bis zur Produktion“](https://workshops.mikebild.dev/w/react/remote/)
- Folien: [slides.mikebild.dev/introduction-graphql](https://slides.mikebild.dev/introduction-graphql.html)
- PDF: [slides.mikebild.dev/introduction-graphql.pdf](https://slides.mikebild.dev/introduction-graphql.pdf)
- Beiträge auf mikebild.dev:
  - [GraphQL-Konzepte: Schema, Resolver, Ausführung](https://www.mikebild.dev/de/blog/graphql-konzepte-schema-resolver-ausfuehrung/)
  - [GraphQL-Überblick: Vom Schema zur föderierten API](https://www.mikebild.dev/de/blog/graphql-ueberblick-vom-schema-zur-foederierten-api/)

## Archiv

Ältere Beispiele bleiben zum Vergleich im Repo, werden aber nicht weiter gepflegt. Ihr Code stammt aus dem Januar 2022:

- [`archive/apollo-example/`](archive/apollo-example/README.md) – Apollo Server 2 und React 17 mit apollo-boost als Lerna-Monorepo mit Parcel. Ersetzt durch `shop-server` und `shop-client`, deren READMEs zum Vergleich darauf verweisen.
- [`archive/external-pubsub-subscriptions/`](archive/external-pubsub-subscriptions/README.md) – nur ein Verweis auf die Übung `subscriptions`.
- [`aws-example/`](aws-example/README.md) – AWS AppSync mit Lambda über AWS CDK 2 und ein React-17-Client. Die README dort ist noch die des Apollo-Beispiels.
- [`graphql-server-example-dotnet/`](graphql-server-example-dotnet/README.md) – ein GraphQL-Server in C# mit GraphQL.Server.All 5.2 auf .NET Core 3.1. Die Tasks in `.vscode/` gehören zu diesem Beispiel.

## Fehler melden

Hast du einen Fehler gefunden oder eine Idee? Leg ein [Issue](https://github.com/MikeBild/introduction-graphql/issues) an. Sicherheitslücken meldest du bitte nicht öffentlich, sondern über das Kontaktformular auf [mikebild.dev](https://www.mikebild.dev).

## Lizenz

[MIT](LICENSE)

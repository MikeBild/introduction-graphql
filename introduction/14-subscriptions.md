# Subscriptions

![Subscriptions](subscription.png)

* Publish/Subscribe Pattern
* Transport via different protocols (WebSockets, HTTP Event-Source, HTTP-Stream, HTTP/2)

```graphql
subscription upserted_author_subscription {
    upsertedAuthor {
        id
        name
        post {
            title
        }
    }
}
```
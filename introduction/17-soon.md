# Batch, Defer, Live, etc.

* `@export(as: "ids")` at ID property level generates internal ID collection for batching queries
* `@defer` at property level can specify that some part of the query can arrive later
* `@stream` at property level sending result patches to collection
* `@live` at property level for real-time updates 
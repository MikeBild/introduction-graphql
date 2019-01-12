# List Component

## Setup

1. `yarn`
2. `yarn dev` - Run in development mode
3. `yarn build` - Build component

## Example

```jsx
import List from '@introduction-graphql/list';

<List
  rows={[{id: 1, content: 'Hello World!'}]}
  renderHeadRow={() => (
    <tr>
      <th>ID</th>
      <th>Content</th>
    </tr>
  )}
  renderRow={({ id, content }) => (
    <tr key={id}>
      <td>{id}</td>
      <td>{content}</td>
    </tr>
  )}
  isLoading={loading}
  renderLoading={() => (
    <tr>
      <td colSpan={2}>loading ...</td>
    </tr>
  )}
/>
```

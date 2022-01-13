import * as React from "react";

export const List = ({
  rows,
  renderRow,
  renderHeadRow = () => <tr />,
  isLoading,
  renderLoading,
  error,
  renderError,
  style,
}) => (
  <table style={style}>
    <thead>{renderHeadRow()}</thead>
    <tbody>
      {error && renderError && renderError(error)}
      {isLoading && !error && renderLoading && renderLoading()}
      {!isLoading && !error && rows.map(renderRow)}
    </tbody>
  </table>
);

export default List;

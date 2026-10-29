import * as React from 'react';
export interface Row {
  id: string;
  value?: string;
}

interface TProps {
  rows: [Row];
  renderRow: (item: Row) => JSX.Element;
  renderHeadRow?: () => JSX.Element;
  isLoading?: boolean;
  renderLoading?: () => JSX.Element;
  error?: Error;
  renderError?: (error: Error) => JSX.Element;
  style: object;
}

export const List: React.StatelessComponent<TProps> = ({
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

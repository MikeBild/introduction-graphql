import React from 'react';
import styled from 'styled-components';
import { gql, graphql } from 'react-apollo';

export const LocationsList = ({ className, data }) => {
  return (
    <div className={className}>
      {data &&
        data.locations &&
        data.locations.map((x, i) => <span key={i}>{x}</span>)}
    </div>
  );
};

const StyledLocationsList = styled(LocationsList)`
  font-weight: bold;
  display: inline;
  span {
    padding-right: 5px;
  }
`;

export default graphql(gql`
  query Locations {
    locations
  }
`)(StyledLocationsList);

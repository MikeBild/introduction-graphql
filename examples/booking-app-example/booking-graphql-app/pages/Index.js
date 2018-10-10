import React from 'react';
import styled from 'styled-components';
import withGraphQL from '../lib/withGraphQL';
import SearchList from './components/SearchList';
import appPackage from '../package.json';

const StyledTitle = styled.h1`
  color: #2196f3;
`;

export class Index extends React.Component {
  static async getInitialProps() {
    return {};
  }

  render() {
    return (
      <div>
        <StyledTitle>
          Trip Booker (v
          {appPackage.version})
        </StyledTitle>
        <SearchList />
      </div>
    );
  }
}

export default withGraphQL(Index);

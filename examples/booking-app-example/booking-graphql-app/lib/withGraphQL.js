import React from 'react';
import PropTypes from 'prop-types';
import { ApolloProvider, getDataFromTree } from 'react-apollo';
import initApollo from './initApollo';

function getComponentDisplayName(Component) {
  return Component.displayName || Component.name || 'Unknown';
}

export default WrappedComponent => {
  return class WithGraphQL extends React.Component {
    static displayName = `WithGraphQL(${getComponentDisplayName(
      WrappedComponent,
    )})`;

    static async getInitialProps(ctx) {
      let serverState = {};

      let composedInitialProps = {};
      if (WrappedComponent.getInitialProps)
        composedInitialProps = await WrappedComponent.getInitialProps(ctx);

      if (!process.env.BROWSER) {
        const apollo = initApollo();
        const url = { query: ctx.query, pathname: ctx.pathname };

        try {
          await getDataFromTree(
            <ApolloProvider client={apollo}>
              <WrappedComponent url={url} {...composedInitialProps} />
            </ApolloProvider>,
          );
        } catch (error) {
          console.error(error);
        }

        const state = apollo.getInitialState();
        serverState = { apollo: { data: state.data } };
      }

      return Object.assign({}, { serverState }, composedInitialProps);
    }

    constructor(props) {
      super(props);
      this.apollo = initApollo(this.props.serverState);
    }

    render() {
      return (
        <ApolloProvider client={this.apollo}>
          <WrappedComponent {...this.props} />
        </ApolloProvider>
      );
    }
  };
};

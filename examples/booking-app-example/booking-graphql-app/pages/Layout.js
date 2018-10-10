import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import './Layout.css';
import appPackage from '../package.json';

const LayoutContainer = styled.div`
  margin: 0;
  padding: 0;
`;

const Content = styled.main`
  width: 100%;
  padding: 0 10%;
`;

export default class Layout extends React.Component {
  render() {
    return (
      <LayoutContainer>
        <Helmet htmlAttributes={{ lang: 'en' }}>
          <title>
            Trip Booker (v
            {appPackage.version})
          </title>
          <meta charset="utf-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="Trip Booker" />
          <meta name="theme-color" content="#fff" />
          <link rel="shortcut icon" href="data:" />
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,300,400italic,600,200,600italic,700,900"
            rel="stylesheet"
          />
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css"
            rel="stylesheet"
          />
        </Helmet>
        <Content>{this.props.children}</Content>
      </LayoutContainer>
    );
  }
}

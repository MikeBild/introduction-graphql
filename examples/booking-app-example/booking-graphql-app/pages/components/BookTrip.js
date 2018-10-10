import React from 'react';
import styled from 'styled-components';
import { compose } from 'recompose';
import { gql, graphql } from 'react-apollo';
import PaymentsList from './PaymentsList';

const FailureMessage = styled.div`
  color: #f44336;
  font-weight: bold;
  max-width: 200px;
`;

const SuccessMessage = styled.div`
  border: 1px solid black;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);

  & > div {
    top: 20%;
    position: fixed;
    right: 25%;
    background: #fff;
    width: 40%;
    height: 20%;
    border: 5px solid #000;
    padding: 20px;
  }

  & a {
    color: #2196f3;
  }
`;

const BookATripButton = styled.button`
  font-family: 'Source Sans Pro', sans-serif;
  font-weight: bold;
  border: 2px solid #2196f3;
  background: #fff;
  color: #ff5722;
  padding-bottom: 6px;
  padding-top: 4px;
  margin-left: 6px;
`;

const PaymentInput = styled.input`
  border: 2px solid #2196f3;
  padding: 5px;
  margin: 10px 0;
  min-width: 200px;
`;

export class BookTrip extends React.Component {
  state = {
    domainError: null,
    paymentSource: 'PAYPAL',
    reservationId: null,
  };

  bookThisTrip() {
    this.props
      .bookTrip({
        variables: {
          id: this.props.trip.id,
          payment: { source: this.state.paymentSource },
        },
      })
      .then(result =>
        this.setState({
          reservationId: result.data.bookTrip.id,
          domainError: result.data.bookTrip.domainError,
        }),
      )
      .catch(error =>
        this.setState({ domainError: { message: error.message } }),
      );
  }

  render() {
    const { bookTrip } = this.props;
    return (
      <div>
        {!this.state.reservationId && (
          <div>
            <PaymentsList />
            <PaymentInput
              type="text"
              defaultValue={this.state.paymentSource}
              onBlur={e => this.setState({ paymentSource: e.target.value })}
            />
            <BookATripButton onClick={() => this.bookThisTrip()}>
              Book this Trip
            </BookATripButton>
          </div>
        )}
        {this.state.domainError &&
          this.state.domainError.message && (
            <FailureMessage>
              <small>{this.state.domainError.message}</small>
            </FailureMessage>
          )}
        {this.state.reservationId && (
          <SuccessMessage>
            <div>
              <h3>
                Thank you for reservation (No: ${this.state.reservationId})
              </h3>
              <a href="/">Back to Booking</a>
            </div>
          </SuccessMessage>
        )}
      </div>
    );
  }
}

export default compose(
  graphql(
    gql`
      mutation BookTrip($id: ID!, $payment: PaymentInput!) {
        bookTrip(id: $id, payment: $payment) {
          id
          domainError
        }
      }
    `,
    { name: 'bookTrip' },
  ),
)(BookTrip);

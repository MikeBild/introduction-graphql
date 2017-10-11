import React from 'react'
import styled from 'styled-components'
import {gql, graphql} from 'react-apollo'

export const PaymentsList = ({className, data}) => {
  return (
    <div>
      <label>Available payments: </label>
      <div className={className}>
        {
          data &&
          data.payments &&
          data.payments.map((x, i) => <span key={i}>{x}</span>)
        }
      </div>
    </div>
  )
}

const StyledPaymentsList = styled(PaymentsList)`
  font-weight: bold;
  display: inline;
  span {
    padding-right : 5px;
  }
`


export default graphql(gql`query Payments {
  payments
}`)(StyledPaymentsList)
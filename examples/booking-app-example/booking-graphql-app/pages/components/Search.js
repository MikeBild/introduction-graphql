import React from 'react'
import styled from 'styled-components'
import {compose} from 'recompose'
import {gql, graphql} from 'react-apollo'

const SearchContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 0;
`

const AddToTripButton = styled.button`
  font-family: "Source Sans Pro", sans-serif;
  font-weight: bold;
  font-size: 12px;
  border: 2px solid #2196F3;
  background: #fff;
  color: #ff5722;
  padding: 10px;
  min-width: 200px;
`

export const Search = props => {
  const {id, __typename, location, price, trip, updateTrip} = props

  const SearchType = () => (
    <div>
      {
        __typename === 'Flight' &&
        <i className="fa fa-plane" />
      }
      {
        __typename === 'Hotel' &&
        <i className="fa fa-bed" />
      }
      {
        __typename === 'Car' &&
        <i className="fa fa-car" />
      }
      <strong>&nbsp;{location}</strong>
    </div>
  )

  return (
    <SearchContainer>
      <SearchType />
      <div>{price} €</div>
      <div>
        {
          trip &&
          __typename === 'Flight' &&
          <AddToTripButton onClick={() => updateTrip({input: {id: trip.id, flight: id, hotel: trip.hotel.id, car: trip.car.id}})}>Add {__typename} to Trip {trip.id}</AddToTripButton>
        }
        {
          trip &&
          __typename === 'Hotel' &&
          <AddToTripButton onClick={() => updateTrip({input: {id: trip.id, hotel: id, flight: trip.flight.id, car: trip.car.id}})}>Add {__typename} to Trip {trip.id}</AddToTripButton>
        }
        {
          trip &&
          __typename === 'Car' &&
          <AddToTripButton onClick={() => updateTrip({input: {id: trip.id, car: id, flight: trip.flight.id, hotel: trip.hotel.id}})}>Add {__typename} to Trip {trip.id}</AddToTripButton>
        }
      </div>
    </SearchContainer>
  )
}

export default compose(
  graphql(gql`mutation updateTrip($input: TripInput!) {
    updateTrip(input: $input) {
      id
      domainError
      hotel {
        id
        location
        price
      }
      flight {
        id
        location
        price
        from
      }
      car {
        id
        location
        price
      }
    }
  }`, {
    props: ({ownProps, mutate}) => ({
      updateTrip: variables => mutate({
        variables,
        updateQueries: {
          Search: (prev, {mutationResult}) => {
            prev.trip = mutationResult.data.updateTrip
            return prev
          },
        },
      })
    }),
  }),
)(Search)
import React from 'react'
import styled from 'styled-components'
import {gql, graphql} from 'react-apollo'
import {compose} from 'recompose'
import Search from './Search'
import LocationsList from './LocationsList'
import BookTrip from './BookTrip'

const SearchListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
  padding: 15px 0;
`

const YourTripContainer = styled.div`
  & label {
    width: 100px;
    display: inline-block;
  }
  & strong {
    text-align: right;
    width: 100px;
    display: inline-block;
  }
`

const StartTripButton = styled.button`
  font-family: "Source Sans Pro", sans-serif;
  font-weight: bold;
  font-size: 20px;
  border: 2px solid #2196F3;
  background: #fff;
  color: #ff5722;
  padding: 10px;
  min-width: 200px;
`

const SearchInput = styled.input`
  border: 2px solid #2196F3;
  padding: 10px;
  margin: 10px 0;
  min-width: 200px;
`

export class SearchList extends React.Component {
  render () {
    const {className, search, createTrip} = this.props
    return (
      <div>
        <SearchListContainer>
          <div>
            <label><i className="fa fa-search" />Search by location <LocationsList /></label>
            <br/>
            <SearchInput type="search" onBlur={e => search.refetch({location: e.target.value, id: search.trip && search.trip.id})} />
          </div>
          {
            search.trip &&
            <YourTripContainer>
              <div>
                <label>ID</label>
                <strong>{search.trip.id}</strong>
              </div>
              {
                search.trip.flight &&
                <div>
                  <label>Flight</label>
                  <strong>{search.trip.flight.price || 'N/A'} €</strong>
                </div>
              }
              {
                search.trip.hotel &&
                <div>
                  <label>Hotel</label>
                  <strong>{search.trip.hotel.price || 'N/A'} €</strong>
                </div>
              }
              {
                search.trip.car &&
                <div>
                  <label>Car</label>
                  <strong>{search.trip.car.price || 'N/A'} €</strong>
                </div>
              }
            </YourTripContainer>
          }
          {
            !search.trip &&
            <StartTripButton onClick={() => createTrip()}>Start a Trip</StartTripButton>
          }
          {
            search.trip &&
            search.trip.flight &&
            search.trip.flight.id &&
            search.trip.hotel &&
            search.trip.hotel.id &&
            search.trip.car &&
            search.trip.car.id &&
            <BookTrip trip={search.trip} />
          }
        </SearchListContainer>
        <hr />
        <div className={className}>
          {
            search.search &&
            search.search.map((x, i) => <Search key={i} {...x} trip={search.trip} />)
          }
        </div>
      </div>
    )
  }
}

const StyledSearchList = styled(SearchList)`
  color: #ff5722;
`


const RootQuery = gql`query Search($location: String, $id: ID) {
  search(location: $location) {
    id
    location
    price
  }
  trip(id: $id) {
    id
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
}`

export default compose(
  graphql(RootQuery, {
    name: 'search',
    options: ({variables: {id: '', location: ''}})
  }),
  graphql(gql`mutation CreateTrip {
    createTrip {
      id
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
    props: ({ ownProps, mutate }) => ({
      createTrip: variables => mutate({
        variables,
        updateQueries: {
          Search: (prev, { mutationResult }) => {
            prev.trip = mutationResult.data.createTrip
            return prev
          },
        },
      })
    }),
  }),
)(StyledSearchList)
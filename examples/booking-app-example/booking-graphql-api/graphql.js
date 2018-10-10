const { pubsub } = require('subkit');
const randomString = require('randomstring');

export const resolvers = {
  Search: {
    __resolveType: (obj, context) => obj.source,
  },
  Query: {
    locations: async (parent, args, context, info) =>
      context.loaders.locations(),
    payments: async (parent, args, context, info) => context.loaders.payments(),
    flight: async (parent, args, context, info) =>
      context.loaders.flights.byId(args.id),
    flights: async (parent, args, context, info) =>
      context.loaders.flights.search({ location: args.location }),
    hotel: async (parent, args, context, info) =>
      context.loaders.hotels.byId(args.id),
    hotels: async (parent, args, context, info) =>
      context.loaders.hotels.search({ location: args.location }),
    car: async (parent, args, context, info) =>
      context.loaders.cars.byId(args.id),
    cars: async (parent, args, context, info) =>
      context.loaders.cars.search({ location: args.location }),
    search: async (parent, args, context, info) => {
      const searchResults = await Promise.all([
        context.loaders.flights.search({ location: args.location }),
        context.loaders.hotels.search({ location: args.location }),
        context.loaders.cars.search({ location: args.location }),
      ]);

      const searchAggregate = searchResults.reduce((s, n) => s.concat(n), []);

      return searchAggregate;
    },
    trip: (parent, args, context, info) => context.loaders.trips.byId(args.id),
  },
  Flight: {
    connection: (parent, args, context, info) =>
      context.loaders.flights.byId(parent.connectionFlightId),
  },
  Trip: {
    flight: (parent, args, context, info) =>
      context.loaders.flights.byId(parent.flight),
    hotel: (parent, args, context, info) =>
      context.loaders.hotels.byId(parent.hotel),
    car: (parent, args, context, info) => context.loaders.cars.byId(parent.car),
  },
  Reservation: {
    trip: (parent, args, context, info) =>
      context.loaders.trips.byId(parent.tripId),
  },
  Mutation: {
    createTrip: (parent, args, context, info) => context.loaders.trips.create(),
    updateTrip: (parent, args, context, info) =>
      context.loaders.trips.update(args.input),
    bookTrip: (parent, args, context, info) =>
      context.loaders.trips.book(args.id, args.payment),
  },
  Subscription: {
    onBookingCompleted: (parent, args, context, info) =>
      Object.assign({}, parent, {}),
  },
};

const store = {
  flights: {
    '1': {
      price: '100.50',
      location: 'MUC',
      from: 'BER',
      connectionFlightId: '1',
      class: 'Eco',
      datetime: 1507368559535,
    },
    '2': {
      price: '50.56',
      location: 'FRA',
      from: 'BER',
      connectionFlightId: '3',
      class: 'Business',
      datetime: 1507368559535,
    },
    '3': {
      price: '80.60',
      location: 'MUC',
      from: 'FRA',
      class: 'Eco',
      datetime: 1507368559535,
    },
  },
  hotels: {
    '1': {
      price: '77.20',
      location: 'MUC',
      class: 'Design',
      datetime: 1507368559535,
    },
    '2': {
      price: '43.69',
      location: 'BER',
      class: 'Eco',
      datetime: 1507368559535,
    },
  },
  cars: {
    '1': {
      price: '23.74',
      location: 'MUC',
      category: 'Middle',
      datetime: 1507368559535,
    },
    '2': {
      price: '33.33',
      location: 'BER',
      category: 'Premium',
      datetime: 1507368559535,
    },
  },
  trips: {},
  reservations: {},
};

export const loaders = {
  locations: async () => ['MUC', 'BER', 'FRA'],
  payments: async () => ['VISA', 'PAYPAL'],
  flights: {
    byId: async id =>
      store.flights[id] ? Object.assign({}, store.flights[id], { id }) : null,
    search: async ({ location } = {}) =>
      Object.keys(store.flights)
        .map(x =>
          Object.assign({}, store.flights[x], { id: x, source: 'Flight' }),
        )
        .filter(x => (location ? x.location === location : true)),
  },
  hotels: {
    byId: async id => Object.assign({}, store.hotels[id], { id }),
    search: async ({ location } = {}) =>
      Object.keys(store.hotels)
        .map(x =>
          Object.assign({}, store.hotels[x], { id: x, source: 'Hotel' }),
        )
        .filter(x => (location ? x.location === location : true)),
  },
  cars: {
    byId: async id => Object.assign({}, store.cars[id], { id }),
    search: async ({ location } = {}) =>
      Object.keys(store.cars)
        .map(x => Object.assign({}, store.cars[x], { id: x, source: 'Car' }))
        .filter(x => (location ? x.location === location : true)),
  },
  trips: {
    byId: async id => store.trips[id],
    create: async () => {
      const newTripId = randomString.generate(5);
      return (store.trips[newTripId] = { id: newTripId });
    },
    update: async ({ id, hotel, flight, car }) => {
      const tripToUpdate = store.trips[id];
      if (!tripToUpdate) return { domainError: { message: `trip missing` } };
      return (store.trips[id] = { id, hotel, flight, car });
    },
    book: async (id, payment) => {
      const tripToBook = store.trips[id];
      if (!tripToBook) return { domainError: { message: `trip missing` } };
      if (payment.source === 'PAYPAL')
        return { domainError: { message: `PAYPAL is not available` } };
      const newReservationId = randomString.generate(5);
      return (store.reservations[newReservationId] = {
        id: newReservationId,
        tripId: id,
        payment: payment.source,
      });
    },
  },
};

// Demonstrate Pub/Sub
pubsub.subscribe('reservationCompleted', event => console.log(event));

export const channels = {
  onChangedTodo: (options, args) => ({
    reservationCompleted: { filter: event => true },
  }),
};

export const directives = {};

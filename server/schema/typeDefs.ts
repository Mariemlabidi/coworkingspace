import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  # Énumérations
  enum UserRole {
    USER
    ADMIN
  }

  enum SpaceType {
    OFFICE
    MEETING_ROOM
    PHONE_BOOTH
    COMMON_AREA
  }

  enum ReservationStatus {
    PENDING
    CONFIRMED
    CANCELLED
  }

  # Types principaux
  type User {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    reservations: [Reservation!]!
    createdAt: String!
  }

  type Space {
    id: ID!
    name: String!
    type: SpaceType!
    capacity: Int!
    amenities: [String!]!
    isActive: Boolean!
    reservations: [Reservation!]!
    description: String
  }

  type Reservation {
    id: ID!
    user: User!
    space: Space!
    startTime: String!
    endTime: String!
    status: ReservationStatus!
    purpose: String
    createdAt: String!
  }

  # Types de réponse
  type ReservationResponse {
    success: Boolean!
    message: String!
    reservation: Reservation
    conflicts: [Reservation!]
  }

  type SpaceResponse {
    success: Boolean!
    message: String!
    space: Space
  }

  type UserResponse {
    success: Boolean!
    message: String!
    user: User
  }

  # Inputs
  input CreateUserInput {
    name: String!
    email: String!
    role: UserRole = USER
  }

  input CreateSpaceInput {
    name: String!
    type: SpaceType!
    capacity: Int!
    amenities: [String!]!
    description: String
  }

  input CreateReservationInput {
    userId: ID!
    spaceId: ID!
    startTime: String!
    endTime: String!
    purpose: String
  }

  input UpdateReservationInput {
    id: ID!
    startTime: String
    endTime: String
    purpose: String
    status: ReservationStatus
  }

  # Queries
  type Query {
    # Utilisateurs
    users: [User!]!
    user(id: ID!): User
    
    # Espaces
    spaces: [Space!]!
    space(id: ID!): Space
    availableSpaces(startTime: String!, endTime: String!): [Space!]!
    
    # Réservations
    reservations: [Reservation!]!
    reservation(id: ID!): Reservation
    userReservations(userId: ID!): [Reservation!]!
    spaceReservations(spaceId: ID!, date: String): [Reservation!]!
    reservationsByDateRange(startDate: String!, endDate: String!): [Reservation!]!
  }

  # Mutations
  type Mutation {
    # Utilisateurs
    createUser(input: CreateUserInput!): UserResponse!
    
    # Espaces
    createSpace(input: CreateSpaceInput!): SpaceResponse!
    updateSpace(id: ID!, input: CreateSpaceInput!): SpaceResponse!
    deleteSpace(id: ID!): SpaceResponse!
    
    # Réservations
    createReservation(input: CreateReservationInput!): ReservationResponse!
    updateReservation(input: UpdateReservationInput!): ReservationResponse!
    cancelReservation(id: ID!): ReservationResponse!
  }
`;
import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      success
      message
      user {
        id
        name
        email
        role
        createdAt
      }
    }
  }
`;

export const CREATE_SPACE = gql`
  mutation CreateSpace($input: CreateSpaceInput!) {
    createSpace(input: $input) {
      success
      message
      space {
        id
        name
        type
        capacity
        amenities
        description
        isActive
      }
    }
  }
`;

export const UPDATE_SPACE = gql`
  mutation UpdateSpace($id: ID!, $input: CreateSpaceInput!) {
    updateSpace(id: $id, input: $input) {
      success
      message
      space {
        id
        name
        type
        capacity
        amenities
        description
        isActive
      }
    }
  }
`;

export const DELETE_SPACE = gql`
  mutation DeleteSpace($id: ID!) {
    deleteSpace(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_RESERVATION = gql`
  mutation CreateReservation($input: CreateReservationInput!) {
    createReservation(input: $input) {
      success
      message
      reservation {
        id
        user {
          id
          name
          email
        }
        space {
          id
          name
          type
        }
        startTime
        endTime
        status
        purpose
        createdAt
      }
      conflicts {
        id
        startTime
        endTime
        user {
          name
        }
      }
    }
  }
`;

export const UPDATE_RESERVATION = gql`
  mutation UpdateReservation($input: UpdateReservationInput!) {
    updateReservation(input: $input) {
      success
      message
      reservation {
        id
        startTime
        endTime
        status
        purpose
      }
      conflicts {
        id
        startTime
        endTime
        user {
          name
        }
      }
    }
  }
`;

export const CANCEL_RESERVATION = gql`
  mutation CancelReservation($id: ID!) {
    cancelReservation(id: $id) {
      success
      message
      reservation {
        id
        status
      }
    }
  }
`;
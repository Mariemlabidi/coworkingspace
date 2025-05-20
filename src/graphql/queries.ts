import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
      createdAt
    }
  }
`;

export const GET_SPACES = gql`
  query GetSpaces {
    spaces {
      id
      name
      type
      capacity
      amenities
      isActive
      description
    }
  }
`;

export const GET_RESERVATIONS = gql`
  query GetReservations {
    reservations {
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
  }
`;

export const GET_AVAILABLE_SPACES = gql`
  query GetAvailableSpaces($startTime: String!, $endTime: String!) {
    availableSpaces(startTime: $startTime, endTime: $endTime) {
      id
      name
      type
      capacity
      amenities
      description
    }
  }
`;

export const GET_USER_RESERVATIONS = gql`
  query GetUserReservations($userId: ID!) {
    userReservations(userId: $userId) {
      id
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
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    spaces {
      id
      name
      type
      isActive
    }
    reservations {
      id
      status
      startTime
      endTime
      createdAt
      space {
        id
        name
      }
    }
    users {
      id
      name
      role
    }
  }
`;

export const GET_SPACE_RESERVATIONS = gql`
  query GetSpaceReservations($spaceId: ID!, $date: String) {
    spaceReservations(spaceId: $spaceId, date: $date) {
      id
      user {
        id
        name
        email
      }
      startTime
      endTime
      status
      purpose
    }
  }
`;
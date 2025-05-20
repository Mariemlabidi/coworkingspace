export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Space {
  id: string;
  name: string;
  type: 'OFFICE' | 'MEETING_ROOM' | 'PHONE_BOOTH' | 'COMMON_AREA';
  capacity: number;
  amenities: string[];
  isActive: boolean;
  description?: string;
}

export interface Reservation {
  id: string;
  user: User;
  space: Space;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  purpose?: string;
  createdAt: string;
}

export interface ReservationInput {
  userId: string;
  spaceId: string;
  startTime: string;
  endTime: string;
  purpose?: string;
}

export interface SpaceInput {
  name: string;
  type: 'OFFICE' | 'MEETING_ROOM' | 'PHONE_BOOTH' | 'COMMON_AREA';
  capacity: number;
  amenities: string[];
  description?: string;
}
import { v4 as uuidv4 } from 'uuid';

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
  userId: string;
  spaceId: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  purpose?: string;
  createdAt: string;
}

// Données de test en mémoire
export const users: User[] = [
  {
    id: 'user-1',
    name: 'Marie Dubois',
    email: 'marie@coworking.com',
    role: 'ADMIN',
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'user-2',
    name: 'Pierre Martin',
    email: 'pierre@coworking.com',
    role: 'USER',
    createdAt: new Date('2024-01-02').toISOString()
  },
  {
    id: 'user-3',
    name: 'Sophie Laurent',
    email: 'sophie@coworking.com',
    role: 'USER',
    createdAt: new Date('2024-01-03').toISOString()
  }
];

export const spaces: Space[] = [
  {
    id: 'space-1',
    name: 'Bureau Individuel 1',
    type: 'OFFICE',
    capacity: 1,
    amenities: ['WiFi', 'Prise électrique', 'Éclairage LED', 'Chaise ergonomique'],
    isActive: true,
    description: 'Bureau calme avec vue sur jardin'
  },
  {
    id: 'space-2',
    name: 'Salle de Réunion Alpha',
    type: 'MEETING_ROOM',
    capacity: 8,
    amenities: ['Projecteur 4K', 'Tableau blanc', 'WiFi', 'Climatisation', 'Système audio'],
    isActive: true,
    description: 'Salle de réunion moderne équipée pour présentations'
  },
  {
    id: 'space-3',
    name: 'Cabine Téléphonique 1',
    type: 'PHONE_BOOTH',
    capacity: 1,
    amenities: ['Insonorisation', 'WiFi', 'Prise électrique', 'Éclairage tamisé'],
    isActive: true,
    description: 'Espace privé pour appels confidentiels'
  },
  {
    id: 'space-4',
    name: 'Salle de Réunion Beta',
    type: 'MEETING_ROOM',
    capacity: 12,
    amenities: ['Double écran', 'Système visioconférence', 'WiFi', 'Machine à café'],
    isActive: true,
    description: 'Grande salle pour réunions d\'équipe et formations'
  },
  {
    id: 'space-5',
    name: 'Bureau Partagé Nord',
    type: 'OFFICE',
    capacity: 4,
    amenities: ['WiFi', 'Imprimante', 'Climatisation', 'Casiers personnels'],
    isActive: true,
    description: 'Espace de travail collaboratif en open-space'
  }
];

export const reservations: Reservation[] = [
  {
    id: 'res-1',
    userId: 'user-2',
    spaceId: 'space-1',
    startTime: new Date('2024-01-15T09:00:00Z').toISOString(),
    endTime: new Date('2024-01-15T12:00:00Z').toISOString(),
    status: 'CONFIRMED',
    purpose: 'Travail concentré sur projet client',
    createdAt: new Date('2024-01-14T10:00:00Z').toISOString()
  },
  {
    id: 'res-2',
    userId: 'user-3',
    spaceId: 'space-2',
    startTime: new Date('2024-01-15T14:00:00Z').toISOString(),
    endTime: new Date('2024-01-15T16:00:00Z').toISOString(),
    status: 'CONFIRMED',
    purpose: 'Présentation trimestrielle',
    createdAt: new Date('2024-01-14T11:00:00Z').toISOString()
  },
  {
    id: 'res-3',
    userId: 'user-2',
    spaceId: 'space-3',
    startTime: new Date('2024-01-16T10:30:00Z').toISOString(),
    endTime: new Date('2024-01-16T11:00:00Z').toISOString(),
    status: 'PENDING',
    purpose: 'Appel client important',
    createdAt: new Date('2024-01-15T09:00:00Z').toISOString()
  }
];

// Fonctions utilitaires
export function generateId(): string {
  return uuidv4();
}

export function addUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const newUser: User = {
    ...user,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  return newUser;
}

export function addSpace(space: Omit<Space, 'id'>): Space {
  const newSpace: Space = {
    ...space,
    id: generateId()
  };
  spaces.push(newSpace);
  return newSpace;
}

export function addReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>): Reservation {
  const newReservation: Reservation = {
    ...reservation,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  reservations.push(newReservation);
  return newReservation;
}
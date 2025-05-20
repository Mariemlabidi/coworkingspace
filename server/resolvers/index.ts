import { 
  users, 
  spaces, 
  reservations, 
  addUser, 
  addSpace, 
  addReservation,
  type User,
  type Space,
  type Reservation
} from '../models/data.js';
import { isDateRangeConflicting, validateReservationTime } from '../utils/dateUtils.js';

export const resolvers = {
  Query: {
    // Utilisateurs
    users: () => users,
    user: (_: any, { id }: { id: string }) => users.find(user => user.id === id),
    
    // Espaces
    spaces: () => spaces.filter(space => space.isActive),
    space: (_: any, { id }: { id: string }) => spaces.find(space => space.id === id),
    
    availableSpaces: (_: any, { startTime, endTime }: { startTime: string, endTime: string }) => {
      const conflictingReservations = reservations.filter(reservation => 
        reservation.status !== 'CANCELLED' &&
        isDateRangeConflicting(
          new Date(startTime),
          new Date(endTime),
          new Date(reservation.startTime),
          new Date(reservation.endTime)
        )
      );
      
      const occupiedSpaceIds = conflictingReservations.map(res => res.spaceId);
      return spaces.filter(space => 
        space.isActive && !occupiedSpaceIds.includes(space.id)
      );
    },
    
    // Réservations
    reservations: () => reservations,
    reservation: (_: any, { id }: { id: string }) => reservations.find(res => res.id === id),
    userReservations: (_: any, { userId }: { userId: string }) => 
      reservations.filter(res => res.userId === userId),
    
    spaceReservations: (_: any, { spaceId, date }: { spaceId: string, date?: string }) => {
      let filtered = reservations.filter(res => res.spaceId === spaceId);
      
      if (date) {
        const targetDate = new Date(date);
        filtered = filtered.filter(res => {
          const resDate = new Date(res.startTime);
          return resDate.toDateString() === targetDate.toDateString();
        });
      }
      
      return filtered;
    },
    
    reservationsByDateRange: (_: any, { startDate, endDate }: { startDate: string, endDate: string }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return reservations.filter(res => {
        const resStart = new Date(res.startTime);
        const resEnd = new Date(res.endTime);
        return resStart >= start && resEnd <= end;
      });
    }
  },

  Mutation: {
    // Utilisateurs
    createUser: (_: any, { input }: { input: any }) => {
      try {
        // Vérifier si l'email existe déjà
        const existingUser = users.find(user => user.email === input.email);
        if (existingUser) {
          return {
            success: false,
            message: 'Un utilisateur avec cet email existe déjà',
            user: null
          };
        }

        const user = addUser(input);
        return {
          success: true,
          message: 'Utilisateur créé avec succès',
          user
        };
      } catch (error) {
        return {
          success: false,
          message: 'Erreur lors de la création de l\'utilisateur',
          user: null
        };
      }
    },

    // Espaces
    createSpace: (_: any, { input }: { input: any }) => {
      try {
        const space = addSpace({ ...input, isActive: true });
        return {
          success: true,
          message: 'Espace créé avec succès',
          space
        };
      } catch (error) {
        return {
          success: false,
          message: 'Erreur lors de la création de l\'espace',
          space: null
        };
      }
    },

    updateSpace: (_: any, { id, input }: { id: string, input: any }) => {
      try {
        const spaceIndex = spaces.findIndex(space => space.id === id);
        if (spaceIndex === -1) {
          return {
            success: false,
            message: 'Espace non trouvé',
            space: null
          };
        }

        spaces[spaceIndex] = { ...spaces[spaceIndex], ...input };
        return {
          success: true,
          message: 'Espace mis à jour avec succès',
          space: spaces[spaceIndex]
        };
      } catch (error) {
        return {
          success: false,
          message: 'Erreur lors de la mise à jour de l\'espace',
          space: null
        };
      }
    },

    deleteSpace: (_: any, { id }: { id: string }) => {
      try {
        const spaceIndex = spaces.findIndex(space => space.id === id);
        if (spaceIndex === -1) {
          return {
            success: false,
            message: 'Espace non trouvé',
            space: null
          };
        }

        // Marquer comme inactif plutôt que supprimer (pour préserver l'historique)
        spaces[spaceIndex].isActive = false;
        return {
          success: true,
          message: 'Espace désactivé avec succès',
          space: spaces[spaceIndex]
        };
      } catch (error) {
        return {
          success: false,
          message: 'Erreur lors de la suppression de l\'espace',
          space: null
        };
      }
    },

    // Réservations
    createReservation: (_: any, { input }: { input: any }) => {
      try {
        // Validation des dates
        const validationError = validateReservationTime(new Date(input.startTime), new Date(input.endTime));
        if (validationError) {
          return {
            success: false,
            message: validationError,
            reservation: null,
            conflicts: []
          };
        }

        // Vérifier les conflits
        const conflicts = reservations.filter(reservation => 
          reservation.spaceId === input.spaceId &&
          reservation.status !== 'CANCELLED' &&
          isDateRangeConflicting(
            new Date(input.startTime),
            new Date(input.endTime),
            new Date(reservation.startTime),
            new Date(reservation.endTime)
          )
        );

        if (conflicts.length > 0) {
          return {
            success: false,
            message: `Conflit détecté avec ${conflicts.length} réservation(s) existante(s)`,
            reservation: null,
            conflicts
          };
        }

        const reservation = addReservation({ ...input, status: 'CONFIRMED' });
        return {
          success: true,
          message: 'Réservation créée avec succès',
          reservation,
          conflicts: []
        };
      } catch (error) {
        return {
          success: false,
          message: 'Erreur lors de la création de la réservation',
          reservation: null,
          conflicts: []
        };
      }
    },

    updateReservation: (_: any, { input }: { input: any }) => {
      try {
        const reservationIndex = reservations.findIndex(res => res.id === input.id);
        if (reservationIndex === -1) {
          return {
            success: false,
            message: 'Réservation non trouvée',
            reservation: null,
            conflicts: []
          };
        }

        const existingReservation = reservations[reservationIndex];
        
        // Si on modifie les dates, vérifier les conflits
        if (input.startTime || input.endTime) {
          const newStartTime = new Date(input.startTime || existingReservation.startTime);
          const newEndTime = new Date(input.endTime || existingReservation.endTime);
          
          const validationError = validateReservationTime(newStartTime, newEndTime);
          if (validationError) {
            return {
              success: false,
              message: validationError,
              reservation: null,
              conflicts: []
            };
          }

          const conflicts = reservations.filter(reservation => 
            reservation.id !== input.id &&
            reservation.spaceId === existingReservation.spaceId &&
            reservation.status !== 'CANCELLED' &&
            isDateRangeConflicting(
              newStartTime,
              newEndTime,
              new Date(reservation.startTime),
              new Date(reservation.endTime)
            )
          );

          if (conflicts.length > 0) {
            return {
              success: false,
              message: `Conflit détecté avec ${conflicts.length} réservation(s) existante(s)`,
              reservation: null,
              conflicts
            };
          }
        }

        reservations[reservationIndex] = { ...existingReservation, ...input };
        return {
          success: true,
          message: 'Réservation mise à jour avec succès',
          reservation: reservations[reservationIndex],
          conflicts: []
        };
      } catch (error) {
        return {
          success: false,
          message: 'Erreur lors de la mise à jour de la réservation',
          reservation: null,
          conflicts: []
        };
      }
    },

    cancelReservation: (_: any, { id }: { id: string }) => {
      try {
        const reservationIndex = reservations.findIndex(res => res.id === id);
        if (reservationIndex === -1) {
          return {
            success: false,
            message: 'Réservation non trouvée',
            reservation: null,
            conflicts: []
          };
        }

        reservations[reservationIndex].status = 'CANCELLED';
        return {
          success: true,
          message: 'Réservation annulée avec succès',
          reservation: reservations[reservationIndex],
          conflicts: []
        };
      } catch (error) {
        return {
          success: false,
          message: 'Erreur lors de l\'annulation de la réservation',
          reservation: null,
          conflicts: []
        };
      }
    }
  },

  // Résolveurs pour les relations
  User: {
    reservations: (user: User) => reservations.filter(res => res.userId === user.id)
  },

  Space: {
    reservations: (space: Space) => reservations.filter(res => res.spaceId === space.id)
  },

  Reservation: {
    user: (reservation: Reservation) => users.find(user => user.id === reservation.userId),
    space: (reservation: Reservation) => spaces.find(space => space.id === reservation.spaceId)
  }
};
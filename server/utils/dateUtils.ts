/**
 * Vérifie si deux plages de dates se chevauchent
 */
export function isDateRangeConflicting(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Valide les heures de réservation
 */
export function validateReservationTime(startTime: Date, endTime: Date): string | null {
  const now = new Date();
  
  // Vérifier que la date de début est dans le futur
  if (startTime <= now) {
    return 'La réservation doit commencer dans le futur';
  }
  
  // Vérifier que la date de fin est après la date de début
  if (endTime <= startTime) {
    return 'La date de fin doit être après la date de début';
  }
  
  // Vérifier la durée minimale (15 minutes)
  const minDuration = 15 * 60 * 1000; // 15 minutes en milliseconds
  if (endTime.getTime() - startTime.getTime() < minDuration) {
    return 'La durée minimale de réservation est de 15 minutes';
  }
  
  // Vérifier la durée maximale (8 heures)
  const maxDuration = 8 * 60 * 60 * 1000; // 8 heures en milliseconds
  if (endTime.getTime() - startTime.getTime() > maxDuration) {
    return 'La durée maximale de réservation est de 8 heures';
  }
  
  // Vérifier les heures d'ouverture (7h - 22h)
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  
  if (startHour < 7 || startHour >= 22) {
    return 'Les réservations sont possibles de 7h à 22h uniquement';
  }
  
  if (endHour > 22 || (endHour === 22 && endTime.getMinutes() > 0)) {
    return 'Les réservations doivent se terminer avant 22h';
  }
  
  return null; // Pas d'erreur
}

/**
 * Formate une date pour l'affichage
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calcule la durée entre deux dates en minutes
 */
export function calculateDurationInMinutes(startTime: Date, endTime: Date): number {
  return Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
}
# Système de Réservation Intelligente pour Espaces de Coworking

##  Description du Projet

Un système web complet pour automatiser la gestion des réservations d'espaces de coworking. Cette solution remplace les méthodes manuelles (cahier physique, Google Sheets) par un système intelligent qui évite automatiquement les conflits d'horaires.

## Analyse du Problème

### Problématiques identifiées :
- **Conflits de réservation** : Double-booking d'espaces
- **Gestion manuelle** : Erreurs humaines et inefficacité  
- **Manque de visibilité** : Difficulté à voir les créneaux disponibles
- **Pas de traçabilité** : Historique des réservations inexistant

### Solution proposée :
Un système web avec interface intuitive et API GraphQL pour automatiser complètement le processus de réservation.

##  Architecture du Système

### Entités Principales

```
User (Utilisateur)
├── id: String (UUID)
├── name: String
├── email: String (unique)
├── role: Enum (USER, ADMIN)
└── createdAt: Date

Space (Espace)
├── id: String (UUID)
├── name: String
├── type: Enum (OFFICE, MEETING_ROOM, PHONE_BOOTH)
├── capacity: Int
├── amenities: [String]
└── isActive: Boolean

Reservation (Réservation)
├── id: String (UUID)
├── userId: String
├── spaceId: String
├── startTime: Date
├── endTime: Date
├── status: Enum (PENDING, CONFIRMED, CANCELLED)
├── purpose: String
└── createdAt: Date
```

### Relations
- **User** ↔ **Reservation** : One-to-Many (Un utilisateur peut avoir plusieurs réservations)
- **Space** ↔ **Reservation** : One-to-Many (Un espace peut avoir plusieurs réservations)

##  Fonctionnalités

### Pour les Utilisateurs
-  Visualiser les espaces disponibles
-  Créer des réservations avec vérification automatique des conflits
-  Modifier/Annuler ses réservations
-  Consulter l'historique de ses réservations

### Pour les Administrateurs
-  Gérer les espaces (ajout, modification, suppression)
-  Visualiser toutes les réservations
-  Approuver/Rejeter les réservations
-  Exporter les données de réservation

##  Schéma GraphQL

### Types principaux

```graphql
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
```

### Queries principales

```graphql
# Récupérer tous les espaces disponibles
query GetAvailableSpaces($startTime: String!, $endTime: String!) {
  availableSpaces(startTime: $startTime, endTime: $endTime) {
    id
    name
    type
    capacity
    amenities
  }
}

# Récupérer les réservations d'un utilisateur
query GetUserReservations($userId: ID!) {
  userReservations(userId: $userId) {
    id
    space {
      name
      type
    }
    startTime
    endTime
    status
    purpose
  }
}
```

### Mutations principales

```graphql
# Créer une réservation
mutation CreateReservation($input: CreateReservationInput!) {
  createReservation(input: $input) {
    success
    message
    reservation {
      id
      startTime
      endTime
      space {
        name
      }
    }
    conflicts {
      id
      startTime
      endTime
    }
  }
}

# Créer un espace
mutation CreateSpace($input: CreateSpaceInput!) {
  createSpace(input: $input) {
    success
    message
    space {
      id
      name
      type
      capacity
    }
  }
}
```

##  Installation et Utilisation

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd coworkingspace

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

### URLs d'accès
- **Interface utilisateur** : http://localhost:5173
- **GraphQL Playground** : http://localhost:4000/graphql

## Exemples d'Utilisation

### 1. Créer une réservation

**Requête GraphQL :**
```graphql
mutation {
  createReservation(input: {
    userId: "user-123"
    spaceId: "space-456"
    startTime: "2024-01-15T09:00:00Z"
    endTime: "2024-01-15T11:00:00Z"
    purpose: "Réunion équipe marketing"
  }) {
    success
    message
    reservation {
      id
      space {
        name
      }
    }
    conflicts {
      id
      startTime
      endTime
    }
  }
}
```

**Réponse :**
```json
{
  "data": {
    "createReservation": {
      "success": true,
      "message": "Réservation créée avec succès",
      "reservation": {
        "id": "res-789",
        "space": {
          "name": "Salle de réunion A"
        }
      },
      "conflicts": []
    }
  }
}
```

### 2. Vérifier les espaces disponibles

**Requête GraphQL :**
```graphql
query {
  availableSpaces(
    startTime: "2024-01-15T14:00:00Z"
    endTime: "2024-01-15T16:00:00Z"
  ) {
    id
    name
    type
    capacity
    amenities
  }
}
```

**Réponse :**
```json
{
  "data": {
    "availableSpaces": [
      {
        "id": "space-001",
        "name": "Bureau individuel 1",
        "type": "OFFICE",
        "capacity": 1,
        "amenities": ["WiFi", "Prise électrique", "Éclairage LED"]
      },
      {
        "id": "space-002", 
        "name": "Salle de réunion B",
        "type": "MEETING_ROOM",
        "capacity": 8,
        "amenities": ["Projecteur", "Tableau blanc", "WiFi", "Climatisation"]
      }
    ]
  }
}
```

## Structure du Projet

```
coworking-reservation-system/
├── src/                          # Frontend React
│   ├── components/              # Composants réutilisables
│   ├── pages/                   # Pages principales
│   ├── hooks/                   # Hooks personnalisés
│   ├── utils/                   # Fonctions utilitaires
│   └── types/                   # Types TypeScript
├── server/                      # Backend GraphQL
│   ├── schema/                  # Schémas GraphQL
│   ├── resolvers/              # Résolveurs GraphQL
│   ├── models/                 # Modèles de données
│   └── data/                   # Données en mémoire
└── docs/                       # Documentation
```

## Fonctionnalités Techniques

- **Frontend** : React 18 + TypeScript + Tailwind CSS
- **Backend** : Node.js + Apollo Server + GraphQL
- **État** : Apollo Client pour la gestion de cache
- **Validation** : Validation automatique des conflits d'horaires
- **Responsive** : Interface adaptée mobile/desktop
- **Temps réel** : Mises à jour automatiques des disponibilités

##  Évolutions Futures

- Intégration base de données PostgreSQL
- Système de notifications push/email
- API REST en complément de GraphQL  
- Intégration calendrier externe (Google Calendar, Outlook)
- Analytics et reporting 



**Développé  pour optimiser la gestion des espaces de coworking**
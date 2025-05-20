import * as React from 'react';
import { useState } from 'react';


import { useQuery, useMutation } from '@apollo/client';
import { Calendar, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { GET_RESERVATIONS, GET_SPACES, GET_USERS } from '../graphql/queries';
import { CREATE_RESERVATION, UPDATE_RESERVATION, CANCEL_RESERVATION } from '../graphql/mutations';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessages';
import SuccessMessage from '../components/SuccessMessage';
import { Reservation, Space, User } from '../types';

export default function Reservations() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { loading, error, data, refetch } = useQuery(GET_RESERVATIONS);
  const { data: spacesData } = useQuery(GET_SPACES);
  const { data: usersData } = useQuery(GET_USERS);

  const [createReservation] = useMutation(CREATE_RESERVATION);
  const [updateReservation] = useMutation(UPDATE_RESERVATION);
  const [cancelReservation] = useMutation(CANCEL_RESERVATION);

  if (loading) return <LoadingSpinner className="py-12" />;
  if (error) return <ErrorMessage message={error.message} />;

  const reservations: Reservation[] = data?.reservations || [];
  const spaces: Space[] = spacesData?.spaces || [];
  const users: User[] = usersData?.users || [];

  const handleCreateReservation = async (formData: any) => {
    try {
      const result = await createReservation({
        variables: { input: formData }
      });

      if (result.data?.createReservation.success) {
        setMessage({ type: 'success', text: result.data.createReservation.message });
        setShowCreateForm(false);
        refetch();
      } else {
        setMessage({ type: 'error', text: result.data?.createReservation.message || 'Erreur lors de la création' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la création de la réservation' });
    }
  };

  const handleCancelReservation = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;

    try {
      const result = await cancelReservation({ variables: { id } });
      if (result.data?.cancelReservation.success) {
        setMessage({ type: 'success', text: 'Réservation annulée avec succès' });
        refetch();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'annulation' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Réservations</h1>
          <p className="text-gray-600">Gérez toutes les réservations d'espaces</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvelle réservation</span>
        </button>
      </div>

      {message && (
        <div className="mb-4">
          {message.type === 'success' ? (
            <SuccessMessage message={message.text} />
          ) : (
            <ErrorMessage message={message.text} />
          )}
        </div>
      )}

      {/* Liste des réservations */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Toutes les réservations ({reservations.length})
          </h2>
        </div>
        
        {reservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Espace
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date & Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <ReservationRow
                    key={reservation.id}
                    reservation={reservation}
                    onCancel={handleCancelReservation}
                    onEdit={setEditingReservation}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune réservation trouvée</p>
          </div>
        )}
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <ReservationForm
          spaces={spaces}
          users={users}
          onSubmit={handleCreateReservation}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}

interface ReservationRowProps {
  reservation: Reservation;
  onCancel: (id: string) => Promise<void>;
  onEdit: (reservation: Reservation) => void;
}

function ReservationRow({ reservation, onCancel, onEdit }: ReservationRowProps) {
  const startTime = new Date(reservation.startTime);
  const endTime = new Date(reservation.endTime);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  const statusColors = {
    CONFIRMED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{reservation.space.name}</div>
          <div className="text-sm text-gray-500">{reservation.space.type}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{reservation.user.name}</div>
        <div className="text-sm text-gray-500">{reservation.user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {startTime.toLocaleDateString('fr-FR')}
        </div>
        <div className="text-sm text-gray-500">
          {startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - 
          {endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          {duration} min
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[reservation.status]}`}>
          {reservation.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(reservation)}
            className="text-blue-600 hover:text-blue-900"
            disabled={reservation.status === 'CANCELLED'}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onCancel(reservation.id)}
            className="text-red-600 hover:text-red-900"
            disabled={reservation.status === 'CANCELLED'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface ReservationFormProps {
  spaces: Space[];
  users: User[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: Reservation;
}

function ReservationForm({ spaces, users, onSubmit, onCancel, initialData }: ReservationFormProps) {
  const [formData, setFormData] = useState({
    userId: initialData?.user.id || '',
    spaceId: initialData?.space.id || '',
    startTime: initialData ? new Date(initialData.startTime).toISOString().slice(0, 16) : '',
    endTime: initialData ? new Date(initialData.endTime).toISOString().slice(0, 16) : '',
    purpose: initialData?.purpose || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData ? 'Modifier la réservation' : 'Nouvelle réservation'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utilisateur
            </label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un utilisateur</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Espace
            </label>
            <select
              value={formData.spaceId}
              onChange={(e) => setFormData({ ...formData, spaceId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un espace</option>
              {spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name} - {space.type} (Capacité: {space.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Début
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fin
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objectif (optionnel)
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Décrivez l'objectif de cette réservation..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {initialData ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
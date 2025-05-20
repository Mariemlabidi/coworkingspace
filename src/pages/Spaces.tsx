import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Building2, Plus, Edit, Trash2, Users } from 'lucide-react';
import { GET_SPACES } from '../graphql/queries';
import { CREATE_SPACE, UPDATE_SPACE, DELETE_SPACE } from '../graphql/mutations';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessages';
import SuccessMessage from '../components/SuccessMessage';
import { Space } from '../types/index';

const SPACE_TYPES = {
  OFFICE: 'Bureau',
  MEETING_ROOM: 'Salle de réunion',
  PHONE_BOOTH: 'Cabine téléphonique',
  COMMON_AREA: 'Espace commun'
};

export default function Spaces() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { loading, error, data, refetch } = useQuery(GET_SPACES);
  const [createSpace] = useMutation(CREATE_SPACE);
  const [updateSpace] = useMutation(UPDATE_SPACE);
  const [deleteSpace] = useMutation(DELETE_SPACE);

  if (loading) return <LoadingSpinner className="py-12" />;
  if (error) return <ErrorMessage message={error.message} />;

  const spaces: Space[] = data?.spaces || [];

  const handleCreateSpace = async (formData: any) => {
    try {
      const result = await createSpace({
        variables: { input: formData }
      });

      if (result.data?.createSpace.success) {
        setMessage({ type: 'success', text: result.data.createSpace.message });
        setShowCreateForm(false);
        refetch();
      } else {
        setMessage({ type: 'error', text: result.data?.createSpace.message || 'Erreur lors de la création' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la création de l\'espace' });
    }
  };

  const handleUpdateSpace = async (formData: any) => {
    if (!editingSpace) return;
    
    try {
      const result = await updateSpace({
        variables: { id: editingSpace.id, input: formData }
      });

      if (result.data?.updateSpace.success) {
        setMessage({ type: 'success', text: result.data.updateSpace.message });
        setEditingSpace(null);
        refetch();
      } else {
        setMessage({ type: 'error', text: result.data?.updateSpace.message || 'Erreur lors de la mise à jour' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour de l\'espace' });
    }
  };

  const handleDeleteSpace = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet espace ?')) return;

    try {
      const result = await deleteSpace({ variables: { id } });
      if (result.data?.deleteSpace.success) {
        setMessage({ type: 'success', text: 'Espace supprimé avec succès' });
        refetch();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Espaces</h1>
          <p className="text-gray-600">Gérez les espaces de coworking disponibles</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvel espace</span>
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

      {/* Grille des espaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            onEdit={setEditingSpace}
            onDelete={handleDeleteSpace}
          />
        ))}
      </div>

      {spaces.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Aucun espace configuré</p>
        </div>
      )}

      {/* Formulaire de création */}
      {showCreateForm && (
        <SpaceForm
          onSubmit={handleCreateSpace}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Formulaire de modification */}
      {editingSpace && (
        <SpaceForm
          initialData={editingSpace}
          onSubmit={handleUpdateSpace}
          onCancel={() => setEditingSpace(null)}
        />
      )}
    </div>
  );
}

interface SpaceCardProps {
  space: Space;
  onEdit: (space: Space) => void;
  onDelete: (id: string) => void;
}

function SpaceCard({ space, onEdit, onDelete }: SpaceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{space.name}</h3>
            <p className="text-sm text-gray-500">{SPACE_TYPES[space.type]}</p>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(space)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(space.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Users className="h-4 w-4 mr-1" />
          <span>Capacité: {space.capacity} personne{space.capacity > 1 ? 's' : ''}</span>
        </div>

        {space.description && (
          <p className="text-sm text-gray-600 mb-4">{space.description}</p>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Équipements:</h4>
          <div className="flex flex-wrap gap-1">
            {space.amenities.map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              space.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {space.isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SpaceFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: Space;
}

function SpaceForm({ onSubmit, onCancel, initialData }: SpaceFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'OFFICE',
    capacity: initialData?.capacity || 1,
    description: initialData?.description || '',
    amenities: initialData?.amenities.join(', ') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData ? 'Modifier l\'espace' : 'Nouvel espace'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'espace
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'espace
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(SPACE_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacité (personnes)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnelle)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Équipements (séparés par des virgules)
            </label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="WiFi, Projecteur, Tableau blanc..."
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
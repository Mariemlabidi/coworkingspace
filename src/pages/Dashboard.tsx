import React from 'react';
import { useQuery } from '@apollo/client';
import { Calendar, Users, Building2, Clock } from 'lucide-react';
import { GET_DASHBOARD_STATS } from '../graphql/queries';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessages';

const GET_DASHBOARD_STATS_QUERY = `
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
    }
    users {
      id
      name
      role
    }
  }
`;

export default function Dashboard() {
  const { loading, error, data } = useQuery(GET_DASHBOARD_STATS, {
    pollInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  if (loading) return <LoadingSpinner className="py-12" />;
  if (error) return <ErrorMessage message={error.message} />;

  const stats = data ? calculateStats(data) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre espace de coworking</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Espaces actifs"
          value={stats?.activeSpaces || 0}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Réservations aujourd'hui"
          value={stats?.todayReservations || 0}
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Utilisateurs"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Taux d'occupation"
          value={`${stats?.occupationRate || 0}%`}
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Réservations récentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Réservations récentes</h2>
        </div>
        <div className="p-6">
          {stats?.recentReservations?.length ? (
            <div className="space-y-4">
              {stats.recentReservations.map((reservation: any) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{reservation.space?.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(reservation.startTime).toLocaleString('fr-FR')} - 
                      {new Date(reservation.endTime).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reservation.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : reservation.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune réservation récente</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function calculateStats(data: any) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const activeSpaces = data.spaces?.filter((space: any) => space.isActive).length || 0;
  const totalUsers = data.users?.length || 0;
  
  const todayReservations = data.reservations?.filter((res: any) => {
    const resDate = new Date(res.startTime);
    return resDate >= today && resDate < tomorrow;
  }).length || 0;

  const confirmedReservations = data.reservations?.filter((res: any) => 
    res.status === 'CONFIRMED'
  ).length || 0;
  
  const occupationRate = activeSpaces > 0 
    ? Math.round((confirmedReservations / activeSpaces) * 100) 
    : 0;

  const recentReservations = data.reservations
    ?.slice()
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return {
    activeSpaces,
    totalUsers,
    todayReservations,
    occupationRate,
    recentReservations,
  };
}
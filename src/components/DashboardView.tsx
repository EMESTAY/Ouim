import React from 'react';
import { useDataStore } from '../stores/useDataStore';
import { Activity, Dumbbell, Scale, TrendingUp } from 'lucide-react';
import { Card } from './ui/Card';

export const DashboardView: React.FC = () => {
  const { data } = useDataStore();

  if (!data) return null;

  const totalWorkouts = data.workoutHistory.length;
  const totalSessions = Object.keys(data.sessions).length;
  const lastMeasurement = data.bodyMeasurements?.slice(-1)[0];

  // tonnage total
  const totalTonnage = data.workoutHistory.reduce((total, workout) => {
    return (
      total +
      workout.exercises.reduce((exTotal, exercise) => {
        return (
          exTotal +
          exercise.sets.reduce((setTotal, set) => {
            return setTotal + set.reps * set.weight;
          }, 0)
        );
      }, 0)
    );
  }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
        <p className="text-neutral-400">Vue d'ensemble de vos données d'entraînement</p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="text-blue-400" />}
          label="Total Workouts"
          value={totalWorkouts}
        />
        <StatCard
          icon={<Dumbbell className="text-purple-400" />}
          label="Sessions Définies"
          value={totalSessions}
        />
        <StatCard
          icon={<TrendingUp className="text-green-400" />}
          label="Tonnage Total"
          value={`${(totalTonnage / 1000).toFixed(1)}t`}
        />
        <StatCard
          icon={<Scale className="text-orange-400" />}
          label="Dernier Poids"
          value={lastMeasurement?.weight ? `${lastMeasurement.weight}kg` : '-'}
        />
      </div>

      {/* info rapide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* entrainements recents */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} className="text-gym-blue" />
            Derniers Entraînements
          </h3>
          {data.workoutHistory.length === 0 ? (
            <p className="text-neutral-500">Aucun entraînement enregistré</p>
          ) : (
            <div className="space-y-3">
              {data.workoutHistory
                .slice(-5)
                .reverse()
                .map((workout) => {
                  const session = (data.sessions as Record<string, SessionRoutine>)[
                    workout.sessionId
                  ];
                  return (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
                      <div>
                        <p className="font-medium">{session?.name || workout.sessionId}</p>
                        <p className="text-sm text-neutral-500">
                          {new Date(workout.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span className="text-sm text-neutral-400">
                        {workout.exercises.length} exercices
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>

        {/* apercu sessions */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Dumbbell size={20} className="text-gym-purple" />
            Sessions du Programme
          </h3>
          {Object.keys(data.sessions).length === 0 ? (
            <p className="text-neutral-500">Aucune session définie</p>
          ) : (
            <div className="space-y-3">
              {Object.values(data.sessions)
                .slice(0, 5)
                .map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
                    <div>
                      <p className="font-medium">{session.name}</p>
                      <p className="text-sm text-neutral-500">{session.subtitle}</p>
                    </div>
                    <span className="text-sm text-neutral-400">
                      {session.sections.reduce((acc, s) => acc + s.machines.length, 0)} exercices
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// composant statcard
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
}> = ({ icon, label, value }) => (
  <Card className="flex flex-col gap-2 relative overflow-hidden group">
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <p className="text-neutral-400 text-sm font-medium">{label}</p>
    </div>
    <div className="mt-2">
      <p className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
        {value}
      </p>
    </div>
    {/* lueur fond */}
    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-white/5 to-white/0 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500" />
  </Card>
);

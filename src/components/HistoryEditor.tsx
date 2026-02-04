import React, { useState } from 'react';
import { useDataStore } from '../stores/useDataStore';
import { Button, Input, Modal } from './ui';
import { Card } from './ui/Card';
import { Trash2, ChevronDown, ChevronRight, Edit2, Plus } from 'lucide-react';
import type { WorkoutLog, Set, SessionRoutine } from '../types';

export const HistoryEditor: React.FC = () => {
  const { data, updateData } = useDataStore();
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<{
    workoutIdx: number;
    exerciseIdx: number;
    setIdx: number;
    set: Set;
  } | null>(null);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);

  if (!data) return null;

  const workouts = [...data.workoutHistory].sort((a, b) => b.date - a.date);
  const sessions = Object.values(data.sessions);

  const handleDeleteWorkout = (workoutId: string) => {
    updateData({
      workoutHistory: data.workoutHistory.filter((w) => w.id !== workoutId),
    });
  };

  const handleAddWorkout = (newWorkout: WorkoutLog) => {
    updateData({
      workoutHistory: [...data.workoutHistory, newWorkout],
    });
    setIsAddingWorkout(false);
  };

  const handleUpdateSet = (
    workoutIdx: number,
    exerciseIdx: number,
    setIdx: number,
    updatedSet: Set
  ) => {
    const workout = workouts[workoutIdx];
    const newWorkouts = data.workoutHistory.map((w) => {
      if (w.id === workout.id) {
        const newExercises = w.exercises.map((ex, eIdx) => {
          if (eIdx === exerciseIdx) {
            return {
              ...ex,
              sets: ex.sets.map((s, sIdx) => (sIdx === setIdx ? updatedSet : s)),
            };
          }
          return ex;
        });
        return { ...w, exercises: newExercises };
      }
      return w;
    });
    updateData({ workoutHistory: newWorkouts });
    setEditingSet(null);
  };

  const handleDeleteSet = (workoutId: string, exerciseIdx: number, setIdx: number) => {
    const newWorkouts = data.workoutHistory.map((w) => {
      if (w.id === workoutId) {
        const newExercises = w.exercises.map((ex, eIdx) => {
          if (eIdx === exerciseIdx) {
            return {
              ...ex,
              sets: ex.sets.filter((_, sIdx) => sIdx !== setIdx),
            };
          }
          return ex;
        });
        return { ...w, exercises: newExercises };
      }
      return w;
    });
    updateData({ workoutHistory: newWorkouts });
  };

  const handleAddSet = (workoutId: string, exerciseIdx: number) => {
    const newWorkouts = data.workoutHistory.map((w) => {
      if (w.id === workoutId) {
        const newExercises = w.exercises.map((ex, eIdx) => {
          if (eIdx === exerciseIdx) {
            const lastSet = ex.sets[ex.sets.length - 1];
            const newSet: Set = {
              reps: lastSet?.reps || 10,
              weight: lastSet?.weight || 0,
              timestamp: Date.now(),
            };
            return { ...ex, sets: [...ex.sets, newSet] };
          }
          return ex;
        });
        return { ...w, exercises: newExercises };
      }
      return w;
    });
    updateData({ workoutHistory: newWorkouts });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Historique</h2>
          <p className="text-neutral-400">Modifiez vos entraînements passés</p>
        </div>
        <Button variant="primary" onClick={() => setIsAddingWorkout(true)}>
          <Plus size={16} />
          Ajouter Workout
        </Button>
      </div>

      {workouts.length === 0 ? (
        <Card className="text-center py-12 text-neutral-400 border-dashed border-neutral-800">
          Aucun entraînement enregistré
        </Card>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout, workoutIdx) => {
            const session = (data.sessions as Record<string, SessionRoutine>)[workout.sessionId];
            const isExpanded = expandedWorkout === workout.id;

            return (
              <Card
                key={workout.id}
                className="border border-white/5 rounded-xl overflow-hidden bg-neutral-900/30 backdrop-blur-sm p-0">
                {/* entete */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-800/50 transition-colors"
                  onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}>
                  <button className="text-neutral-500">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                  <div className="flex-1">
                    <h3 className="font-semibold">{session?.name || workout.sessionId}</h3>
                    <p className="text-sm text-neutral-500">
                      {new Date(workout.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-neutral-500 mr-2">
                      {workout.exercises.length} exercices
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWorkout(workout.id)}>
                      <Trash2 size={14} className="text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* contenu etendu */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-4 space-y-4 bg-black/20">
                    {workout.exercises.map((exercise, exerciseIdx) => (
                      <div key={`${exercise.exerciseId}-${exerciseIdx}`} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{exercise.exerciseName}</h4>
                        </div>

                        {/* tableau series */}
                        <div className="ml-4 overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-neutral-500 text-xs">
                                <th className="text-left py-1 pr-4">Set</th>
                                <th className="text-left py-1 pr-4">Reps</th>
                                <th className="text-left py-1 pr-4">Poids</th>
                                <th className="text-right py-1">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {exercise.sets.map((set, setIdx) => (
                                <tr key={setIdx} className="border-t border-white/5">
                                  <td className="py-2 pr-4 text-neutral-400">{setIdx + 1}</td>
                                  <td className="py-2 pr-4">{set.reps}</td>
                                  <td className="py-2 pr-4">{set.weight}kg</td>
                                  <td className="py-2 text-right">
                                    <div className="flex justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          setEditingSet({ workoutIdx, exerciseIdx, setIdx, set })
                                        }>
                                        <Edit2 size={12} />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteSet(workout.id, exerciseIdx, setIdx)
                                        }>
                                        <Trash2 size={12} className="text-red-400" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleAddSet(workout.id, exerciseIdx)}>
                            <Plus size={12} />
                            Ajouter Série
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {editingSet && (
        <SetFormModal
          set={editingSet.set}
          onSave={(updated) =>
            handleUpdateSet(
              editingSet.workoutIdx,
              editingSet.exerciseIdx,
              editingSet.setIdx,
              updated
            )
          }
          onClose={() => setEditingSet(null)}
        />
      )}

      {/* modale workout */}
      <AddWorkoutModal
        isOpen={isAddingWorkout}
        onClose={() => setIsAddingWorkout(false)}
        onSave={handleAddWorkout}
        sessions={sessions}
      />
    </div>
  );
};

// formulaire serie
const SetFormModal: React.FC<{
  set: Set;
  onSave: (set: Set) => void;
  onClose: () => void;
}> = ({ set, onSave, onClose }) => {
  const [reps, setReps] = useState(set.reps);
  const [weight, setWeight] = useState(set.weight);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...set, reps: Number(reps), weight: Number(weight) });
  };

  return (
    <Modal isOpen onClose={onClose} title="Modifier Série" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Répétitions"
            type="number"
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
            min={1}
          />
          <Input
            label="Poids (kg)"
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            min={0}
            step={0.5}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary">
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// modale workout
const AddWorkoutModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (workout: WorkoutLog) => void;
  sessions: SessionRoutine[];
}> = ({ isOpen, onClose, onSave, sessions }) => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  const handleSave = () => {
    if (!selectedSessionId) return;

    const session = sessions.find((s) => s.id === selectedSessionId);
    if (!session) return;

    // Create a new workout log based on the session template
    const newWorkout: WorkoutLog = {
      id: `workout-${Date.now()}`,
      sessionId: session.id,
      date: new Date(date).getTime(),
      exercises: session.sections
        .flatMap((section) => section.machines)
        .map((machine) => ({
          exerciseId: machine.exerciseId || machine.id,
          exerciseName: machine.name,
          sets: Array(machine.targetSets).fill({
            reps: machine.targetReps,
            weight: machine.targetWeight,
            timestamp: Date.now(),
          }),
        })),
    };

    onSave(newWorkout);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un Entraînement">
      <div className="space-y-4">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Séance effectuée
          </label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white appearance-none focus:outline-none focus:border-blue-500">
            <option value="">Choisir une séance...</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 text-sm text-neutral-500">
          <p>
            Cela créera un historique basé sur les objectifs de la séance sélectionnée. Vous pourrez
            ensuite modifier les séries, le poids et les répétitions dans l'éditeur.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!selectedSessionId}>
            Créer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Dumbbell, Search } from 'lucide-react';
import { useDataStore } from '../stores/useDataStore';
import { Button, Input, Modal } from './ui';
import type { Exercise, MuscleGroup } from '../types';

export const ExercisesEditor: React.FC = () => {
  const { data, updateData } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!data) return null;

  const exercises = data.exercises || [];

  // Filter exercises by search
  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by muscle group
  const groupedExercises = filteredExercises.reduce(
    (acc, ex) => {
      const group = ex.muscle_group || 'Autre';
      if (!acc[group]) acc[group] = [];
      acc[group].push(ex);
      return acc;
    },
    {} as Record<string, Exercise[]>
  );

  const handleSaveExercise = (exercise: Partial<Exercise>) => {
    if (!exercise.name) return;

    const updatedExercises = editingExercise
      ? exercises.map((ex) => (ex.id === editingExercise.id ? { ...ex, ...exercise } : ex))
      : [
          ...exercises,
          {
            id: `exercise_${new Date().getTime()}`,
            name: exercise.name,
            muscle_group: exercise.muscle_group || null,
            equipment: exercise.equipment || null,
            notes: exercise.notes || null,
            created_at: new Date().getTime(),
          } as Exercise,
        ];

    updateData({ exercises: updatedExercises });
    setIsModalOpen(false);
    setEditingExercise(null);
  };

  const handleDeleteExercise = (id: string) => {
    if (!confirm('Supprimer cet exercice ?')) return;
    updateData({ exercises: exercises.filter((ex) => ex.id !== id) });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bibliothèque d'Exercices</h2>
          <p className="text-neutral-400 text-sm mt-1">{exercises.length} exercices</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingExercise(null);
            setIsModalOpen(true);
          }}>
          <Plus size={16} />
          Ajouter
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          placeholder="Rechercher un exercice..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Exercise Groups */}
      {Object.entries(groupedExercises).map(([group, exs]) => (
        <div key={group} className="space-y-3">
          <h3 className="text-lg font-semibold text-neutral-300 flex items-center gap-2">
            <Dumbbell size={18} className="text-blue-400" />
            {group}
            <span className="text-sm text-neutral-500">({exs.length})</span>
          </h3>

          <div className="grid gap-2">
            {exs.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors">
                <div>
                  <p className="font-medium">{exercise.name}</p>
                  <div className="flex gap-3 text-sm text-neutral-500 mt-1">
                    {exercise.equipment && <span>{exercise.equipment}</span>}
                    {exercise.notes && (
                      <span className="truncate max-w-[200px]">{exercise.notes}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingExercise(exercise);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filteredExercises.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          <Dumbbell size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aucun exercice trouvé</p>
        </div>
      )}

      {/* Exercise Form Modal */}
      <ExerciseFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExercise(null);
        }}
        onSave={handleSaveExercise}
        exercise={editingExercise}
      />
    </div>
  );
};

// Exercise Form Modal
interface ExerciseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: Partial<Exercise>) => void;
  exercise: Exercise | null;
}

const MUSCLE_GROUPS = ['Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Abdos', 'Cardio'];

const EQUIPMENT_TYPES = ['Barre', 'Haltères', 'Machine', 'Poulie', 'Poids du corps', 'Autre'];

const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  exercise,
}) => {
  const [name, setName] = useState(exercise?.name || '');
  const [muscleGroup, setMuscleGroup] = useState(exercise?.muscle_group || '');
  const [equipment, setEquipment] = useState(exercise?.equipment || '');
  const [notes, setNotes] = useState(exercise?.notes || '');

  React.useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      setMuscleGroup(exercise.muscle_group || '');
      setEquipment(exercise.equipment || '');
      setNotes(exercise.notes || '');
    } else {
      setName('');
      setMuscleGroup('');
      setEquipment('');
      setNotes('');
    }
  }, [exercise, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exercise ? 'Modifier Exercice' : 'Nouvel Exercice'}>
      <div className="space-y-4">
        <Input
          label="Nom de l'exercice"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Développé couché"
        />

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Groupe musculaire
          </label>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setMuscleGroup(group)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  muscleGroup === group
                    ? 'bg-blue-500 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}>
                {group}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Équipement</label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_TYPES.map((eq) => (
              <button
                key={eq}
                type="button"
                onClick={() => setEquipment(eq)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  equipment === eq
                    ? 'bg-purple-500 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}>
                {eq}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Notes (optionnel)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Instructions, conseils..."
        />

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              onSave({
                name,
                muscle_group: (muscleGroup || null) as unknown as MuscleGroup,
                equipment,
                notes,
              })
            }
            className="flex-1"
            disabled={!name.trim()}>
            {exercise ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

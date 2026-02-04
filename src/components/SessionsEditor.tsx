import React, { useState } from 'react';
import { useDataStore } from '../stores/useDataStore';
import { Button, Input, Modal } from './ui';
import { Card } from './ui/Card';
import { Plus, Trash2, ChevronDown, ChevronRight, Edit2, GripVertical } from 'lucide-react';
import type { SessionRoutine, Section, Machine } from '../types';

export const SessionsEditor: React.FC = () => {
  const { data, updateData } = useDataStore();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<SessionRoutine | null>(null);
  const [isAddingSession, setIsAddingSession] = useState(false);

  if (!data) return null;

  const sessions = Object.values(data.sessions);

  const handleDeleteSession = (sessionId: string) => {
    const newSessions = { ...data.sessions };
    delete newSessions[sessionId];
    updateData({ sessions: newSessions });
  };

  const handleSaveSession = (session: SessionRoutine) => {
    updateData({
      sessions: {
        ...data.sessions,
        [session.id]: session,
      },
    });
    setEditingSession(null);
    setIsAddingSession(false);
  };

  const handleAddSession = () => {
    const newSession: SessionRoutine = {
      id: `session-${Date.now()}`,
      name: 'Nouvelle Session',
      subtitle: 'Description de la session',
      sections: [],
    };
    setEditingSession(newSession);
    setIsAddingSession(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Sessions</h2>
          <p className="text-neutral-400">Gérez vos sessions d'entraînement</p>
        </div>
        <Button variant="primary" onClick={handleAddSession}>
          <Plus size={16} />
          Ajouter Session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card className="text-center py-12 text-neutral-400 border-dashed border-neutral-800">
          <p>Aucune session. Cliquez sur "Ajouter Session" pour commencer.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isExpanded={expandedSession === session.id}
              onToggle={() =>
                setExpandedSession(expandedSession === session.id ? null : session.id)
              }
              onEdit={() => setEditingSession(session)}
              onDelete={() => handleDeleteSession(session.id)}
              onUpdate={(updated) => handleSaveSession(updated)}
            />
          ))}
        </div>
      )}

      {/* modale session */}
      {editingSession && (
        <SessionFormModal
          session={editingSession}
          isNew={isAddingSession}
          onSave={handleSaveSession}
          onClose={() => {
            setEditingSession(null);
            setIsAddingSession(false);
          }}
        />
      )}
    </div>
  );
};

// carte session
const SessionCard: React.FC<{
  session: SessionRoutine;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (session: SessionRoutine) => void;
}> = ({ session, isExpanded, onToggle, onEdit, onDelete, onUpdate }) => {
  const [editingExercise, setEditingExercise] = useState<{
    sectionIdx: number;
    exerciseIdx: number;
  } | null>(null);

  const handleDeleteExercise = (sectionIdx: number, exerciseIdx: number) => {
    const newSections = [...session.sections];
    newSections[sectionIdx] = {
      ...newSections[sectionIdx],
      machines: newSections[sectionIdx].machines.filter((_, i) => i !== exerciseIdx),
    };
    onUpdate({ ...session, sections: newSections });
  };

  const handleUpdateExercise = (sectionIdx: number, exerciseIdx: number, updated: Machine) => {
    const newSections = [...session.sections];
    newSections[sectionIdx] = {
      ...newSections[sectionIdx],
      machines: newSections[sectionIdx].machines.map((m, i) => (i === exerciseIdx ? updated : m)),
    };
    onUpdate({ ...session, sections: newSections });
    setEditingExercise(null);
  };

  const handleAddExercise = (sectionIdx: number) => {
    const newExercise: Machine = {
      id: `exercise-${new Date().getTime()}`,
      name: 'Nouvel Exercice',
      targetSets: 3,
      targetReps: 10,
      targetWeight: 0,
      restTime: 90,
      completedSets: [],
    };
    const newSections = [...session.sections];
    newSections[sectionIdx] = {
      ...newSections[sectionIdx],
      machines: [...newSections[sectionIdx].machines, newExercise],
    };
    onUpdate({ ...session, sections: newSections });
  };

  const handleAddSection = () => {
    const newSection: Section = {
      title: 'Nouvelle Section',
      type: 'training',
      machines: [],
    };
    onUpdate({ ...session, sections: [...session.sections, newSection] });
  };

  const handleDeleteSection = (sectionIdx: number) => {
    onUpdate({
      ...session,
      sections: session.sections.filter((_, i) => i !== sectionIdx),
    });
  };

  return (
    <Card className="border border-white/5 rounded-xl overflow-hidden bg-neutral-900/30 backdrop-blur-sm p-0">
      {/* entete */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-800/50 transition-colors"
        onClick={onToggle}>
        <button className="text-neutral-500">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        <div className="flex-1">
          <h3 className="font-semibold">{session.name}</h3>
          <p className="text-sm text-neutral-500">{session.subtitle}</p>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <span className="text-xs text-neutral-500 mr-2">
            {session.sections.length} sections •{' '}
            {session.sections.reduce((acc, s) => acc + s.machines.length, 0)} exercices
          </span>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit2 size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 size={14} className="text-red-400" />
          </Button>
        </div>
      </div>

      {/* contenu etendu */}
      {isExpanded && (
        <div className="border-t border-white/5 p-4 space-y-4 bg-black/20">
          {session.sections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="space-y-2">
              <div className="flex items-center justify-between bg-neutral-800/30 px-3 py-2 rounded-lg border border-neutral-800/50">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold tracking-wider uppercase px-2 py-1 rounded ${
                      section.type === 'warmup'
                        ? 'text-orange-400 bg-orange-400/10'
                        : section.type === 'cardio'
                          ? 'text-red-400 bg-red-400/10'
                          : 'text-blue-400 bg-blue-400/10'
                    }`}>
                    {section.type === 'warmup'
                      ? 'Échauffement'
                      : section.type === 'cardio'
                        ? 'Cardio'
                        : 'Entraînement'}
                  </span>
                  <h4 className="font-medium text-neutral-300">{section.title}</h4>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleAddExercise(sectionIdx)}>
                    <Plus size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteSection(sectionIdx)}>
                    <Trash2 size={14} className="text-red-400" />
                  </Button>
                </div>
              </div>

              {/* exercices */}
              <div className="ml-2 space-y-2">
                {section.machines.map((exercise, exerciseIdx) => (
                  <div
                    key={exercise.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-all group">
                    <GripVertical
                      size={16}
                      className="text-neutral-600 group-hover:text-neutral-400 transition-colors cursor-grab active:cursor-grabbing"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-white">{exercise.name}</span>
                        {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                          <div className="flex gap-1">
                            {exercise.muscleGroups.map((muscle) => (
                              <span
                                key={muscle}
                                className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-[10px] uppercase font-bold tracking-wide">
                                {muscle}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-neutral-400">
                        <span className="bg-neutral-800/50 px-2 py-0.5 rounded text-xs">
                          {exercise.targetSets} × {exercise.targetReps}
                          {exercise.targetWeight > 0 ? ` @ ${exercise.targetWeight}kg` : ''}
                        </span>
                        {exercise.restTime > 0 && (
                          <span className="text-xs text-neutral-500">
                            {exercise.restTime}s repos
                          </span>
                        )}
                        {exercise.notes && (
                          <span className="text-xs text-neutral-500 italic truncate max-w-[200px]">
                            {exercise.notes}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingExercise({ sectionIdx, exerciseIdx })}>
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExercise(sectionIdx, exerciseIdx)}>
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))}
                {section.machines.length === 0 && (
                  <div className="text-center py-4 border border-dashed border-neutral-800 rounded-xl">
                    <p className="text-xs text-neutral-500">Aucun exercice dans cette section</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-blue-400 mt-1"
                      onClick={() => handleAddExercise(sectionIdx)}>
                      Ajouter un exercice
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <Button variant="secondary" size="sm" onClick={handleAddSection}>
            <Plus size={14} />
            Ajouter Section
          </Button>

          {/* modale exercice */}
          {editingExercise && (
            <ExerciseFormModal
              exercise={
                session.sections[editingExercise.sectionIdx].machines[editingExercise.exerciseIdx]
              }
              onSave={(updated) =>
                handleUpdateExercise(
                  editingExercise.sectionIdx,
                  editingExercise.exerciseIdx,
                  updated
                )
              }
              onClose={() => setEditingExercise(null)}
            />
          )}
        </div>
      )}
    </Card>
  );
};

// formulaire session
const SessionFormModal: React.FC<{
  session: SessionRoutine;
  isNew: boolean;
  onSave: (session: SessionRoutine) => void;
  onClose: () => void;
}> = ({ session, isNew, onSave, onClose }) => {
  const [name, setName] = useState(session.name);
  const [subtitle, setSubtitle] = useState(session.subtitle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...session, name, subtitle });
  };

  return (
    <Modal isOpen onClose={onClose} title={isNew ? 'Nouvelle Session' : 'Modifier Session'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom de la session"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input label="Sous-titre" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
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

// formulaire exercice
const ExerciseFormModal: React.FC<{
  exercise: Machine;
  onSave: (exercise: Machine) => void;
  onClose: () => void;
}> = ({ exercise, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: exercise.name,
    targetSets: exercise.targetSets,
    targetReps: exercise.targetReps,
    targetWeight: exercise.targetWeight,
    restTime: exercise.restTime,
    notes: exercise.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...exercise,
      ...form,
      targetSets: Number(form.targetSets),
      targetReps: Number(form.targetReps),
      targetWeight: Number(form.targetWeight),
      restTime: Number(form.restTime),
    });
  };

  return (
    <Modal isOpen onClose={onClose} title="Modifier Exercice" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Séries cibles"
            type="number"
            value={form.targetSets}
            onChange={(e) => setForm({ ...form, targetSets: Number(e.target.value) })}
            min={1}
          />
          <Input
            label="Répétitions cibles"
            type="number"
            value={form.targetReps}
            onChange={(e) => setForm({ ...form, targetReps: Number(e.target.value) })}
            min={1}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Poids cible (kg)"
            type="number"
            value={form.targetWeight}
            onChange={(e) => setForm({ ...form, targetWeight: Number(e.target.value) })}
            min={0}
            step={0.5}
          />
          <Input
            label="Temps de repos (s)"
            type="number"
            value={form.restTime}
            onChange={(e) => setForm({ ...form, restTime: Number(e.target.value) })}
            min={0}
          />
        </div>
        <Input
          label="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Notes optionnelles..."
        />
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

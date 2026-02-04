import React, { useState } from 'react';
import { useDataStore } from '../stores/useDataStore';
import { Button, Input, Modal } from './ui';
import { Plus, Trash2, Edit2, Scale, Droplets, Flame } from 'lucide-react';
import type { BodyMeasurement } from '../types';

export const BodyMeasurementsEditor: React.FC = () => {
  const { data, updateData } = useDataStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<BodyMeasurement | null>(null);

  if (!data) return null;

  const measurements = [...(data.bodyMeasurements || [])].sort((a, b) => b.date - a.date);

  const handleSave = (measurement: BodyMeasurement) => {
    const currentMeasurements = data.bodyMeasurements || [];
    const exists = currentMeasurements.some((m) => m.id === measurement.id);

    if (exists) {
      updateData({
        bodyMeasurements: currentMeasurements.map((m) =>
          m.id === measurement.id ? measurement : m
        ),
      });
    } else {
      updateData({
        bodyMeasurements: [...currentMeasurements, measurement],
      });
    }

    setEditingMeasurement(null);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    updateData({
      bodyMeasurements: (data.bodyMeasurements || []).filter((m) => m.id !== id),
    });
  };

  const handleAddNew = () => {
    const newMeasurement: BodyMeasurement = {
      id: `measurement-${Date.now()}`,
      date: Date.now(),
      weight: 0,
      height: null,
      bodyFat: null,
      muscleMass: null,
      waterPercentage: null,
      visceralFat: null,
      boneMass: null,
      bmr: null,
      metabolicAge: null,
      proteinPercentage: null,
    };
    setEditingMeasurement(newMeasurement);
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Mesures Corporelles</h2>
          <p className="text-neutral-400">Suivez l'évolution de votre composition corporelle</p>
        </div>
        <Button variant="primary" onClick={handleAddNew}>
          <Plus size={16} />
          Ajouter Mesure
        </Button>
      </div>

      {measurements.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-700 rounded-xl">
          Aucune mesure enregistrée. Cliquez sur "Ajouter Mesure" pour commencer.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-neutral-400 text-xs border-b border-neutral-800">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">
                  <div className="flex items-center gap-1">
                    <Scale size={14} />
                    Poids
                  </div>
                </th>
                <th className="text-left py-3 px-4">
                  <div className="flex items-center gap-1">
                    <Flame size={14} />
                    Graisse
                  </div>
                </th>
                <th className="text-left py-3 px-4">Muscle</th>
                <th className="text-left py-3 px-4">
                  <div className="flex items-center gap-1">
                    <Droplets size={14} />
                    Eau
                  </div>
                </th>
                <th className="text-left py-3 px-4">BMR</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                  <td className="py-3 px-4">
                    {new Date(m.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4 font-medium">{m.weight}kg</td>
                  <td className="py-3 px-4">{m.bodyFat != null ? `${m.bodyFat}%` : '-'}</td>
                  <td className="py-3 px-4">{m.muscleMass != null ? `${m.muscleMass}kg` : '-'}</td>
                  <td className="py-3 px-4">
                    {m.waterPercentage != null ? `${m.waterPercentage}%` : '-'}
                  </td>
                  <td className="py-3 px-4">{m.bmr != null ? `${m.bmr}kcal` : '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingMeasurement(m)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}>
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {editingMeasurement && (
        <MeasurementFormModal
          measurement={editingMeasurement}
          isNew={isAdding}
          onSave={handleSave}
          onClose={() => {
            setEditingMeasurement(null);
            setIsAdding(false);
          }}
        />
      )}
    </div>
  );
};

// Measurement Form Modal
const MeasurementFormModal: React.FC<{
  measurement: BodyMeasurement;
  isNew: boolean;
  onSave: (m: BodyMeasurement) => void;
  onClose: () => void;
}> = ({ measurement, isNew, onSave, onClose }) => {
  const [form, setForm] = useState({
    date: new Date(measurement.date).toISOString().split('T')[0],
    weight: measurement.weight,
    bodyFat: measurement.bodyFat ?? '',
    muscleMass: measurement.muscleMass ?? '',
    waterPercentage: measurement.waterPercentage ?? '',
    visceralFat: measurement.visceralFat ?? '',
    boneMass: measurement.boneMass ?? '',
    bmr: measurement.bmr ?? '',
    metabolicAge: measurement.metabolicAge ?? '',
    proteinPercentage: measurement.proteinPercentage ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...measurement,
      date: new Date(form.date).getTime(),
      weight: Number(form.weight),
      bodyFat: form.bodyFat !== '' ? Number(form.bodyFat) : null,
      muscleMass: form.muscleMass !== '' ? Number(form.muscleMass) : null,
      waterPercentage: form.waterPercentage !== '' ? Number(form.waterPercentage) : null,
      visceralFat: form.visceralFat !== '' ? Number(form.visceralFat) : null,
      boneMass: form.boneMass !== '' ? Number(form.boneMass) : null,
      bmr: form.bmr !== '' ? Number(form.bmr) : null,
      metabolicAge: form.metabolicAge !== '' ? Number(form.metabolicAge) : null,
      proteinPercentage: form.proteinPercentage !== '' ? Number(form.proteinPercentage) : null,
    });
  };

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen onClose={onClose} title={isNew ? 'Nouvelle Mesure' : 'Modifier Mesure'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => updateField('date', e.target.value)}
            required
          />
          <Input
            label="Poids (kg)"
            type="number"
            value={form.weight}
            onChange={(e) => updateField('weight', e.target.value)}
            min={0}
            step={0.1}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Masse grasse (%)"
            type="number"
            value={form.bodyFat}
            onChange={(e) => updateField('bodyFat', e.target.value)}
            min={0}
            max={100}
            step={0.1}
            placeholder="Optionnel"
          />
          <Input
            label="Masse musculaire (kg)"
            type="number"
            value={form.muscleMass}
            onChange={(e) => updateField('muscleMass', e.target.value)}
            min={0}
            step={0.1}
            placeholder="Optionnel"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Eau (%)"
            type="number"
            value={form.waterPercentage}
            onChange={(e) => updateField('waterPercentage', e.target.value)}
            min={0}
            max={100}
            step={0.1}
            placeholder="Optionnel"
          />
          <Input
            label="Graisse viscérale"
            type="number"
            value={form.visceralFat}
            onChange={(e) => updateField('visceralFat', e.target.value)}
            min={0}
            step={1}
            placeholder="Optionnel"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Masse osseuse (kg)"
            type="number"
            value={form.boneMass}
            onChange={(e) => updateField('boneMass', e.target.value)}
            min={0}
            step={0.1}
            placeholder="Optionnel"
          />
          <Input
            label="BMR (kcal)"
            type="number"
            value={form.bmr}
            onChange={(e) => updateField('bmr', e.target.value)}
            min={0}
            step={1}
            placeholder="Optionnel"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Âge métabolique"
            type="number"
            value={form.metabolicAge}
            onChange={(e) => updateField('metabolicAge', e.target.value)}
            min={0}
            step={1}
            placeholder="Optionnel"
          />
          <Input
            label="Protéines (%)"
            type="number"
            value={form.proteinPercentage}
            onChange={(e) => updateField('proteinPercentage', e.target.value)}
            min={0}
            max={100}
            step={0.1}
            placeholder="Optionnel"
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

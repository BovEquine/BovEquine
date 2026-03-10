'use client';

import { useState } from 'react';
import { useApp } from '@/components/AppProvider';
import HorseCard from '@/components/HorseCard';
import StatusBadge from '@/components/StatusBadge';
import { Horse, Gender, HealthStatus } from '@/lib/types';
import Link from 'next/link';
import { formatDate } from '@/lib/dateUtils';

interface NewHorseForm {
  name: string;
  breed: string;
  age: string;
  weight: string;
  gender: Gender;
}

const defaultForm: NewHorseForm = { name: '', breed: '', age: '', weight: '', gender: 'male' };

export default function HorsesPage() {
  const { state, addNewHorse } = useApp();
  const { horses, healthMetrics } = state;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewHorseForm>(defaultForm);
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);
  const [filterStatus, setFilterStatus] = useState<HealthStatus | 'all'>('all');

  const filteredHorses = filterStatus === 'all' ? horses : horses.filter((h) => h.status === filterStatus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.breed || !form.age || !form.weight) return;
    addNewHorse({
      name: form.name.trim(),
      breed: form.breed.trim(),
      age: parseInt(form.age, 10),
      weight: parseInt(form.weight, 10),
      gender: form.gender,
      status: 'healthy',
    });
    setForm(defaultForm);
    setShowModal(false);
  };

  const getHorseMetrics = (horseId: string) =>
    healthMetrics
      .filter((m) => m.horseId === horseId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Horse Profiles</h1>
          <p className="text-stone-500 mt-1">{horses.length} horses in your herd</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <span>+</span> Add Horse
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'healthy', 'warning', 'critical'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterStatus === s
                ? 'bg-amber-700 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-300'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Horse Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredHorses.map((horse) => (
          <HorseCard key={horse.id} horse={horse} onClick={() => setSelectedHorse(horse)} />
        ))}
        {filteredHorses.length === 0 && (
          <div className="col-span-full text-center py-16 text-stone-400">
            <p className="text-4xl mb-3">🐴</p>
            <p className="text-lg font-medium">No horses found</p>
            <p className="text-sm">Try a different filter or add a new horse</p>
          </div>
        )}
      </div>

      {/* Add Horse Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-800">Add New Horse</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Thunder"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Breed *</label>
                <input
                  type="text"
                  required
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Arabian"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Age (years) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={40}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 7"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Weight (lbs) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    max={3000}
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 1100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-stone-300 text-stone-600 px-4 py-2 rounded-lg font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Horse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Horse Detail Modal */}
      {selectedHorse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-4xl">🐴</div>
                <div>
                  <h2 className="text-2xl font-bold text-stone-800">{selectedHorse.name}</h2>
                  <p className="text-stone-500">{selectedHorse.breed}</p>
                </div>
              </div>
              <button onClick={() => setSelectedHorse(null)} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <StatusBadge status={selectedHorse.status} size="lg" />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Age', value: `${selectedHorse.age} years` },
                { label: 'Weight', value: `${selectedHorse.weight} lbs` },
                { label: 'Gender', value: selectedHorse.gender.charAt(0).toUpperCase() + selectedHorse.gender.slice(1) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-stone-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-stone-400 mb-1">{label}</p>
                  <p className="font-semibold text-stone-800">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-semibold text-stone-700 mb-3">Recent Health Records</h3>
              {getHorseMetrics(selectedHorse.id).length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-4">No health records yet</p>
              ) : (
                <div className="space-y-3">
                  {getHorseMetrics(selectedHorse.id).slice(0, 3).map((m) => (
                    <div key={m.id} className="border border-stone-100 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-stone-400 text-xs">
                          {formatDate(m.timestamp)}
                        </span>
                        {m.assessment && (
                          <span className={`font-bold ${m.assessment.score >= 80 ? 'text-green-600' : m.assessment.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                            Score: {m.assessment.score}/100
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs text-stone-600">
                        <span>🌡️ {m.temperature}°F</span>
                        <span>❤️ {m.heartRate} bpm</span>
                        <span>💨 {m.respiratoryRate}/min</span>
                        <span>⚖️ {m.weight} lbs</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 flex gap-3">
              <Link
                href="/health"
                onClick={() => setSelectedHorse(null)}
                className="flex-1 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg font-medium text-center text-sm transition-colors"
              >
                Log Health Check
              </Link>
              <button
                onClick={() => setSelectedHorse(null)}
                className="flex-1 border border-stone-300 text-stone-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-stone-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Horse } from '@/lib/types';
import StatusBadge from './StatusBadge';
import Link from 'next/link';

interface HorseCardProps {
  horse: Horse;
  onClick?: () => void;
}

const breedEmoji: Record<string, string> = {
  'Arabian': '🐎',
  'Quarter Horse': '🐴',
  'Thoroughbred': '🏇',
  'Paint Horse': '🎨',
};

export default function HorseCard({ horse, onClick }: HorseCardProps) {
  const emoji = breedEmoji[horse.breed] ?? '🐴';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-3xl group-hover:bg-amber-200 transition-colors">
            {emoji}
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-800">{horse.name}</h3>
            <p className="text-sm text-stone-500">{horse.breed}</p>
          </div>
        </div>
        <StatusBadge status={horse.status} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="bg-stone-50 rounded-lg p-2 text-center">
          <p className="text-stone-500 text-xs">Age</p>
          <p className="font-semibold text-stone-800">{horse.age} yrs</p>
        </div>
        <div className="bg-stone-50 rounded-lg p-2 text-center">
          <p className="text-stone-500 text-xs">Weight</p>
          <p className="font-semibold text-stone-800">{horse.weight} lbs</p>
        </div>
        <div className="bg-stone-50 rounded-lg p-2 text-center">
          <p className="text-stone-500 text-xs">Gender</p>
          <p className="font-semibold text-stone-800 capitalize">{horse.gender}</p>
        </div>
      </div>
    </div>
  );
}

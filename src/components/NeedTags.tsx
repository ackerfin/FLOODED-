import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export interface NeedTag {
  id: string;
  labelVi: string;
  labelEn: string;
  icon?: string;
}

const needTags: NeedTag[] = [
  { id: 'water', labelVi: 'NƯỚC SẠCH', labelEn: 'CLEAN WATER', icon: '💧' },
  { id: 'food', labelVi: 'ĐỒ ĂN', labelEn: 'FOOD', icon: '🍞' },
  { id: 'medicine', labelVi: 'THUỐC', labelEn: 'MEDICINE', icon: '💊' },
  { id: 'firstaid', labelVi: 'SƠ CỨU', labelEn: 'FIRST AID', icon: '🩹' },
  { id: 'child', labelVi: 'TRẺ EM', labelEn: 'CHILD', icon: '👶' },
  { id: 'elderly', labelVi: 'NGƯỜI GIÀ', labelEn: 'ELDERLY', icon: '👴' },
  { id: 'chronic', labelVi: 'BỆNH NỀN', labelEn: 'CHRONIC', icon: '🏥' },
  { id: 'evacuation', labelVi: 'SƠ TÁN', labelEn: 'EVACUATE', icon: '🚶' },
  { id: 'power', labelVi: 'PIN/ĐIỆN', labelEn: 'POWER', icon: '🔋' },
  { id: 'lifejacket', labelVi: 'ÁO PHAO', labelEn: 'LIFE JACKET', icon: '🦺' },
  { id: 'shelter', labelVi: 'CHỖ TRÚ', labelEn: 'SHELTER', icon: '🏠' },
  { id: 'other', labelVi: 'KHÁC', labelEn: 'OTHER', icon: '📝' },
];

interface NeedTagsProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  otherNote: string;
  onOtherNoteChange: (note: string) => void;
}

export function NeedTags({ selectedTags, onTagsChange, otherNote, onOtherNoteChange }: NeedTagsProps) {
  const { language } = useApp();
  const showOtherInput = selectedTags.includes('other');

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(t => t !== tagId));
      if (tagId === 'other') {
        onOtherNoteChange('');
      }
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {needTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className={cn(
              'need-tag flex items-center gap-1.5',
              selectedTags.includes(tag.id) && 'selected'
            )}
          >
            <span>{tag.icon}</span>
            <span>{language === 'vi' ? tag.labelVi : tag.labelEn}</span>
          </button>
        ))}
      </div>
      
      {showOtherInput && (
        <input
          type="text"
          value={otherNote}
          onChange={(e) => onOtherNoteChange(e.target.value.slice(0, 60))}
          placeholder={language === 'vi' ? 'Ghi chú ngắn (tối đa 60 ký tự)...' : 'Short note (max 60 chars)...'}
          className="w-full bg-secondary rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={60}
        />
      )}
    </div>
  );
}

export { needTags };

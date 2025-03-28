
import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const filters = [
  { id: 'all', label: 'Tous les médias' },
  { id: 'duplicates', label: 'Doublons' },
  { id: 'unique', label: 'Fichiers uniques' },
  { id: 'videos', label: 'Vidéos' },
  { id: 'images', label: 'Images' },
];

const FilterOptions: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  return (
    <RadioGroup value={selectedFilter} onValueChange={setSelectedFilter}>
      {filters.map(filter => (
        <div key={filter.id} className="flex items-center space-x-2 py-1">
          <RadioGroupItem value={filter.id} id={`filter-${filter.id}`} />
          <Label htmlFor={`filter-${filter.id}`} className="text-sm font-normal cursor-pointer">
            {filter.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};

export default FilterOptions;

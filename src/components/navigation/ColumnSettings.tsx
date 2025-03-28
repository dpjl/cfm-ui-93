
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const ColumnSettings: React.FC = () => {
  const [mobileColumns, setMobileColumns] = useState([2]);
  const [tabletColumns, setTabletColumns] = useState([3]);
  const [desktopColumns, setDesktopColumns] = useState([5]);
  
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Mobile</Label>
        <Slider 
          value={mobileColumns} 
          onValueChange={setMobileColumns} 
          max={3} 
          min={1} 
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1</span>
          <span>2</span>
          <span>3</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tablette</Label>
        <Slider 
          value={tabletColumns} 
          onValueChange={setTabletColumns} 
          max={6} 
          min={2} 
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>2</span>
          <span>4</span>
          <span>6</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium">Bureau</Label>
        <Slider 
          value={desktopColumns} 
          onValueChange={setDesktopColumns} 
          max={8} 
          min={3} 
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>3</span>
          <span>5</span>
          <span>8</span>
        </div>
      </div>
    </div>
  );
};

export default ColumnSettings;

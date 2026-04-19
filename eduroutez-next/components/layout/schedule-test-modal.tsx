import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ScheduleTestModalProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (date: string, slot: string) => void;
}

const ScheduleTestModal: React.FC<ScheduleTestModalProps> = ({ open, onClose, onSchedule }) => {
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!date || !slot) {
      setError('Please select both date and slot.');
      return;
    }
    setError('');
    onSchedule(date, slot);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">Schedule Your Test</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-base font-semibold text-slate-700">Select Date</Label>
            <Input 
              id="date"
              type="date" 
              className="rounded-xl border-slate-200 focus:ring-red-500 focus:border-red-500 h-12" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              min={new Date().toISOString().split('T')[0]} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="text-base font-semibold text-slate-700">Select Time</Label>
            <Input 
              id="time"
              type="time" 
              className="rounded-xl border-slate-200 focus:ring-red-500 focus:border-red-500 h-12" 
              value={slot} 
              onChange={e => setSlot(e.target.value)} 
            />
          </div>
          {error && <div className="text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1">{error}</div>}
        </div>
        <DialogFooter className="gap-3 sm:gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-6 h-12 border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold">
            Cancel
          </Button>
          <Button 
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95" 
            onClick={handleSubmit}
          >
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleTestModal;

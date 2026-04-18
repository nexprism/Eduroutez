import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent>
        {/* Cross button */}
        <button
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          type="button"
        >
          &times;
        </button>
        <DialogHeader>
          <DialogTitle>Schedule Your Test</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <label className="font-medium">Select Date</label>
          <input type="date" className="border rounded px-2 py-1" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          <label className="font-medium">Select Time</label>
          <input type="time" className="border rounded px-2 py-1" value={slot} onChange={e => setSlot(e.target.value)} />
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-primary" onClick={handleSubmit}>Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleTestModal;

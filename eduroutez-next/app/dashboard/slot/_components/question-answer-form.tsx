'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, X, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function CounselorSlotsPage() {
  const email = localStorage.getItem('email');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [timeSlots, setTimeSlots] = React.useState<{startTime: string, endTime: string}[]>([]);

  // Fetch existing slots
  const { data: existingSlots, isLoading } = useQuery({
    queryKey: ['counselorSlots', email],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/counselorslots/${email}`);
      return response.data?.data;
    }
  });

  // Create slots mutation
  const { mutate: createSlots, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(`${apiUrl}/counselorslots`, {
        counselorEmail: email,
        slots: timeSlots
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Slots added successfully');
      setTimeSlots([]);
      queryClient.invalidateQueries({ queryKey: ['counselorSlots', email] });
    },
    onError: () => {
      toast.error('Failed to add slots');
    }
  });

  // Delete slot mutation
  const { mutate: deleteSlot } = useMutation({
    mutationFn: async (slotId: string) => {
      const response = await axiosInstance.delete(`${apiUrl}/counselorslots/${slotId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Slot deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['counselorSlots', email] });
    },
    onError: () => {
      toast.error('Failed to delete slot');
    }
  });

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { startTime: '', endTime: '' }]);
  };

  const removeTimeSlot = (index: number) => {
    const newTimeSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(newTimeSlots);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSlots();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Counselor Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {timeSlots.map((slot, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <Input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => {
                    const newSlots = [...timeSlots];
                    newSlots[index].startTime = e.target.value;
                    setTimeSlots(newSlots);
                  }}
                  placeholder="Start Time"
                />
                <Input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => {
                    const newSlots = [...timeSlots];
                    newSlots[index].endTime = e.target.value;
                    setTimeSlots(newSlots);
                  }}
                  placeholder="End Time"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeTimeSlot(index)}
                  className="col-span-2"
                >
                  <X className="mr-2 h-4 w-4" /> Remove Slot
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addTimeSlot}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Slot
            </Button>
            <Button
              type="submit"
              disabled={timeSlots.length === 0 || isSubmitting}
              className="w-full mt-4"
            >
              Save Slots
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Slots</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading slots...</p>
          ) : existingSlots?.slots?.length > 0 ? (
            <div className="space-y-2">
            {existingSlots && (
  <div className="space-y-2">
    <Card>
      <CardHeader>
        <CardTitle>Current Slots for {existingSlots.counselorEmail}</CardTitle>
      </CardHeader>
      <CardContent>
        {existingSlots.slots.map((slot:any) => (
          <div 
            key={slot._id} 
            className="flex justify-between items-center p-2 border rounded"
          >
            <div>
              <span className="font-medium">Start Time:</span> {slot.startTime}
              <span className="mx-2">-</span>
              <span className="font-medium">End Time:</span> {slot.endTime}
            </div>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => deleteSlot(slot._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
)}
            </div>
          ) : (
            <p>No slots available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
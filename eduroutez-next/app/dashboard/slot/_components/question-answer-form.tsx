'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const;

type DaySlots = {
  [K in typeof DAYS[number]]: {
    start: string;
    end: string;
  };
};

export default function CounselorWeeklySlotsPage() {
  const email = localStorage.getItem('email');
  const queryClient = useQueryClient();
  const [slots, setSlots] = React.useState<DaySlots>({
    monday: { start: '', end: '' },
    tuesday: { start: '', end: '' },
    wednesday: { start: '', end: '' },
    thursday: { start: '', end: '' },
    friday: { start: '', end: '' },
    saturday: { start: '', end: '' },
    sunday: { start: '', end: '' },
  });

  // Fetch existing slots
  const { data: existingSlots, isLoading } = useQuery({
    queryKey: ['counselorWeeklySlots', email],
    queryFn: async () => {
      const response = await axiosInstance.get(`${apiUrl}/counselorslots/${email}`);
      return response.data?.data;
    },
    onSuccess: (data) => {
      if (data) {
        setSlots({
          monday: { start: data.mondayStart, end: data.mondayEnd },
          tuesday: { start: data.tuesdayStart, end: data.tuesdayEnd },
          wednesday: { start: data.wednesdayStart, end: data.wednesdayEnd },
          thursday: { start: data.thursdayStart, end: data.thursdayEnd },
          friday: { start: data.fridayStart, end: data.fridayEnd },
          saturday: { start: data.saturdayStart, end: data.saturdayEnd },
          sunday: { start: data.sundayStart, end: data.sundayEnd },
        });
      }
    }
  });

  // Create/Update slots mutation
  const { mutate: saveSlots, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      const formattedData = {
        counselorEmail: email,
        mondayStart: slots.monday.start,
        mondayEnd: slots.monday.end,
        tuesdayStart: slots.tuesday.start,
        tuesdayEnd: slots.tuesday.end,
        wednesdayStart: slots.wednesday.start,
        wednesdayEnd: slots.wednesday.end,
        thursdayStart: slots.thursday.start,
        thursdayEnd: slots.thursday.end,
        fridayStart: slots.friday.start,
        fridayEnd: slots.friday.end,
        saturdayStart: slots.saturday.start,
        saturdayEnd: slots.saturday.end,
        sundayStart: slots.sunday.start,
        sundayEnd: slots.sunday.end,
      };

      const response = await axiosInstance.post(`${apiUrl}/counselorslots`, formattedData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Weekly slots saved successfully');
      queryClient.invalidateQueries({ queryKey: ['counselorWeeklySlots', email] });
    },
    onError: () => {
      toast.error('Failed to save slots');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields are filled
    const isValid = Object.values(slots).every(({ start, end }) => start && end);
    if (!isValid) {
      toast.error('Please fill in all time slots');
      return;
    }

    // Validate end time is after start time for each day
    const isValidTime = Object.values(slots).every(({ start, end }) => start < end);
    if (!isValidTime) {
      toast.error('End time must be after start time');
      return;
    }

    saveSlots();
  };

  const handleTimeChange = (day: keyof DaySlots, field: 'start' | 'end', value: string) => {
    setSlots(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Set Weekly Counseling Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {DAYS.map((day) => (
              <div key={day} className="space-y-4">
                <Label className="capitalize text-lg font-semibold">{day}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={slots[day].start}
                      onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={slots[day].end}
                      onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Weekly Slots'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
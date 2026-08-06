'use client';
import { Switch } from './switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useEffect, useRef, useState } from 'react';

interface ToggleStatusProps {
  checked: boolean;
  id: string;
  apiPath: string;
  field?: string;
  queryKey?: string;
}

export function ToggleStatus({
  checked,
  id,
  apiPath,
  field = 'isPublished',
  queryKey
}: ToggleStatusProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const queryClient = useQueryClient();
  const [isChecked, setIsChecked] = useState(checked);
  const previousValueRef = useRef(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (newValue: boolean) => {
      await axiosInstance({
        url: `${apiUrl}/${apiPath}/${id}`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        data: { [field]: newValue }
      });
    },
    onMutate: (newValue) => {
      previousValueRef.current = isChecked;
      setIsChecked(newValue);
    },
    onSuccess: () => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      }
    },
    onError: () => {
      setIsChecked(previousValueRef.current);
    }
  });

  return (
    <Switch
      checked={isChecked}
      onCheckedChange={(value) => mutate(value)}
      disabled={isPending}
    />
  );
}

"use client";

import { useEffect } from 'react';
import axiosInstance from '@/lib/axios';

export default function EnsureSession() {
  useEffect(() => {
    const hasAuthToken =
      typeof window !== 'undefined' &&
      Boolean(localStorage.getItem('accessToken') || localStorage.getItem('refreshToken'));

    if (!hasAuthToken) {
      return;
    }

    const instituteId = localStorage.getItem('instituteId');
    const role = localStorage.getItem('role');
    if (!instituteId || !role) {
      const fetchProfile = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
          const res = await axiosInstance.get(`${apiUrl}/user`);
          const user = res?.data?.data || res?.data;
          if (user) {
            if (user.instituteId) localStorage.setItem('instituteId', user.instituteId);
            if (user.role) localStorage.setItem('role', user.role);
            if (user.name) localStorage.setItem('name', user.name);
            if (user.email) localStorage.setItem('email', user.email);
            if (user.image) localStorage.setItem('image', user.image);
            if (user.plan) localStorage.setItem('plan', user.plan);
          }
        } catch (err) {
          // user may be unauthenticated; ignore
        }
      };
      fetchProfile();
    }
  }, []);

  return null;
}

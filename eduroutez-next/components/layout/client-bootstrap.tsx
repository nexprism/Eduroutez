"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import SessionContext from "@/components/layout/session-context";

interface Props {
  children: React.ReactNode;
}

export default function ClientBootstrap({ children }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await axiosInstance.get(`${apiUrl}/user`);
        const user = res?.data?.data || res?.data;
        if (!mounted) return;
        if (user) {
          // many parts of the app expect `instituteId` to be the current user's id
          // (for counsellors/institutes), so fall back to `_id` when `instituteId` isn't present
          const instId = user.instituteId || user._id || user.id;
          if (instId) localStorage.setItem("instituteId", instId);
          if (user.role) localStorage.setItem("role", user.role);
          if (user.name) localStorage.setItem("name", user.name);
          if (user.email) localStorage.setItem("email", user.email);
          if (user.image) localStorage.setItem("image", user.image);
          // store `plan` as an id string when possible to match other components
          try {
            const planValue = typeof user.plan === 'string' ? user.plan : (user.plan?._id || user.plan?.id);
            if (planValue) localStorage.setItem("plan", String(planValue));
          } catch (err) {
            // ignore
          }
            // store scheduled test info on client as a fallback for components
            if (user.scheduledTestDate) localStorage.setItem('scheduledTestDate', String(user.scheduledTestDate));
            if (user.scheduledTestSlot) localStorage.setItem('scheduledTestSlot', String(user.scheduledTestSlot));
            
            // Notify components about the updated storage
            window.dispatchEvent(new Event('counselor-test-update'));
            
            // debug: log what we saved to localStorage
            try {
              console.debug('ClientBootstrap: saved keys', {
                instituteId: localStorage.getItem('instituteId'),
                role: localStorage.getItem('role'),
                scheduledTestDate: localStorage.getItem('scheduledTestDate'),
                scheduledTestSlot: localStorage.getItem('scheduledTestSlot')
              });
            } catch (e) {
              // ignore in SSR
            }
        }
      } catch (err) {
        // ignore and continue — don't block app indefinitely
      } finally {
        if (mounted) {
          setReady(true);
          try { console.debug('ClientBootstrap: ready=true'); } catch(e){}
        }
      }
    }

    fetchProfile();

    // safety: if fetch hangs, proceed after 3s
    const timeout = setTimeout(() => mounted && setReady(true), 3000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);

  return (
    <SessionContext.Provider value={{ ready, setReady }}>
      {ready ? <>{children}</> : null}
    </SessionContext.Provider>
  );
}

"use client";

import React, { useEffect, useState } from "react";

export default function ScheduleBadge() {
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);

  useEffect(() => {
    try {
      const sd = localStorage.getItem('scheduledTestDate');
      const ss = localStorage.getItem('scheduledTestSlot');
      if (sd) setDate(sd);
      if (ss) setSlot(ss);
    } catch (e) {
      // ignore
    }
  }, []);

  if (!date && !slot) return null;

  return (
    <div style={{position:'fixed', right:16, top:16, zIndex:9999}}>
      <div style={{background:'#fff',padding:'8px 12px',borderRadius:8,boxShadow:'0 2px 8px rgba(0,0,0,0.08)',fontSize:12}}>
        <div style={{fontWeight:600}}>Scheduled Test</div>
        <div>{date ? new Date(date).toLocaleString() : '-' } {slot ? `(${slot})` : ''}</div>
      </div>
    </div>
  );
}

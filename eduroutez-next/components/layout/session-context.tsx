"use client";

import React, { useContext } from "react";

type SessionContextType = {
  ready: boolean;
  setReady: (v: boolean) => void;
};

const SessionContext = React.createContext<SessionContextType>({
  ready: false,
  setReady: () => {}
});

export const useSession = () => useContext(SessionContext);

export default SessionContext;

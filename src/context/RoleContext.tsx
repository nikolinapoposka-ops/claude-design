import React, { createContext, useContext, useState } from 'react';

export type Role = 'hq' | 'areaManager' | 'store';

// The Area Manager demo persona — matches the auditor in the HQ assignment flow
export const AREA_MANAGER_AUDITOR_ID = 'ed';
export const AREA_MANAGER_NAME = 'Emily Davis';

// The Store demo persona
export const STORE_NAME = 'San Francisco - Downtown';

const STORAGE_KEY = 'audit_demo_role';

function readRole(): Role {
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'areaManager' || v === 'store') return v;
  return 'hq';
}

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue>({ role: 'hq', setRole: () => {} });

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(readRole);

  const setRole = (r: Role) => {
    localStorage.setItem(STORAGE_KEY, r);
    setRoleState(r);
  };

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
};

export function useRole() {
  return useContext(RoleContext);
}

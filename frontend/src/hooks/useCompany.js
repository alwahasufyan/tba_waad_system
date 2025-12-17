import { use } from 'react';
import CompanyContext from 'contexts/CompanyContext';

// ==============================|| COMPANY HOOK ||============================== //

export default function useCompany() {
  const context = use(CompanyContext);

  if (!context) throw new Error('useCompany must be used inside CompanyProvider');

  return context;
}

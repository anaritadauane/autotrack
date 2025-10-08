export interface Vehicle {
  id?: string;
  name: string;
  plate: string;
  make: string;
  model: string;
  year: string;
  vin?: string;
  color?: string;
  insurance: {
    date: string;
    status: 'valid' | 'expired' | 'warning';
    company?: string;
    policyNumber?: string;
  };
  inspection: {
    date: string;
    status: 'valid' | 'expired' | 'warning';
    center?: string;
  };
  taxes: {
    date: string;
    status: 'valid' | 'expired' | 'warning';
    amount?: string;
  };
}

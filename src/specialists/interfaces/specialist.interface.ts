export interface ISpecialist {
  id: string;
  name: string;
  idNumber: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface ICreateSpecialistPayload {
  name: string;
  idNumber: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
}

export interface IUpdateSpecialistPayload {
  name?: string;
  idNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
}

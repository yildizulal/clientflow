export type ClientStatus = "lead" | "active" | "inactive";

export interface Client {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: ClientStatus;
  notes?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientsResponse {
  success: boolean;
  count: number;
  clients: Client[];
}

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: ClientStatus;
  notes: string;
}
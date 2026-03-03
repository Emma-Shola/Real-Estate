export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  agency?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  status: 'available' | 'sold' | 'pending' | 'rented';
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  features: string[];
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'inspection' | 'closed' | 'qualified' | 'negotiating' | 'won' | 'lost';
  aiScore: number;
  source: string;
  propertyInterest?: string;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsOverview {
  totalProperties: number;
  totalLeads: number;
  hotLeads: number;
  soldProperties: number;
  conversionRate: number;
  revenue: number;
  leadsThisMonth: number;
  propertiesThisMonth: number;
  averageClosingTime?: number;
}

export interface AIDescription {
  seoDescription: string;
  socialCaption: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

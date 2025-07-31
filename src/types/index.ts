export interface Customer {
  customerId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  maritalStatus: string;
  email: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  currentAddress: Address;
  permanentAddress: Address;
  employmentDetails: EmploymentDetails;
  identificationDocuments?: IdentificationDocument[];
  creditScore: number;
  kycStatus: string;
  riskProfile: string;
  accountStatus: string;
  fatcaStatus: boolean;
  pepStatus: boolean;
  customerNotes?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface IdentificationDocument {
  documentType: string;
  documentNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  documentImageUrl?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
  residenceSince: string;
}

export interface EmploymentDetails {
  employmentStatus: string;
  employerName: string;
  designation: string;
  workExperience: number;
  monthlyIncome: number;
  annualIncome: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'viewer';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  profilePicture?: string;
  department?: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface LoginErrorResponse {
  status: string;
  message: string;
  code: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: { value: string; label: string }[];
}
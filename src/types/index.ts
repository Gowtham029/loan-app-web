export interface Customer {
  id: string;
  customerId: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  pan: string;
  aadhaar: string;
  email: string;
  mobileNumber: string;
  photoId: string;
  identityProofs: IdentityProof[];
  addressDetails: AddressDetails;
  employmentDetails: EmploymentDetails;
  bankDetails: BankDetails;
  consent: Consent;
  createdAt: string;
}

export interface IdentityProof {
  documentType: string;
  documentNumber: string;
  documentUrl: string;
}

export interface AddressDetails {
  residentialAddress: Address;
  permanentAddressSameAsResidential: boolean;
}

export interface Address {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  ownership: string;
}

export interface EmploymentDetails {
  employmentType: string;
  companyName: string;
  designation: string;
  workExperienceYears: number;
  monthlyIncome: number;
}

export interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface Consent {
  kycConsent: boolean;
  creditBureauConsent: boolean;
  termsAndConditionsAccepted: boolean;
}

export interface User {
  userId: string;
  id: string;
  username: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: 'Admin' | 'Manager' | 'Viewer';
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
  lastLoginAt: string;
  password: string;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  user: User;
  access_token: string;
  loginAt: string;
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
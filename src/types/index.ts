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
  photoUrl?: string;
  currentAddress: Address;
  permanentAddress: Address;
  identificationDocuments?: IdentificationDocument[];
  employmentDetails: EmploymentDetails;
  creditScore: number;
  kycStatus: string;
  accountStatus: string;
  fatcaStatus: boolean;
  pepStatus: boolean;
  customerNotes?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IdentificationDocument {
  documentType: string;
  documentNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  documentUrl?: string;
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

export interface Loan {
  loanId: string;
  customer: {
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  originalPrincipal: number;
  currentPrincipal: number;
  interestRate: {
    annualPercentage: number;
    monthlyPercentage: number;
    totalInterestRupees: number;
    monthlyInterestRupees: number;
  };
  termMonths: number;
  remainingTerms: number;
  repaymentFrequency: 'MONTHLY' | 'WEEKLY' | 'DAILY';
  type: 'FLEXIBLE' | 'FIXED';
  startDate: string;
  endDate: string;
  expectedMonthlyPayment: number;
  missedPayments: {
    count: number;
    closed: number;
    totalMissedAmount: number;
    compoundingDetails: {
      penaltyInterestRate: number;
      compoundedInterest: number;
      principalPenalty: number;
      totalPenaltyAmount: number;
    };
    lateFees: {
      feePerMonth: number;
      totalLateFees: number;
    };
  };
  currentOutstanding: {
    lastCalculatedDate: string;
  };
  status: 'ACTIVE' | 'OVERDUE' | 'DEFAULTED' | 'PAID_OFF' | 'RESTRUCTURED';
  substatus: 'CURRENT' | 'GRACE_PERIOD' | 'DELINQUENT';
  loanProvider: {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoanRequest {
  customer: {
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  originalPrincipal: number;
  interestRate: {
    annualPercentage: number;
    monthlyPercentage: number;
  };
  termMonths: number;
  repaymentFrequency: 'MONTHLY' | 'WEEKLY' | 'DAILY';
  type: 'FLEXIBLE' | 'FIXED';
  startDate: string;
  endDate: string;
}

export interface LoanFilters {
  customerId?: string;
  status?: 'ACTIVE' | 'OVERDUE' | 'DEFAULTED' | 'PAID_OFF' | 'RESTRUCTURED';
  substatus?: 'CURRENT' | 'GRACE_PERIOD' | 'DELINQUENT';
  search?: string;
  sortBy?: 'createdAt' | 'originalPrincipal' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface Payment {
  _id: string;
  paymentId: string;
  loanId: string;
  customerId: string;
  paymentDetails: {
    dueDate: string;
    paidDate: string | null;
    expectedAmount: number;
    paidAmount: number;
    breakdown: {
      principalPortion: number;
      interestPortion: number;
      penaltyPortion: number;
      lateFeesPortion: number;
      savingsFromEarlyPayment?: number;
    };
  };
  paymentMethod: {
    type: 'BANK_TRANSFER' | 'CASH' | 'UPI' | 'CHEQUE';
    reference: string;
    bankName?: string;
    accountNumber?: string;
  };
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'PENDING_VERIFICATION' | 'DELETED';
  paymentType: 'FULL_SETTLEMENT' | 'REGULAR' | 'PARTIAL';
  isPartialPayment: boolean;
  daysPastDue: number;
  outstandingAfterPayment: {
    remainingPrincipal: number;
    remainingInterest: number;
    totalRemaining: number;
  };
  processedBy: string;
  processedAt: string;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
  verificationNotes?: string;
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
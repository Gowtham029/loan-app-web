# HexaBee Loan Management System

A modern React TypeScript application for loan management with enterprise-grade features.

## Features

- **Authentication**: JWT-based login/logout with auth toggle
- **Customer Management**: Full CRUD operations with PATCH updates
- **User Management**: Role-based access control
- **Dark/Light Theme**: System theme support
- **Responsive Design**: Mobile-first approach
- **Data Tables**: Search, sort, pagination, and filtering
- **Form Validation**: Required field validation with error notifications
- **Confirmation Dialogs**: Delete confirmations
- **Enterprise Architecture**: Reusable components and services

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Customers
- `GET /api/v1/customers` - Get all customers (with pagination)
- `GET /api/v1/customers/:id` - Get customer by ID
- `POST /api/v1/customers` - Create new customer
- `PATCH /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer

### Users
- `GET /api/v1/users` - Get all users (with pagination)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components
│   └── UI/             # Basic UI components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript interfaces
└── utils/              # Utility functions
```

## Authentication Toggle

The system supports enabling/disabling authentication:
- **Enabled**: Users must login to access the system
- **Disabled**: Users can access all features without authentication

Toggle this setting in the Settings page.

## Development

The application follows enterprise standards with:
- TypeScript for type safety
- Modular component architecture
- Centralized state management
- Error handling and notifications
- Responsive design patterns
- Accessibility compliance

## Footer

Developed and maintained by **HexaBee Technologies**
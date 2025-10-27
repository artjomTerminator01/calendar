# Resource Management Calendar

A complete resource management calendar application for scheduling employee work assignments and handling client bookings. Built as a Proof of Concept (PoC) with modern web technologies.

## 🎯 What is this app?

This application solves the problem of **resource scheduling** for small businesses. It allows:

- **Admins** to manage employee schedules and work assignments
- **Clients** to book available time slots for services

## 🚀 Main Technologies

### Backend

- **Node.js** + **Express** + **TypeScript**
- **JSON file storage** (PoC approach)
- **Email notifications** (console logging for PoC)

### Frontend

- **React 18** + **TypeScript**
- **Tailwind CSS** for styling
- **React Big Calendar** for calendar visualization
- **React Router** for navigation

## 📋 Quick Start Guide

### 1. Prerequisites

- Node.js 20.10.0 (use NVM: `nvm use`)
- Git

### 2. Setup

**Option A: Automated Setup (Recommended)**

```bash
# Clone the repository
git clone <repository-url>
cd calendar

# Run the setup script
chmod +x setup.sh
./setup.sh
```

**Option B: Manual Setup**

```bash
# Clone the repository
git clone <repository-url>
cd calendar

# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

### 3. Configure Environment Variables

**Option A: Manual Configuration**

```bash
# Copy environment files
cp server/env.example server/.env
cp client/env.example client/.env

# Edit configuration files as needed
# Server: Configure email settings in server/.env
# Client: Configure API URL in client/.env
```

**Option B: Use Setup Guide**

- Follow the detailed setup guide for step-by-step configuration
- Includes email service setup and testing
- Covers both development and production environments

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 🎮 How to Use the App

### Admin Interface (`/admin`)

**Dashboard** - Overview of employees and assignments

- View statistics: total employees, today's assignments, weekly work
- Click cards to navigate to management pages

**Employee Management** (`/admin/employees`)

- Add new employees with work hours
- Edit employee information
- Delete employees

**Assignment Management** (`/admin/assignments`)

- Create work assignments for clients
- Assign work to specific employees
- Update assignment status (scheduled → completed/cancelled)
- Delete assignments

**Calendar View** (`/admin/calendar`)

- Visual calendar showing all assignments
- Filter by employee
- Click events to edit assignments
- Switch between month/week/day views

### Client Interface (`/`)

**Booking Process**:

1. **Select Date** - Choose when you need service
2. **Choose Employee** - Pick from available workers
3. **Pick Time Slot** - Select from available hours
4. **Fill Details** - Enter your information and work type
5. **Submit** - Complete the booking

**Work Types Available**:

- Measurement (Mõõdistus)
- Maintenance (Hooldus)
- Demolition (Lammutus)
- Consultation (Konsultatsioon)

## 🔄 Main User Flows

### Admin Flow

1. **Setup**: Add employees with their work hours
2. **Planning**: Create assignments or let clients book
3. **Management**: Monitor calendar, update statuses
4. **Notifications**: Receive email alerts for new bookings

### Client Flow

1. **Discovery**: Visit the booking page
2. **Selection**: Choose date, employee, and time
3. **Booking**: Fill out contact details and work type
4. **Confirmation**: Receive success message

## 📁 Project Structure

```
calendar/
├── server/          # Backend API
│   ├── src/
│   │   ├── controllers/  # API endpoints
│   │   ├── services/     # Business logic
│   │   └── routes/       # Route definitions
│   └── data/             # JSON storage
├── client/          # Frontend React app
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # App pages
│   │   ├── hooks/        # Custom hooks
│   │   └── services/     # API clients
└── package.json     # Root scripts
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start both servers
npm run dev:server       # Backend only
npm run dev:client       # Frontend only

# Building
npm run build           # Build for production
npm start              # Start production servers

# Code Quality
npm run lint           # Check code style
npm run lint:fix       # Auto-fix issues
```

## 📧 Email Notifications

Currently configured for **console logging** (PoC mode):

- Employee notifications when assignments are created/updated
- Admin notifications when clients make bookings
- All email content is logged to console

## 🌍 Language & Localization

- **Interface**: Estonian
- **Time Format**: 24-hour (Estonian standard)
- **Date Format**: DD.MM.YYYY
- **Work Hours**: 08:00 - 16:30 (configurable)

## 📊 Data Storage

- **Format**: JSON files in `server/data/`
- **Persistence**: File-based storage (PoC approach)
- **Backup**: Manual file copying recommended

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile
- **Color Coding**: Different colors for assignment statuses
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client-side validation with Estonian messages

## 🔧 Configuration

### Environment Variables

```bash
# Server (.env)
NODE_ENV=development
PORT=3001

# Client (.env)
VITE_API_URL=http://localhost:3001
```

### Work Hours Configuration

Default work hours are 08:00-16:30, configurable per employee in the admin interface.

## 📝 License

This project is a Proof of Concept for demonstration purposes.

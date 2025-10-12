# Duty Leave Management System

## Overview
A comprehensive online duty leave management system for educational institutes. Students can apply for duty leave online, and faculty members can approve/reject applications based on their roles (Class Coordinator, HOD, Vice Principal).

## Current State
The application is **fully functional** with complete backend and frontend integration:
- ✅ Student and faculty authentication with JWT
- ✅ Role-based dashboards and approval workflows  
- ✅ Attendance validation (≥75% required to apply)
- ✅ Email notifications to approvers
- ✅ Multi-student application support
- ✅ Approval routing based on leave duration

## Recent Changes (Oct 12, 2025)
- Implemented complete database schema for students, faculty, and DL applications
- Created in-memory storage with all CRUD operations
- Added JWT authentication and authorization
- Built API routes for application submission and approval workflow
- Integrated Nodemailer for email notifications
- Connected frontend to backend with real-time data
- Added seed data for testing with multiple users

## Tech Stack

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS + Shadcn UI components
- **State Management**: React Query for server state
- **Forms**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with Express
- **Authentication**: JWT tokens
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer (Gmail SMTP)
- **Storage**: In-memory storage (MemStorage)

## Project Architecture

### Database Schema

#### Students Table
- id, name, rollNo, email, password
- department, division
- attendancePercentage
- createdAt

#### Faculty Table  
- id, name, email, password
- role (CC/HOD/VP), department
- createdAt

#### DL Applications Table
- id, studentId, studentName, rollNo, department, division
- numberOfDays, reason, dateFrom, dateTo
- additionalStudents (array)
- CC status/date/remarks
- HOD status/date/remarks  
- VP status/date/remarks
- overallStatus (pending/approved/rejected)
- createdAt

### Approval Workflow

**1 Day Leave:**
- CC approval required
- Approved by CC → Status: Approved

**2 Day Leave:**
- CC + HOD approval required
- CC approves → HOD notified
- HOD approves → Status: Approved

**>2 Day Leave:**
- CC + HOD + VP approval required
- CC approves → HOD notified
- HOD approves → VP notified
- VP approves → Status: Approved

Any rejection at any level → Status: Rejected

### Email Notifications
When a student submits an application, emails are sent to:
- CC (always)
- HOD (if ≥2 days)
- VP (if >2 days)

**Note:** Email functionality requires environment variables:
- `EMAIL_USER` - Gmail address
- `EMAIL_PASSWORD` - Gmail app password

## API Endpoints

### Authentication
- `POST /api/auth/login` - Student/faculty login
- `POST /api/auth/register-student` - Student registration (testing)
- `GET /api/auth/me` - Get current user info

### Applications
- `POST /api/applications` - Submit DL application (student)
- `GET /api/applications/my` - Get student's applications
- `GET /api/applications/pending` - Get pending applications (faculty)
- `GET /api/applications/all?status={status}` - Get all applications (faculty)
- `POST /api/applications/approve` - Approve/reject application (faculty)

## Test Credentials

### Students (password: password123)
- **rahul@institute.edu** - CS Dept, 82% attendance, eligible
- **priya@institute.edu** - EC Dept, 78% attendance, eligible
- **sneha@institute.edu** - CS Dept, 91% attendance, eligible
- **vikram@institute.edu** - EC Dept, 65% attendance, **NOT ELIGIBLE**

### Faculty (password: faculty123)
- **anjali.cc@institute.edu** - CC (Computer Science)
- **rajesh.hod@institute.edu** - HOD (Computer Science)
- **sunita.vp@institute.edu** - Vice Principal
- **kiran.cc@institute.edu** - CC (Electronics)
- **anil.hod@institute.edu** - HOD (Electronics)

## User Workflows

### Student Workflow
1. Login with institute email
2. View dashboard with application stats
3. Click "Apply for Leave"
4. Fill form (validates attendance ≥75%)
5. Add additional students (optional)
6. Submit application
7. Track status in dashboard

### Faculty Workflow
1. Login with faculty credentials
2. View pending applications (role-based)
3. Review application details
4. Approve or reject with optional remarks
5. Track all applications by status

## Key Features

### Student Features
- ✅ Attendance-based eligibility check
- ✅ Multi-student applications
- ✅ Real-time application tracking
- ✅ Status history (pending/approved/rejected)
- ✅ Dashboard with statistics

### Faculty Features
- ✅ Role-based application filtering
- ✅ Pending, approved, rejected tabs
- ✅ Approve/reject with remarks
- ✅ Email notifications
- ✅ Department-specific access (CC/HOD)

### System Features
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Automated approval routing
- ✅ Email notifications
- ✅ Dark mode support
- ✅ Responsive design

## Environment Variables

Required for full functionality:
```
SESSION_SECRET=your-jwt-secret-key
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
APP_URL=http://localhost:5000
```

## Development

### Running the App
The workflow "Start application" runs `npm run dev` which:
- Starts Express server on port 5000
- Starts Vite dev server for frontend
- Auto-seeds test data on first run

### File Structure
```
/client
  /src
    /components - Reusable UI components
    /pages - Route pages
    /lib - Auth & API utilities
    
/server
  routes.ts - API endpoints
  storage.ts - Data storage interface
  seed.ts - Test data seeding
  
/shared
  schema.ts - Database schema & types
```

## Future Enhancements
- PDF generation for approved applications
- Admin analytics dashboard
- Advanced search and filtering
- Timeline progress tracker
- Real-time notifications with WebSockets
- PostgreSQL database integration

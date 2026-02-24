# CityCare — Smart Civic Issue Management Platform

**CityCare** is a full-stack civic issue reporting and transparency platform designed to streamline communication between citizens and city authorities.

It enables structured reporting, intelligent duplicate detection, role-based issue management, and a public transparency dashboard — ensuring accountability, efficiency, and trust in civic governance.

---

## Project Context

CityCare is developed as part of an academic Study Project / Capstone progression model, with:

- Phase 1: Problem Identification & Planning
- Phase 2: System Design & Proof of Concept
- Phase 3: Implementation & Validation (In Progress)

The system follows structured workflows, RBAC architecture, and transparency-first design principles.

---

# Core Features

## Citizen Module

- Report civic issues with:
  - Title
  - Description
  - Category & Subcategory
  - Location (Google Maps auto-pin)
  - Photo evidence
- Anonymous reporting option
- Upvote & community interaction
- Real-time status tracking
- Duplicate issue detection before submission
- Public transparency access (Resolved & Rejected issues)

---

## Officer Modules

### Field Officer
- View assigned issues
- Update issue progress
- Upload before & after resolution photos
- Add public resolution notes
- Change status (In Progress → Resolved)

### Unit Officer
- Verify reported issues
- Assign issues to field officers
- Reassign issues if required
- Approve final resolution
- Manage regional workload

---

### City Administrator Dashboard

- View city-wide analytics
- Heatmap & pin-based issue visualization
- Role management & account approval
- Audit logs of actions
- Public transparency controls
- KPI metrics:
  - Total Resolved
  - Total Rejected
  - Avg Resolution Time
  - Citizen Satisfaction Rating

---

# Public Transparency Dashboard

Accessible without login.

Displays:
- Resolved issues with before/after proof
- Rejected issues with official reason
- Interactive Google Maps:
  - Heatmap view
  - Pin view (toggle)
- Filters (Category, Status)
- Trust & Transparency metrics
- Shareable issue links

---

# Intelligent Layer (Implemented & Planned)

## Implemented
- Rule-based duplicate detection system
  - Location proximity scoring (Haversine distance)
  - Category & subcategory matching
  - Title & description similarity scoring
  - Weighted scoring threshold logic

---

# Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| Citizen | Report, view, upvote, comment |
| Field Officer | Update assigned issues |
| Unit Officer | Verify & assign issues |
| City Admin | Full system access |

Authentication handled via **NextAuth.js** with role-based route protection.

Account approval system implemented for officers.

---

# HCI & UX Principles Applied

- Consistency in layout & color semantics
- Status color coding (Green = Resolved, Red = Rejected, Yellow = Pending)
- Immediate feedback (toasts, loaders, transitions)
- Accessibility-first design (ARIA ready)
- Responsive mobile-first UI
- Structured workflow lifecycle

---

# Tech Stack

## Frontend
- Next.js (Full-stack React framework)
- TailwindCSS
- ShadCN UI Components
- Lucide Icons
- Google Maps API

## Backend / Data Layer
- ConvexDB (Real-time reactive database)
- Convex functions (queries & mutations)
- Rule-based duplicate detection engine

## Authentication
- NextAuth.js
- Role-based session validation

## Notifications
- In-app toasts
- Email integration ready

---

# Structured Issue Lifecycle

1. Citizen Reports Issue
2. Unit Officer Verifies
3. Issue Assigned to Field Officer
4. Field Officer Resolves & Uploads Evidence
5. Unit Officer Confirms
6. Status Updated Publicly
7. Citizen Feedback (Optional)

No arbitrary time limits — resolution based on workflow completion.

---

# Installation & Setup Guide

## Step 1: Clone Repository

```bash
git clone https://github.com/sagnikdey45/CityCare---Smart-Civic-Issue-Management-Platform.git
cd CityCare
```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Configure Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
```

---

## Step 4: Install Convex

```bash
npm install convex
```

---
## Step 5: Start Convex

```bash
npx convex dev
```

---

## Step 6: Run Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# Current Implementation Status

| Module | Status |
|--------|--------|
| Citizen Reporting | Completed |
| Duplicate Detection | Completed |
| Officer Workflow | Completed (with dummy data) |
| Public Dashboard | Completed (with dummy data) |
| Heatmap & Pins | Completed (with dummy data) |
| Account Approval System | Planned for Capstone Project |
<!-- | AI Layer | Planned for Capstone Project | -->

---

# Vision of Our CityCare Project

CityCare aims to evolve into a scalable civic-tech platform capable of:

- Multi-city deployment
- AI-powered governance analytics
- Transparent civic performance scoring
- Smart municipal workflow automation

---

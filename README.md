# CityCare – Smart Civic Issue Management Platform

CityCare is a smart civic issue reporting and management platform that will be enabling the citizens to report civic issues and also allowing the municipal officers and administrators to verify, assign, resolve, monitor and analyse those issues through a structured resolution workflow. This is the web version of the CityCare project which is specifically being created for the Citizens and Administrators (City & System). 

## About the Project

Urban municipal administration often suffers from fragmented communication, unverified issue reports, opaque resolution tracking, and lack of real-time operational visibility. CityCare addresses these challenges by providing a centralized digital platform that will be bridging the gap between citizens, field workers and municipal administrative tiers.

The CityCare platform provides an end-to-end civic governance issue lifecycle. From the moment the citizen submits an issue and the automated duplicate issue checks to the Unit Officer verifies the issue, assigns to Field Officer, approves or request reworks of the evidence based issue resolution submitted by Field Officers till the citizen feedback and rating, everything is being tracked with full transparency, very strict SLA Deadline monitoring and role based accountability. 

## Key Features

* **Citizen Features:-** The citizens can use the platform to report civic issues, track their progress, communicating with the officers to clarify doubts and participate in public discussions. 
* **City Administrator Features:-** The City Admins are responsible for managing all the civic operations that are within their assigned city by monitoring the KPIs, reviewing and filtering all the city complaints, reassignment of officer, updation of issue priority or category, managing SLA Deadline and Issue Escalations, viewing audit logs of the city wide actions being taken by citizens and officers, analysing department wise performance and monitoring distribution of issue through the city map. 
* **System Administrator Features:-** The System Admins are responsible for handling all the platform wide administration across the different cities and officer management by provisioning and mapping officer accounts, monitoring the SLA breaches and issue escalations, maintaining or creating citizen badges and analysing civic issue trend across all the different cities. 

## Issue Workflow

### Primary Lifecycle
`Pending` → `Verified` → `Assigned` → `In Progress` → `Pending UO Verification` → `Resolved / Closed`

### Secondary & Exception States
* `Rejected`: Issues deemed invalid, out-of-scope, or insufficient evidence during Unit Officer verification.
* `Rework Required`: Issues sent back to the assigned Field Officer when submitted work is unsatisfactory.
* `Reopened`: Resolved issues reopened by citizens due to recurring or incomplete resolution.
* `Escalated`: Issues escalated to City/System Administrators due to SLA breach or operational blockers.
* `Withdrawn`: Issues withdrawn by the reporting citizen prior to verification.

## Core Algorithms

The CityCare makes use of core algorithms for **duplicate detection, geographical distance calculation, assignment of officers (Unit Officer / Field Officer), SLA deadline & Issue Escalation, trend analysis, evaluation of officer performance** and **citizen rate limiting**. All these together help in automating the **issue routing, reduce redundant issues, monitor deadlines** and maintaining a consistent issue resolution workflow. 

## Getting Started

### Prerequisites

Ensure you have the following installed and configured before setting up the project:

* **Node.js**
* **Git**
* A **Convex** account and project setup
* Google Cloud Platform API key with enabled Maps JavaScript API, Places API and Geocoding API
* API keys for configured third party services (Gemini AI, Upstash Redis, Resend)

### Clone Repository

```bash
git clone https://github.com/sagnikdey45/CityCare---Smart-Civic-Issue-Management-Platform
cd CityCare---Smart-Civic-Issue-Management-Platform
```

### Install Dependencies

```bash
npm install
```

## Environment Variables

Create an `.env.local` file in the root directory. Actual secret keys and credentials must never be committed to source control.

```env
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Additional Service Credentials
GEMINI_API_KEY=your_gemini_api_key
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
RESEND_API_KEY=your_resend_api_key
```

## Running the Application

Convex backend services and the Next.js development web server must run concurrently in separate terminal sessions.

**Terminal 1 (Convex Backend):**

```bash
npx convex dev
```

**Terminal 2 (Next.js Development Server):**

```bash
npm run dev
```

Once started, open your browser and navigate to:

`http://localhost:3000`
## Deployment

The Next.js frontend can be deployed to **Vercel** by connecting your GitHub repository and configuring all environment variables in the project settings.

The production Convex backend functions and schema can be deployed using:

```bash
npx convex deploy
```

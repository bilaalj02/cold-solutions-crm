# Cold Caller App

A dedicated cold calling management system for sales teams. This application is separate from the main Cold Solutions CRM and focuses specifically on cold calling activities.

## Features

- **Lead List Management**: View assigned lead lists with filtering and search
- **Call Tracking**: Log call outcomes and notes for each lead
- **Call Log**: View all call activities with filtering options
- **Progress Tracking**: Analytics and performance metrics
- **User Authentication**: Secure login system for cold callers

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd cold-caller-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

### Default Login Credentials

- **Email**: caller@coldcaller.com
- **Password**: caller123

## Project Structure

```
src/
├── app/
│   ├── dashboard/          # Main dashboard page
│   ├── login/             # Login page
│   ├── call-log/          # Call log page
│   ├── my-progress/       # Progress tracking page
│   ├── list/[id]/         # Individual lead list pages
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── lib/
│   └── leads.ts           # Data management and types
└── ...
```

## Usage

1. **Login**: Use the default credentials or contact admin for access
2. **Dashboard**: View all assigned lead lists
3. **Start Calling**: Click on a lead list to begin calling
4. **Log Calls**: Record call outcomes and notes
5. **Track Progress**: Monitor your performance and analytics

## Technology Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Local Storage** - Data persistence

## Port Configuration

This app runs on port 3001 to avoid conflicts with the main CRM (port 3000).

## Support

For technical support or questions, contact your system administrator.

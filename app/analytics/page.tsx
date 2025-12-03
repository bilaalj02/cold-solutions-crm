'use client'

import React from "react";
import StandardSidebar from "../../components/StandardSidebar";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AdvancedAnalyticsPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <StandardSidebar />

        <div className="flex flex-col flex-1 min-h-screen">
          <header className="glass-card border-0 p-6 m-4 mb-0">
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Test page</p>
          </header>

          <main className="flex-1 p-6">
            <div className="glass-card border-0 p-6">
              <p>Analytics content goes here</p>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

'use client';

import { useState } from 'react';
import { LeadManager } from '../../lib/leads';

export default function TestLoginPage() {
  const [result, setResult] = useState('');

  const addAdminUser = () => {
    try {
      // Add admin user manually
      const adminUser = {
        id: 'admin-001',
        name: 'Admin User',
        email: 'admin@coldsolutions.com',
        password: 'admin123',
        role: 'Admin' as const,
        territory: 'All',
        department: 'Management',
        maxLeads: 1000,
        active: true,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: undefined
      };

      LeadManager.saveUser(adminUser);
      setResult('Admin user added successfully!');
    } catch (error) {
      setResult('Error adding admin: ' + error);
    }
  };

  const testLogin = () => {
    try {
      // Get all users
      const users = LeadManager.getUsers();
      console.log('All users:', users);

      // Test admin login
      const user = LeadManager.authenticateUser('admin@coldsolutions.com', 'admin123');
      console.log('Auth result:', user);

      setResult(JSON.stringify({
        totalUsers: users.length,
        users: users.map(u => ({ email: u.email, active: u.active, role: u.role })),
        authResult: user ? 'SUCCESS' : 'FAILED'
      }, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Login Test Page</h1>
      <div className="space-x-4">
        <button
          onClick={addAdminUser}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Admin User
        </button>
        <button
          onClick={testLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Admin Login
        </button>
      </div>
      <pre className="mt-4 bg-gray-100 p-4 rounded overflow-auto">
        {result}
      </pre>
    </div>
  );
}
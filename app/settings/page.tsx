'use client'

import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import ProtectedRoute from "../../components/ProtectedRoute";
import { resetApplicationData } from "../../lib/reset-data";

interface User {
  email: string;
  password: string;
  name: string;
  role: 'Admin' | 'User' | 'Manager';
}

function SettingsPage() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'User' as 'Admin' | 'User' | 'Manager'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('cold_solutions_users') || '[]');
    const defaultUser = { email: 'admin@coldsolutions.com', password: 'admin123', name: 'Admin User', role: 'Admin' };

    if (!storedUsers.find((u: User) => u.email === defaultUser.email)) {
      storedUsers.push(defaultUser);
      localStorage.setItem('cold_solutions_users', JSON.stringify(storedUsers));
    }

    setUsers(storedUsers);
  };

  const handleAddUser = () => {
    if (!newUser.email || !newUser.password || !newUser.name) {
      alert('Please fill in all fields');
      return;
    }

    if (users.find(u => u.email === newUser.email)) {
      alert('User with this email already exists');
      return;
    }

    const updatedUsers = [...users, newUser];
    localStorage.setItem('cold_solutions_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setNewUser({ email: '', password: '', name: '', role: 'User' });
    setShowAddModal(false);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    const updatedUsers = users.map(u =>
      u.email === selectedUser.email ? selectedUser : u
    );
    localStorage.setItem('cold_solutions_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (email: string) => {
    if (email === 'admin@coldsolutions.com') {
      alert('Cannot delete the default admin user');
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(u => u.email !== email);
      localStorage.setItem('cold_solutions_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Manager': return 'bg-blue-100 text-blue-800';
      case 'User': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
            <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Settings</p>
          </div>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>dashboard</span>
              <p className="text-sm font-medium leading-normal">Dashboard</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/leads">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>group</span>
              <p className="text-sm font-medium leading-normal">Leads Database</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/calls">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>phone_in_talk</span>
              <p className="text-sm font-medium leading-normal">Calls Database</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>email</span>
              <p className="text-sm font-medium leading-normal">Email Management</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/automation">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>smart_toy</span>
              <p className="text-sm font-medium leading-normal">Automation Hub</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/analytics">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>analytics</span>
              <p className="text-sm font-medium leading-normal">Performance Analytics</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/operations">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>dvr</span>
              <p className="text-sm font-medium leading-normal">Operations Console</p>
            </a>
          </nav>
        </div>
        <div className="flex flex-col gap-2">
          <div className="px-4 py-3 rounded-lg bg-opacity-10 bg-white">
            <p className="text-xs font-medium" style={{color: '#a0a0a0'}}>SIGNED IN AS</p>
            <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
            <p className="text-xs" style={{color: '#a0a0a0'}}>{user?.email}</p>
          </div>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/settings">
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>settings</span>
            <p className="text-sm font-medium leading-normal">Settings</p>
          </a>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white text-left w-full"
          >
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>logout</span>
            <p className="text-sm font-medium leading-normal">Sign Out</p>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8" style={{backgroundColor: '#f9fafb'}}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Settings</h1>
            <p className="text-gray-600 mt-2">Manage system settings and user accounts</p>
          </div>

          {/* User Management Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold" style={{color: '#0a2240'}}>User Management</h2>
                  <p className="text-sm text-gray-600">Manage login credentials and user access</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  <span className="material-symbols-outlined" style={{fontSize: '16px'}}>add</span>
                  Add User
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.email}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="text-[#3dbff2] hover:text-blue-700 mr-4"
                        >
                          Edit
                        </button>
                        {user.email !== 'admin@coldsolutions.com' && (
                          <button
                            onClick={() => handleDeleteUser(user.email)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Management Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold" style={{color: '#0a2240'}}>Data Management</h2>
                <p className="text-sm text-gray-600">Manage application data and reset to clean state</p>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Reset Application Data</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Clear all leads, statistics, audits, and activities. This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all application data? This action cannot be undone.')) {
                      resetApplicationData();
                      alert('✅ Application data has been reset to clean state');
                      window.location.reload();
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium hover:opacity-90 bg-red-600"
                >
                  <span className="material-symbols-outlined" style={{fontSize: '16px'}}>refresh</span>
                  Reset Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4" style={{color: '#0a2240'}}>Add New User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#3dbff2'} as React.CSSProperties}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#3dbff2'} as React.CSSProperties}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#3dbff2'} as React.CSSProperties}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as 'Admin' | 'User' | 'Manager'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#3dbff2'} as React.CSSProperties}
                  >
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4" style={{color: '#0a2240'}}>Edit User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#3dbff2'} as React.CSSProperties}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#3dbff2'} as React.CSSProperties}
                    placeholder="Enter email address"
                    disabled={selectedUser.email === 'admin@coldsolutions.com'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={selectedUser.password}
                    onChange={(e) => setSelectedUser({...selectedUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#3dbff2'} as React.CSSProperties}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value as 'Admin' | 'User' | 'Manager'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#3dbff2'} as React.CSSProperties}
                  >
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProtectedSettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  );
}
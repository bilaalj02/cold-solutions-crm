'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeadManager, SalesUser } from '../../lib/leads';

export default function SettingsPage() {
  const [users, setUsers] = useState<SalesUser[]>([]);
  const [currentUser, setCurrentUser] = useState<SalesUser | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SalesUser | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User' as 'Admin' | 'Manager' | 'Sales Rep' | 'User',
    territory: '',
    department: '',
    maxLeads: 100,
    active: true
  });
  const router = useRouter();

  useEffect(() => {
    const user = LeadManager.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'Admin') {
      router.push('/cold-caller');
      return;
    }

    setCurrentUser(user);
    loadUsers();
  }, [router]);

  const loadUsers = () => {
    const allUsers = LeadManager.getUsers();
    setUsers(allUsers);
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if email already exists
    const existingUser = users.find(u => u.email === newUser.email);
    if (existingUser) {
      alert('A user with this email already exists');
      return;
    }

    LeadManager.createUser(newUser);
    loadUsers();
    setShowAddUserModal(false);
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'User',
      territory: '',
      department: '',
      maxLeads: 100,
      active: true
    });
  };

  const handleEditUser = (user: SalesUser) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password
      role: user.role,
      territory: user.territory || '',
      department: user.department || '',
      maxLeads: user.maxLeads || 100,
      active: user.active
    });
    setShowAddUserModal(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser || !newUser.name || !newUser.email) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if email already exists (excluding current user)
    const existingUser = users.find(u => u.email === newUser.email && u.id !== editingUser.id);
    if (existingUser) {
      alert('A user with this email already exists');
      return;
    }

    const updatedUser: SalesUser = {
      ...editingUser,
      name: newUser.name,
      email: newUser.email,
      password: newUser.password || editingUser.password, // Keep existing password if not changed
      role: newUser.role,
      territory: newUser.territory,
      department: newUser.department,
      maxLeads: newUser.maxLeads,
      active: newUser.active
    };

    LeadManager.saveUser(updatedUser);
    loadUsers();
    setShowAddUserModal(false);
    setEditingUser(null);
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'User',
      territory: '',
      department: '',
      maxLeads: 100,
      active: true
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own account');
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      LeadManager.deleteUser(userId);
      loadUsers();
    }
  };

  const handleLogout = () => {
    LeadManager.logout();
    router.push('/login');
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

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
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/cold-caller">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>list</span>
              <p className="text-sm font-medium leading-normal">Lead Lists</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/cold-caller/call-log">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>call</span>
              <p className="text-sm font-medium leading-normal">Call Log</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/cold-caller/my-progress">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>trending_up</span>
              <p className="text-sm font-medium leading-normal">My Progress</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/settings">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>settings</span>
              <p className="text-sm font-medium leading-normal">Settings</p>
            </a>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">person</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{currentUser.name}</p>
              <p className="text-xs text-gray-300">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        {/* Header */}
        <header className="p-6 bg-white border-b">
              <div className="flex items-center justify-between">
                <div>
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>User Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage users and their permissions</p>
                </div>
                <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{backgroundColor: '#3dbff2'}}
                >
              <span className="material-symbols-outlined text-sm">add</span>
                  Add User
                </button>
              </div>
        </header>

        <div className="p-6">
          {/* Users Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">All Users</h3>
              <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Territory</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Leads</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-600">person</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'Sales Rep' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.territory || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.maxLeads || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                        <button
                            onClick={() => handleEditUser(user)}
                            className="text-[#3dbff2] hover:text-[#2a9fd4]"
                        >
                          Edit
                        </button>
                          {user.id !== currentUser.id && (
                          <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
              </div>
      </main>

      {/* Add/Edit User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold" style={{color: '#0a2240'}}>
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setEditingUser(null);
                  setNewUser({
                    name: '',
                    email: '',
                    password: '',
                    role: 'User',
                    territory: '',
                    department: '',
                    maxLeads: 100,
                    active: true
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser ? '(leave blank to keep current)' : '*'}
                </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                  className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                  >
                    <option value="User">User</option>
                  <option value="Sales Rep">Sales Rep</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Territory</label>
                <input
                  type="text"
                  value={newUser.territory}
                  onChange={(e) => setNewUser({...newUser, territory: e.target.value})}
                  className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                  placeholder="Enter territory"
                />
              </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                  placeholder="Enter department"
                  />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Leads</label>
                  <input
                  type="number"
                  value={newUser.maxLeads}
                  onChange={(e) => setNewUser({...newUser, maxLeads: parseInt(e.target.value) || 100})}
                  className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                  placeholder="Maximum leads"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={newUser.active}
                    onChange={(e) => setNewUser({...newUser, active: e.target.checked})}
                    className="h-4 w-4 text-[#3dbff2] focus:ring-[#3dbff2] border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Active user
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setEditingUser(null);
                  setNewUser({
                    name: '',
                    email: '',
                    password: '',
                    role: 'User',
                    territory: '',
                    department: '',
                    maxLeads: 100,
                    active: true
                  });
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{backgroundColor: '#3dbff2'}}
              >
                {editingUser ? 'Update User' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
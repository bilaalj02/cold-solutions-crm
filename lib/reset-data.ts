// Utility to reset all application data to a clean state
export function resetApplicationData() {
  // Clear all localStorage data
  const keysToRemove = [
    'cold_solutions_leads',
    'cold_solutions_stats',
    'cold_solutions_audits',
    'cold_solutions_activities'
  ];

  keysToRemove.forEach(key => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  });

  console.log('✅ Application data reset to clean state');
}

// Initialize clean state on first load
export function initializeCleanState() {
  if (typeof window !== 'undefined') {
    // Only reset if no leads exist yet
    const existingLeads = localStorage.getItem('cold_solutions_leads');
    if (!existingLeads) {
      resetApplicationData();
    }
  }
}
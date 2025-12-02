// Get current child ID from localStorage
export const getCurrentChildId = (): number | null => {
  const childId = localStorage.getItem("selectedChildId");
  return childId ? parseInt(childId) : null;
};

// Get current child data from localStorage
export const getCurrentChild = () => {
  const childData = localStorage.getItem("selectedChild");
  return childData ? JSON.parse(childData) : null;
};

// Clear current child data
export const clearCurrentChild = () => {
  localStorage.removeItem("selectedChildId");
  localStorage.removeItem("selectedChild");
  // Dispatch custom event to notify components of the change
  window.dispatchEvent(new CustomEvent('childSelectionChanged'));
};

// Get current parent data from localStorage
export const getCurrentParent = () => {
  const parentData = localStorage.getItem("parent");
  if (parentData) {
    try {
      const parent = JSON.parse(parentData);
      return {
        id: parent.id,
        name: parent.name || parent.username || 'Parent',
      };
    } catch (e) {
      console.error('Error parsing parent data:', e);
    }
  }
  return null;
};
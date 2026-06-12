 
import API from './api';

// Get dashboard stats
export const getDashboardStats = async () => {
  const response = await API.get('/dashboard/stats');
  return response.data;
};

// Get recent meetings
export const getRecentMeetings = async () => {
  const response = await API.get('/dashboard/recent-meetings');
  return response.data;
};
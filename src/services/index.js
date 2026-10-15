import api from './api';

export const authService = {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data;
  },
};

export const dashboardService = {
  getOverview: async (hostelId) => {
    const { data } = await api.get('/dashboard/overview', { params: { hostelId } });
    return data;
  },
  getRevenue: async () => {
    const { data } = await api.get('/dashboard/revenue');
    return data;
  },
  getOccupancy: async () => {
    const { data } = await api.get('/dashboard/occupancy');
    return data;
  },
};

export const hostelService = {
  getHostels: async () => {
    const { data } = await api.get('/hostels');
    return data;
  },
  createHostel: async (hostelData) => {
    const { data } = await api.post('/hostels', hostelData);
    return data;
  },
  getFloors: async (hostelId) => {
    const { data } = await api.get(`/hostels/${hostelId}/floors`);
    return data;
  },
  createFloor: async (hostelId, floorData) => {
    const { data } = await api.post(`/hostels/${hostelId}/floors`, floorData);
    return data;
  },
};

export const roomService = {
  getRooms: async (params) => {
    const { data } = await api.get('/rooms', { params });
    return data;
  },
  getRoomById: async (id) => {
    const { data } = await api.get(`/rooms/${id}`);
    return data;
  },
  getRoomHistory: async (id) => {
    const { data } = await api.get(`/rooms/${id}/history`);
    return data;
  },
  createRoom: async (roomData) => {
    const { data } = await api.post('/rooms', roomData);
    return data;
  },
  getRoomBeds: async (roomId) => {
    const { data } = await api.get(`/rooms/${roomId}/beds`);
    return data;
  },
  createBed: async (roomId, bedData) => {
    const { data } = await api.post(`/rooms/${roomId}/beds`, bedData);
    return data;
  },
};

export const tenantService = {
  getTenants: async (params) => {
    const { data } = await api.get('/tenants', { params });
    return data;
  },
  getTenantById: async (id) => {
    const { data } = await api.get(`/tenants/${id}`);
    return data;
  },
  createTenant: async (tenantData) => {
    const { data } = await api.post('/tenants', tenantData);
    return data;
  },
  checkoutTenant: async (id) => {
    const { data } = await api.put(`/tenants/${id}/checkout`);
    return data;
  },
};

export const financeService = {
  getRents: async (params) => {
    const { data } = await api.get('/finance/rent', { params });
    return data;
  },
  generateMonthlyRent: async (month, year, hostelId) => {
    const { data } = await api.post('/finance/rent/generate-monthly', { month, year, hostelId });
    return data;
  },
  recordPayment: async (paymentData) => {
    const { data } = await api.post('/finance/payments', paymentData);
    return data;
  },
  getExpenses: async (params) => {
    const { data } = await api.get('/finance/expenses', { params });
    return data;
  },
  createExpense: async (expenseData) => {
    const { data } = await api.post('/finance/expenses', expenseData);
    return data;
  },
};

export const electricityService = {
  getReadings: async (params) => {
    const { data } = await api.get('/electricity/readings', { params });
    return data;
  },
  getRoomReadings: async (roomId) => {
    const { data } = await api.get(`/electricity/room/${roomId}`);
    return data;
  },
  saveReading: async (readingData) => {
    const { data } = await api.post('/electricity/readings', readingData);
    return data;
  },
};

export const staffService = {
  getStaff: async (params) => {
    const { data } = await api.get('/staff', { params });
    return data;
  },
  createStaff: async (staffData) => {
    const { data } = await api.post('/staff', staffData);
    return data;
  },
  updatePermissions: async (id, permissions) => {
    const { data } = await api.put(`/staff/${id}/permissions`, { permissions });
    return data;
  },
  deleteStaff: async (id) => {
    const { data } = await api.delete(`/staff/${id}`);
    return data;
  },
};

export const accessControlService = {
  getRolePermissions: async () => {
    const { data } = await api.get('/access-control/role-permissions');
    return data;
  },
  updateRolePermissions: async (role, permissions) => {
    const { data } = await api.put(`/access-control/role-permissions/${role}`, { permissions });
    return data;
  },
  getHostelAdmins: async () => {
    const { data } = await api.get('/access-control/hostel-admins');
    return data;
  },
  updateUserPermissions: async (id, permissions) => {
    const { data } = await api.put(`/access-control/user/${id}/permissions`, { permissions });
    return data;
  },
};

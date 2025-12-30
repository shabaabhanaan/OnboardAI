// Add getUserInfo function to API client
export const getUserInfo = async () => {
    return apiRequest('/api/auth/me');
};

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testRegisterAndLogin() {
  try {
    console.log('--- Starting Register & Login Test ---');
    const newUser = {
      name: 'Test User',
      email: `testuser_${Date.now()}@example.com`,
      password: 'testpassword123',
      role: 'customer',
      phone: '+91 90000 11111',
      city: 'Bengaluru',
      area: 'Test Area'
    };

    // Register
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, newUser);
    console.log('Register response status:', registerRes.status);
    console.log('Registered user ID:', registerRes.data.data?.user?._id || registerRes.data?.user?._id);

    // Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: newUser.email,
      password: newUser.password
    });
    console.log('Login response status:', loginRes.status);
    const token = loginRes.data.data?.token || loginRes.data?.token;
    console.log('Obtained JWT token length:', token?.length);

    // Verify token by calling a protected route (e.g., get my profile)
    const meRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Me endpoint status:', meRes.status);
    console.log('User info:', meRes.data.data?.user || meRes.data?.user);

    console.log('--- Test Completed Successfully ---');
  } catch (err) {
    console.error('Test failed:', err.response?.status, err.response?.data || err.message);
    process.exit(1);
  }
}

testRegisterAndLogin();

// Test script for authentication
const { getAuthToken } = require('./src/services/authService');

async function testAuth() {
  try {
    console.log('Testing authentication service...');
    const result = await getAuthToken();
    
    if (result.success) {
      console.log('Authentication successful!');
      console.log('Token:', result.token);
      console.log('Expires In:', result.expiresIn);
      console.log('Token Type:', result.tokenType);
    } else {
      console.error('Authentication failed:', result.error);
      console.error('Details:', result.details);
    }
  } catch (error) {
    console.error('Error during authentication test:', error);
  }
}

testAuth();

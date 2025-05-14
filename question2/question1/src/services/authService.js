const axios = require('axios');
const config = require('../config');

async function getAuthToken() {
  try {
    console.log('Getting new authentication token...');
    
    
    console.log('Auth Request:', {
      url: 'http://20.244.56.144/evaluation-service/auth',
      body: {
        email: "ripal.godhani@gmail.com",
        name: "godhani ripal rajiv bhai",
        rollNo: "eng22ct0042",
        accessCode: "CvtPcU",
        clientID: config.clientId,
        clientSecret: config.clientSecret
      }
    });
    
    const response = await axios.post('http://20.244.56.144/evaluation-service/auth', {
      email: "ripal.godhani@gmail.com",
      name: "godhani ripal rajiv bhai",
      rollNo: "eng22ct0042",
      accessCode: "CvtPcU",
      clientID: config.clientId || "748bc379-127a-4593-a2aa-6de529fbb1b1",//not using env for this 
      clientSecret: config.clientSecret || "PtPnXcRVHVMqXHZU" //this also hardcoded
    });
    
    console.log('Authentication successful:', response.data);
    return {
      success: true,
      token: response.data.access_token,
      expiresIn: response.data.expires_in,
      tokenType: response.data.token_type
    };
  } catch (error) {
    console.error('Authentication failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return {
      success: false,
      error: error.message,
      details: error.response ? error.response.data : null
    };
  }
}

module.exports = { getAuthToken };

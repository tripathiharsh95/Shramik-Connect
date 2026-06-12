const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

const testFullAPI = async () => {
  try {
    // Connect to DB to get actual IDs
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/labour_booking');
    console.log('Connected to MongoDB for ID lookup');
    
    const priya = await User.findOne({ email: 'priya@example.com' });
    const ravi = await User.findOne({ email: 'ravi@example.com' });
    
    if (!priya || !ravi) {
      console.log('Could not find Priya or Ravi in database. Have you run seed.js?');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`Priya ID: ${priya._id}, Ravi ID: ${ravi._id}`);
    await mongoose.disconnect();

    // 1. Login as Priya (customer)
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'priya@example.com', password: 'password1234' })
    });
    
    if (!loginRes.ok) {
      console.log('Login failed:', loginRes.status, await loginRes.text());
      return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Login success as:', loginData.data.user.name);
    
    // 2. Send a direct message to worker Ravi Kumar
    const recipientId = ravi._id.toString();
    const sendRes = await fetch('http://localhost:5000/api/chat/direct/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ recipientId, text: 'Hello Ravi! This is a test from Priya via REST API' })
    });
    
    console.log('Send response status:', sendRes.status);
    const sendData = await sendRes.json();
    console.log('✅ Send response:', JSON.stringify(sendData, null, 2));
    
    // 3. Fetch messages for this conversation
    const msgsRes = await fetch(`http://localhost:5000/api/chat/direct/${recipientId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const msgsData = await msgsRes.json();
    console.log('✅ Messages in conversation:', msgsData.data.messages.length);
    msgsData.data.messages.forEach(m => {
      console.log(`  [${m.sender?.name || m.sender}] => ${m.text} (${m.createdAt})`);
    });
    
    // 4. Fetch conversations list
    const convsRes = await fetch('http://localhost:5000/api/chat/direct/conversations', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const convsData = await convsRes.json();
    console.log('✅ Conversations count:', convsData.data.conversations.length);
    convsData.data.conversations.forEach(c => {
      console.log(`  Partner: ${c.partner?.name || c.partner} | Last: ${c.latestMessage.text}`);
    });
    
  } catch (err) {
    console.error('Error:', err);
  }
};

testFullAPI();


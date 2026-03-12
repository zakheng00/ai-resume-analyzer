#!/usr/bin/env node
/**
 * Dify API Diagnostic Script
 * 用来测试 Dify API 连接和获取应用信息
 */

const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.DIFY_API_KEY;
const API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';

console.log('\n🔍 Dify API 诊断工具\n');
console.log('配置信息:');
console.log('  API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : '❌ 未设置');
console.log('  API URL:', API_URL);
console.log('');

if (!API_KEY) {
  console.error('❌ DIFY_API_KEY 未设置！请在 .env 中配置');
  process.exit(1);
}

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

async function testDify() {
  try {
    // Test 1: Basic connection
    console.log('测试 1️⃣: 基础连接...');
    try {
      const response = await client.get('/applications');
      console.log('✅ API 连接成功！');
      console.log(`   返回数据: ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (err) {
      console.log('❌ /applications 端点失败:', err.response?.status, err.response?.data?.message || err.message);
    }

    // Test 2: Try to get app info
    console.log('\n测试 2️⃣: 获取应用信息...');
    try {
      const response = await client.get('/apps/current-user');
      console.log('✅ 获取用户应用成功！');
      console.log('   数据:', JSON.stringify(response.data, null, 2).substring(0, 500));
    } catch (err) {
      console.log('❌ /apps/current-user 失败:', err.response?.status, err.response?.data?.message || err.message);
    }

    // Test 3: Chat endpoint
    console.log('\n测试 3️⃣: Chat 端点...');
    try {
      const response = await client.post('/chat-messages', {
        inputs: {},
        query: '你好',
        response_mode: 'blocking',
        conversation_id: '',
        user: 'test-user',
      });
      console.log('✅ Chat 端点可用！');
      console.log('   响应:', JSON.stringify(response.data).substring(0, 200));
    } catch (err) {
      console.log('❌ Chat 端点失败:', err.response?.status, err.response?.data?.message || err.message);
      console.log('   提示: 如果显示 "not_chat_app"，说明你的应用是 Workflow 类型');
    }

    // Test 4: Workflow endpoint
    console.log('\n测试 4️⃣: Workflow 端点...');
    try {
      const response = await client.post('/workflows/run', {
        inputs: { test: 'hello' },
        response_mode: 'blocking',
        user: 'test-user',
      });
      console.log('✅ Workflow 端点可用！');
      console.log('   响应:', JSON.stringify(response.data).substring(0, 200));
    } catch (err) {
      console.log('❌ Workflow 端点失败:', err.response?.status, err.response?.data?.message || err.message);
      if (err.response?.data?.message?.includes('is required')) {
        console.log('   ✅ 好消息: 这表示 Workflow 正在运行，需要特定输入变量');
        console.log('   输入变量错误信息:', err.response?.data?.message);
      }
    }

    // Test 5: Manual test with resume content
    console.log('\n测试 5️⃣: 使用示例简历测试...');
    const sampleResume = `John Doe
Senior Software Engineer
Email: john@example.com
Phone: 123-456-7890

Experience:
- 5 years as Lead Developer
- Expert in Node.js, React, Python
- Managed team of 8 engineers

Skills:
- Full Stack Development
- System Design
- Team Leadership`;

    const inputVars = ['resume', 'resume_text', 'resumeText', 'text', 'content', 'input'];
    
    for (const varName of inputVars) {
      try {
        const inputs = {};
        inputs[varName] = sampleResume;
        
        const response = await client.post('/workflows/run', {
          inputs: inputs,
          response_mode: 'blocking',
          user: 'test-user',
        });
        
        console.log(`✅ 成功使用输入变量: "${varName}"`);
        console.log('   响应摘要:', JSON.stringify(response.data).substring(0, 300));
        break;
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        // Only log if it's not just "required" message
        if (!msg.includes('is required')) {
          console.log(`❌ "${varName}" 失败: ${msg}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ 诊断过程出错:', error.message);
  }

  console.log('\n\n📋 诊断总结:\n');
  console.log('1. ✅ 如果 API 连接成功 → API Key 和 URL 正确');
  console.log('2. 如果 Chat 端点失败但 "not_chat_app" → 你的应用是 Workflow 类型');
  console.log('3. 如果 Workflow 显示 "is required" → 输入变量名不对');
  console.log('4. 如果查看到具体的输入变量名 → 在 .env 中设置 DIFY_WORKFLOW_INPUT_VAR');
  console.log('\n💡 下一步: 查看上面的测试结果，确认具体问题\n');
}

testDify().catch(console.error);

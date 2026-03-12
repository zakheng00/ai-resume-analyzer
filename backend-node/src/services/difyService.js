// Dify Service
// Handles calls to Dify AI API for resume analysis

const axios = require('axios');

const difyClient = axios.create({
  baseURL: process.env.DIFY_API_URL || 'https://api.dify.ai/v1',
  timeout: 60000,
});

const FormData = require('form-data');
const fs = require('fs');

exports.analyzeResume = async (resumeText, analysisType = 'general') => {
  try {
    console.log('🔌 正在调用 Dify Workflow...');
    const apiKey = process.env.DIFY_API_KEY;
    if (!apiKey) {
      throw new Error('DIFY_API_KEY 未配置');
    }

    const configuredVar = process.env.DIFY_WORKFLOW_INPUT_VAR || 'resume_text';
    console.log(`📝 使用输入变量: "${configuredVar}"`);

    // Prepare JSON payload for text input (must wrap in 'inputs')
    const payload = {
      inputs: {
        [configuredVar]: resumeText,
      },
      response_mode: 'blocking',
      user: 'resume-analyzer',
    };

    const response = await difyClient.post('/workflows/run', payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log('✅ Dify Workflow 执行成功！');
    console.log('📊 响应数据结构:', Object.keys(response.data));

    return parseResponse(response.data);
  } catch (error) {
    console.error('❌ Dify API 错误:', error.response?.data || error.message);
    return {
      status: 'error',
      error: error.response?.data?.message || error.message,
      analysis: `错误: ${error.response?.data?.message || error.message}`,
      type: 'error',
    };
  }
};

// Helper function to parse Dify response
function parseResponse(data) {
  console.log('📊 Dify 返回数据:', JSON.stringify(data).substring(0, 200) + '...');

  let answerText = '';
  
  // Check different possible response structures
  if (data.answer) {
    answerText = data.answer;
  } else if (data.text) {
    answerText = data.text;
  } else if (data.output) {
    if (typeof data.output === 'string') {
      answerText = data.output;
    } else if (data.output.analysis) {
      answerText = data.output.analysis;
    } else if (data.output.text) {
      answerText = data.output.text;
    } else {
      answerText = JSON.stringify(data.output);
    }
  } else if (data.data?.answer) {
    answerText = data.data.answer;
  }

  // If still no answer, use the full data
  if (!answerText) {
    answerText = JSON.stringify(data, null, 2);
  }

  // Try to parse as JSON
  try {
    let cleanAnswer = answerText;
    if (cleanAnswer.includes('```json')) {
      cleanAnswer = cleanAnswer.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanAnswer.includes('```')) {
      cleanAnswer = cleanAnswer.replace(/```\n?/g, '');
    }
    
    const parsed = JSON.parse(cleanAnswer);
    console.log('✅ 成功解析为 JSON');
    return {
      status: 'success',
      analysis: parsed,
      type: 'json',
    };
  } catch (e) {
    console.log('ℹ️  返回为纯文本');
    return {
      status: 'success',
      analysis: answerText,
      type: 'text',
    };
  }
}

exports.getWorkflows = async () => {
  try {
    const response = await difyClient.get('/workflows', {
      headers: {
        'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ 获取工作流失败:', error.message);
    throw error;
  }
};

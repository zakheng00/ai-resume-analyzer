const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const FormData = require('form-data');
const stream = require('stream');
const difyService = require('../services/difyService');

const prisma = new PrismaClient();
const PARSER_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Resume Controller
// Handles resume upload and management logic

exports.uploadResume = async (req, res) => {
  try {
    console.log('✅ 收到上传请求');
    console.log('📄 文件名:', req.file?.originalname);
    console.log('📊 文件大小:', req.file?.size, 'bytes');

    if (!req.file) {
      console.log('❌ 没有文件');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('🔄 发送到 Python 服务...');
    // Create form data for Python service
    const formData = new FormData();
    const bufferStream = stream.Readable.from(req.file.buffer);
    formData.append('file', bufferStream, {
      filename: req.file.originalname,
      contentType: 'application/pdf',
    });

    // Send PDF to Python parser service
    const parserResponse = await axios.post(
      `${PARSER_URL}/parse`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 30000,
      }
    );

    console.log('✅ Python 服务返回数据');
    console.log('📝 提取字数:', parserResponse.data.extracted_text?.length);

    // Save resume to database
    const resume = await prisma.resume.create({
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        extractedText: parserResponse.data.extracted_text || '',
      },
    });

    console.log('💾 保存到数据库成功，ID:', resume.id);
    console.log('🤖 开始 AI 分析...');

    // 用 parserResponse.data.extracted_text 呼叫 difyService 分析（文本輸入）
    try {
      console.log('📊 发送简历文本到 Dify API...');
      const difyResult = await difyService.analyzeResume(parserResponse.data.extracted_text, 'general');
      console.log('✅ Dify 分析完成');

      // Save analysis results to database
      const analysis = await prisma.analysis.create({
        data: {
          resumeId: resume.id,
          analysisType: 'general',
          results: difyResult,
          score: extractScoreFromDifyResult(difyResult),
        },
      });
      console.log('💾 分析结果保存到数据库，Analysis ID:', analysis.id);
    } catch (err) {
      console.error('❌ 分析失败:', err.message);
    }

    res.json({
      id: resume.id,
      message: 'Resume uploaded and analyzed',
      fileName: resume.fileName,
      textLength: resume.extractedText.length,
    });
  } catch (error) {
    console.error('❌ 错误:', error.message);
    res.status(500).json({ error: error.message || 'Failed to upload resume' });
  }
};

exports.getResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: { analyses: true },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listResumes = async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ resumes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.resume.delete({
      where: { id },
    });
    res.json({ message: `Resume ${id} deleted` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to trigger analysis without blocking upload response
async function triggerAnalysis(resumeId, resumeText) {
  try {
    // Find resume file info from DB
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });
    if (!resume) throw new Error('Resume not found for analysis');

    // Get file buffer and filename from upload (you may need to pass req.file.buffer and req.file.originalname directly if available)
    // If you have file buffer in memory, pass it here. Otherwise, read from disk/storage.
    // For demo, assume you have req.file.buffer and req.file.originalname available in upload handler.
    // If not, you need to adjust uploadResume to pass file buffer and filename to triggerAnalysis.

    // Example: If you have file buffer and filename
    // const difyResult = await difyService.analyzeResume(fileBuffer, fileName, 'general');

    // If you only have extractedText, this will not work for file input workflow.
    // You need to pass file buffer and filename.

    // For now, just log error if not available
    console.log('❌ triggerAnalysis 需要 file buffer 和 filename 才能用 file input workflow');
    return null;
  } catch (error) {
    console.error('❌ 分析过程出错:', error.message);
    throw error;
  }
}

// Extract score from Dify result
function extractScoreFromDifyResult(result) {
  if (!result) return 0;
  
  // Try different ways to extract score
  if (typeof result === 'object') {
    if (result.score !== undefined) return result.score;
    if (result.data?.score !== undefined) return result.data.score;
    if (result.output?.score !== undefined) return result.output.score;
  }
  
  return 0;
}

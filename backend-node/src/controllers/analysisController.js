// Analysis Controller
// Handles resume analysis and AI evaluation logic

const { PrismaClient } = require('@prisma/client');
const difyService = require('../services/difyService');

const prisma = new PrismaClient();

exports.createAnalysis = async (req, res) => {
  try {
    const { resumeId, resumeText, analysisType = 'general' } = req.body;

    if (!resumeId || !resumeText) {
      return res.status(400).json({ error: 'resumeId and resumeText are required' });
    }

    console.log(`📊 开始分析简历 ${resumeId}...`);

    // Check if resume exists
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Call Dify API for analysis
    console.log('🤖 调用 Dify AI...');
    const difyResult = await difyService.analyzeResume(resumeText, analysisType);
    console.log('✅ Dify 返回结果');

    // Save analysis to database
    const analysis = await prisma.analysis.create({
      data: {
        resumeId: resumeId,
        analysisType: analysisType,
        results: typeof difyResult === 'string' ? difyResult : JSON.stringify(difyResult),
        score: extractScore(difyResult),
      },
    });

    console.log('💾 分析已保存，ID:', analysis.id);

    res.json({
      id: analysis.id,
      resumeId: analysis.resumeId,
      analysisType: analysis.analysisType,
      results: analysis.results,
      score: analysis.score,
      createdAt: analysis.createdAt,
    });
  } catch (error) {
    console.error('❌ 分析失败:', error.message);
    res.status(500).json({ error: error.message || 'Failed to create analysis' });
  }
};

exports.getAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: { resume: true },
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnalysisByResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Check if resume exists
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const analyses = await prisma.analysis.findMany({
      where: { resumeId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ resumeId, analyses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to extract score from Dify result
function extractScore(result) {
  if (!result) return 0;

  // Handle string results
  if (typeof result === 'string') {
    try {
      const parsed = JSON.parse(result);
      return extractScore(parsed);
    } catch {
      return 0;
    }
  }

  // Handle object results
  if (typeof result === 'object') {
    if (result.score !== undefined) return Number(result.score) || 0;
    if (result.data?.score !== undefined) return Number(result.data.score) || 0;
    if (result.output?.score !== undefined) return Number(result.output.score) || 0;

    // Try to find score in nested structures
    for (const key in result) {
      if (key.toLowerCase().includes('score')) {
        const value = Number(result[key]);
        if (!isNaN(value)) return value;
      }
    }
  }

  return 0;
}

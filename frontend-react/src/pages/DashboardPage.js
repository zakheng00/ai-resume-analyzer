import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function tryParseJson(input) {
  if (typeof input !== 'string') return input;
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

function getBlock(text, title) {
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`【${escapedTitle}】\\s*([\\s\\S]*?)(?=\\n\\s*【|$)`, 'm');
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

function getFirstBlock(text, titles) {
  for (const title of titles) {
    const content = getBlock(text, title);
    if (content) return content;
  }
  return '';
}

function normalizeAnalysis(rawResults) {
  const parsed = tryParseJson(rawResults);
  const objectPayload = typeof parsed === 'object' && parsed !== null ? parsed : null;

  const workflowText = objectPayload?.outputs?.result;
  const directResult = objectPayload?.result;
  const text = typeof workflowText === 'string'
    ? workflowText
    : typeof directResult === 'string'
      ? directResult
      : typeof parsed === 'string'
        ? parsed
        : JSON.stringify(parsed, null, 2);

  const candidateName =
    text.match(/候選人姓名\s*[:：]\s*(.+)/)?.[1]?.trim() ||
    text.match(/Candidate\s*Name\s*[:：]\s*(.+)/i)?.[1]?.trim() ||
    '';

  const scoreLine =
    text.match(/綜合評分\s*[:：]\s*([0-9]+(?:\.[0-9]+)?\s*\/\s*10)/)?.[1]?.trim() ||
    text.match(/Overall\s*Score\s*[:：]\s*([0-9]+(?:\.[0-9]+)?\s*\/\s*10)/i)?.[1]?.trim() ||
    '';

  const coreAnalysis = getFirstBlock(text, ['Core Competency Analysis']);
  const skillTagsText = getFirstBlock(text, ['Technical Skills']);
  const suggestionsText = getFirstBlock(text, ["Recruiter's Feedback & Suggestions"]);

  const skillTags = skillTagsText
    ? skillTagsText.split(',').map((item) => item.trim()).filter(Boolean)
    : [];

  const suggestions = suggestionsText
    ? suggestionsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.replace(/^\d+\s*[.、]\s*/, '').trim())
    : [];

  return {
    text,
    candidateName,
    scoreLine,
    coreAnalysis,
    skillTags,
    suggestions,
    hasStructuredSections: Boolean(candidateName || scoreLine || coreAnalysis || skillTags.length || suggestions.length),
  };
}

function DashboardPage() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resumeId');
  
  const [resume, setResume] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (resumeId) {
      fetchResumeAndAnalyses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  const fetchResumeAndAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch resume details
      const resumeResponse = await fetch(`http://localhost:3000/api/resumes/${resumeId}`);
      if (resumeResponse.ok) {
        const resumeData = await resumeResponse.json();
        setResume(resumeData);
      }

      // Fetch analyses for this resume
      const analysisResponse = await fetch(`http://localhost:3000/api/analyses/resume/${resumeId}`);
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setAnalyses(analysisData.analyses || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load resume data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">Resume Analysis Dashboard</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">⏳ Loading your resume analysis...</p>
            <p className="text-gray-500 text-sm mt-2">AI is analyzing your resume, this may take a moment</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-4 rounded">
            {error}
          </div>
        ) : resume ? (
          <div className="space-y-8">
            {/* Resume Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📄 {resume.fileName}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">File Size</p>
                  <p className="font-semibold">{(resume.fileSize / 1024).toFixed(2)} KB</p>
                </div>
                <div>
                  <p className="text-gray-500">Uploaded</p>
                  <p className="font-semibold">{new Date(resume.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Text Length</p>
                  <p className="font-semibold">{resume.extractedText?.length || 0} characters</p>
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            {analyses.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">🤖 AI Analysis Results</h3>
                {analyses.map((analysis) => (
                  <div key={analysis.id} className="bg-white rounded-lg shadow p-6">
                      {(() => {
                        const normalized = normalizeAnalysis(analysis.results);
                        return (
                          <>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">
                            Analysis Report
                          </h4>
                          <p className="text-gray-500 text-sm">
                            Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
                          </p>
                          {normalized.candidateName && (
                            <p className="text-sm mt-2 text-gray-700">
                              Candidate: <span className="font-semibold">{normalized.candidateName}</span>
                            </p>
                          )}
                        </div>
                        {analysis.score > 0 && (
                          <div className="text-right">
                            <p className="text-gray-500 text-sm">Overall Score</p>
                            <p className="text-4xl font-bold text-blue-600">{analysis.score}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 space-y-4">
                        {normalized.scoreLine && (
                          <div className="bg-blue-50 border border-blue-100 p-4 rounded">
                            <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">Overall Rating</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{normalized.scoreLine}</p>
                          </div>
                        )}

                        {normalized.coreAnalysis && (
                          <div className="bg-gray-50 p-4 rounded">
                            <h5 className="font-semibold text-gray-900 mb-2">Core Competitiveness</h5>
                            <p className="text-gray-700 whitespace-pre-wrap">{normalized.coreAnalysis}</p>
                          </div>
                        )}

                        {normalized.skillTags.length > 0 && (
                          <div className="bg-gray-50 p-4 rounded">
                            <h5 className="font-semibold text-gray-900 mb-3">Professional Skills</h5>
                            <div className="flex flex-wrap gap-2">
                              {normalized.skillTags.map((tag, idx) => (
                                <span
                                  key={`${analysis.id}-tag-${idx}`}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {normalized.suggestions.length > 0 && (
                          <div className="bg-amber-50 border border-amber-200 p-4 rounded">
                            <h5 className="font-semibold text-amber-900 mb-2">Headhunter Improvement Suggestions</h5>
                            <ol className="list-decimal list-inside space-y-2 text-amber-900">
                              {normalized.suggestions.map((suggestion, idx) => (
                                <li key={`${analysis.id}-suggestion-${idx}`}>{suggestion}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {!normalized.hasStructuredSections && (
                          <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap text-gray-700">
                            {normalized.text || <span className="text-gray-400">暫無分析結果，請稍後刷新</span>}
                          </div>
                        )}
                      </div>
                          </>
                        );
                      })()}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <p className="text-blue-900 text-lg mb-2">⏳ Analysis in Progress</p>
                <p className="text-blue-700">
                  AI is analyzing your resume. Please refresh the page in a few moments to see the results.
                </p>
                <button
                  onClick={fetchResumeAndAnalyses}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  🔄 Refresh
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No resume selected</p>
            <a href="/" className="text-blue-600 hover:text-blue-700 font-bold">
              Upload a resume to get started
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;

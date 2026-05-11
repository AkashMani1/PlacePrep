/* Developed by Akash Mani - AI Feedback Engine */

// Secure wrapper — calls server-side API route instead of exposing API key
export async function generateAIFeedback(data: {
  type: 'interview' | 'assessment';
  score: number;
  maxScore: number;
  accuracy: number;
  timeSpent: number;
  assessmentTitle?: string;
}) {
  try {
    const response = await fetch('/api/ai-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: data.type, data }),
    });

    if (!response.ok) throw new Error('API error');
    return await response.json();
  } catch (error) {
    console.warn('AI feedback fallback active:', error);
    // Local fallback
    return {
      summary: `Performance analysis: ${data.accuracy.toFixed(0)}% accuracy on ${data.assessmentTitle || 'assessment'}.`,
      strengths: data.accuracy >= 70 ? ['Strong fundamentals', 'Good time management'] : ['Completed under pressure'],
      weaknesses: data.accuracy < 70 ? ['Accuracy needs improvement', 'Review weak topics'] : ['Minor speed gaps'],
      communicationScore: Math.round(data.accuracy * 0.85),
      technicalScore: Math.round(data.accuracy),
      confidenceScore: Math.round(data.accuracy * 0.9),
      readinessScore: Math.round(data.accuracy * 0.8),
    };
  }
}

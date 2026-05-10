import { Submission, MockInterview } from './types';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

/**
 * Generates AI feedback for a mock interview or assessment using Gemini.
 */
export async function generateAIFeedback(data: any, type: 'interview' | 'assessment') {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    console.warn('Gemini API Key missing. Falling back to simulated feedback.');
    return simulateFeedback(type);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = type === 'interview' 
      ? `Analyze this mock interview data and provide structured feedback. Data: ${JSON.stringify(data)}. 
         Return a JSON object with: summary (string), strengths (string[]), weaknesses (string[]), communicationScore (number 0-100), technicalScore (number 0-100), confidenceScore (number 0-100), rejectionProbability (number 0-100).`
      : `Analyze this assessment submission and provide structured feedback. Data: ${JSON.stringify(data)}.
         Return a JSON object with: summary (string), strengths (string[]), weaknesses (string[]), overallScore (number 0-100), readinessScore (number 0-100).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Gemini API Error:', error);
    return simulateFeedback(type);
  }
}

function simulateFeedback(type: 'interview' | 'assessment') {
  if (type === 'interview') {
    return {
      summary: "Excellent technical knowledge, but communication could be more structured.",
      strengths: ["Strong problem solving", "Deep understanding of DSA", "Good edge case handling"],
      weaknesses: ["Occasional hesitation", "Filler words usage", "Brute force to optimal jump was slow"],
      communicationScore: 78,
      technicalScore: 92,
      confidenceScore: 85,
      rejectionProbability: 15
    };
  } else {
    return {
      summary: "Strong quantitative skills. Focus on improving coding velocity for the technical section.",
      strengths: ["Logical reasoning", "Accuracy in Math", "Speed in Verbal"],
      weaknesses: ["Time management in Coding", "Partial test cases passed"],
      overallScore: 84,
      readinessScore: 88
    };
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, type } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(simulateFeedback(type, data));
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = type === 'interview'
      ? `Analyze this mock interview data and provide structured feedback. Data: ${JSON.stringify(data)}. 
         Return a JSON object with: summary (string), strengths (string[]), weaknesses (string[]), communicationScore (number 0-100), technicalScore (number 0-100), confidenceScore (number 0-100), rejectionProbability (number 0-100).`
      : `Analyze this assessment submission and provide structured feedback. Data: ${JSON.stringify(data)}.
         Return a JSON object with: summary (string), strengths (string[]), weaknesses (string[]), overallScore (number 0-100), readinessScore (number 0-100).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }

    return NextResponse.json(simulateFeedback(type, data));
  } catch (error) {
    console.error('AI Feedback API Error:', error);
    return NextResponse.json(simulateFeedback('assessment', {}));
  }
}

function simulateFeedback(type: string, data: any) {
  const accuracy = data?.accuracy || 50;
  if (type === 'interview') {
    return {
      summary: "Good technical foundation. Focus on structured communication.",
      strengths: ["Problem solving", "DSA fundamentals", "Edge case handling"],
      weaknesses: ["Occasional hesitation", "Brute force approach first"],
      communicationScore: Math.round(accuracy * 0.85),
      technicalScore: Math.round(accuracy * 0.95),
      confidenceScore: Math.round(accuracy * 0.9),
      rejectionProbability: Math.max(5, 100 - accuracy),
    };
  }
  return {
    summary: `Performance at ${accuracy?.toFixed?.(0) || 50}% accuracy. ${accuracy > 70 ? 'Solid performance.' : 'Room for improvement.'}`,
    strengths: accuracy > 60 ? ["Logical reasoning", "Pattern recognition"] : ["Completed under time pressure"],
    weaknesses: accuracy < 70 ? ["Time management", "Accuracy on hard questions"] : ["Minor speed optimization"],
    overallScore: Math.round(accuracy),
    readinessScore: Math.round(accuracy * 0.85),
  };
}

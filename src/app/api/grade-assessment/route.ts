import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SEED_ASSESSMENTS } from '@/lib/mockQuestions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, assessmentId, answers, timeSpentSeconds, warnings } = body;

    if (!userId || !assessmentId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Validate Assessment
    const assessment = SEED_ASSESSMENTS.find(a => a.id === assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // 2. Server-side Scoring
    let score = 0;
    const questions = assessment.questions || [];
    const maxScore = questions.length * 10;
    const answeredCount = Object.keys(answers).length;

    for (const [qId, optIdx] of Object.entries(answers)) {
      const question = questions.find(q => q.id === qId);
      if (question && question.correctAnswer === Number(optIdx)) {
        score += 10;
      }
    }

    const accuracy = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const speed = answeredCount > 0 ? answeredCount / (timeSpentSeconds / 60) : 0;

    // 3. Compute Analytics
    const hiringProbability = Math.max(0, Math.min(100, Math.round(accuracy * 0.85 - warnings * 5)));

    const telemetry = {
      speed,
      antiCheatWarnings: warnings,
      hesitationPoints: 0, // Placeholder for deeper metrics
      hiringProbability
    };

    const submissionId = crypto.randomUUID();

    // 4. Persist to Database (Source of Truth)
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
    
    if (isValidUUID) {
      const { error } = await supabase.from('submissions').insert([{
        id: submissionId,
        user_id: userId,
        assessment_id: assessmentId,
        score,
        max_score: maxScore,
        accuracy,
        time_spent_seconds: timeSpentSeconds,
        telemetry,
      }]);

      if (error) {
        console.error('Failed to save submission (DB table might be missing or RLS violation):', error.message);
      }
    } else {
      console.warn('Skipping DB persistence for non-UUID user (Guest Mode):', userId);
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submissionId,
        assessmentId,
        score,
        maxScore,
        accuracy,
        timeSpentSeconds,
        telemetry
      }
    });

  } catch (error) {
    console.error('Server error during grading:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

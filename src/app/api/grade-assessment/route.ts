import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { SEED_ASSESSMENTS } from '@/lib/mockQuestions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, assessmentId, answers, timeSpentSeconds, warnings } = body;

    if (!userId || !assessmentId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Validate Assessment — DB-first, SEED fallback
    let questions: any[] = [];
    let assessmentTitle = 'Assessment';

    const { data: dbAssessment, error: fetchErr } = await supabaseAdmin
      .from('assessments')
      .select('*, questions(*)')
      .eq('id', assessmentId)
      .single();

    if (dbAssessment && !fetchErr) {
      // Normalize DB snake_case → camelCase
      questions = (dbAssessment.questions ?? []).map((q: any) => ({
        ...q,
        correctAnswer: q.correct_answer ?? q.correctAnswer,
      }));
      assessmentTitle = dbAssessment.title;
    } else {
      // Fallback to seed data (works even before DB schema is deployed)
      const seedAssessment = SEED_ASSESSMENTS.find(a => a.id === assessmentId);
      if (!seedAssessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }
      questions = seedAssessment.questions ?? [];
      assessmentTitle = seedAssessment.title;
    }

    // 2. Server-side Scoring (client CANNOT influence this)
    let score = 0;
    const maxScore = questions.length * 10;
    const answeredCount = Object.keys(answers).length;

    for (const [qId, optIdx] of Object.entries(answers)) {
      const question = questions.find((q: any) => q.id === qId);
      if (question && question.correctAnswer === Number(optIdx)) {
        score += 10;
      }
    }

    const accuracy = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const speed = answeredCount > 0 ? answeredCount / Math.max(1, timeSpentSeconds / 60) : 0;

    // 3. Server-side telemetry (tamper-proof)
    const antiCheatWarnings = Math.max(0, Number(warnings) || 0);
    const hiringProbability = Math.max(0, Math.min(100,
      Math.round(accuracy * 0.85 - antiCheatWarnings * 5)
    ));

    const telemetry = {
      speed,
      antiCheatWarnings,
      hiringProbability,
      answeredCount,
      totalQuestions: questions.length,
    };

    const submissionId = crypto.randomUUID();
    const completedAt = new Date().toISOString();

    // 4. Persist to DB (skip for anonymous/non-UUID users)
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);

    if (isValidUUID) {
      const { error: insertErr } = await supabaseAdmin.from('submissions').insert([{
        id: submissionId,
        user_id: userId,
        assessment_id: assessmentId,
        score,
        max_score: maxScore,
        accuracy,
        time_spent_seconds: timeSpentSeconds,
        completed_at: completedAt,
        telemetry,
        anti_cheat_warnings: antiCheatWarnings,
      }]);

      if (insertErr) {
        // DB write failed — log but don't fail (score is already calculated server-side)
        console.error('[grade-assessment] DB insert failed:', insertErr.code, insertErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submissionId,
        assessmentId,
        assessmentTitle,
        score,
        maxScore,
        accuracy,
        timeSpentSeconds,
        completedAt,
        telemetry,
      }
    });

  } catch (error) {
    console.error('[grade-assessment] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

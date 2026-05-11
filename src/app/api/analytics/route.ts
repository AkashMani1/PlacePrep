import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { data: subs, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error || !subs) {
      console.warn('DB Error in analytics:', error?.message);
      return NextResponse.json({
        totalMocks: 0, avgAccuracy: 0, streak: 0, bestStreak: 0,
        pressureIndex: 0, readinessScore: 0, recentTrend: 0,
        topicAccuracy: {}, weakTopics: [], strongTopics: [],
      });
    }

    if (subs.length === 0) {
      return NextResponse.json({
        totalMocks: 0, avgAccuracy: 0, streak: 0, bestStreak: 0,
        pressureIndex: 0, readinessScore: 0, recentTrend: 0,
        topicAccuracy: {}, weakTopics: [], strongTopics: [],
      });
    }

    const totalMocks = subs.length;
    const avgAccuracy = subs.reduce((s, sub) => s + sub.accuracy, 0) / subs.length;

    // Streak logic
    const dates = Array.from(new Set(subs.map(s => s.completed_at.split('T')[0]))).sort();
    let streak = 1;
    let bestStreak = 1;
    let currentStreak = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      const d1 = new Date(dates[i]);
      const d2 = new Date(dates[i - 1]);
      const diffDays = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 1) { currentStreak++; } else { break; }
    }
    streak = currentStreak;

    // pressure index (simplified for API)
    const pressureIndex = avgAccuracy * 0.85;

    // recent trend
    const recent3 = subs.slice(0, 3);
    const prev3 = subs.slice(3, 6);
    const recentAvg = recent3.reduce((s, sub) => s + sub.accuracy, 0) / recent3.length;
    const prevAvg = prev3.length > 0 ? prev3.reduce((s, sub) => s + sub.accuracy, 0) / prev3.length : recentAvg;
    const recentTrend = recentAvg - prevAvg;

    const readinessScore = Math.min(100, Math.round(avgAccuracy * 0.4 + pressureIndex * 0.3 + Math.min(streak * 5, 30)));

    return NextResponse.json({
      totalMocks, avgAccuracy, streak, bestStreak,
      pressureIndex, readinessScore, recentTrend,
      topicAccuracy: {}, weakTopics: [], strongTopics: [],
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

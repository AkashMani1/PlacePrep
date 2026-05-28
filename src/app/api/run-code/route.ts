import { NextRequest, NextResponse } from 'next/server';

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  cpp: { language: 'cpp', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
};

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
    }

    const trimmedCode = typeof code === 'string' ? code.trim() : '';

    if (!trimmedCode) {
      return NextResponse.json({ error: 'Code cannot be empty' }, { status: 400 });
    }

    // 50KB limit (approx 50,000 chars)
    if (trimmedCode.length > 50000) {
      return NextResponse.json({ error: 'Payload too large. Code limit is 50KB.' }, { status: 413 });
    }

    const pistonLang = LANGUAGE_MAP[language];
    if (!pistonLang) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: pistonLang.language,
        version: pistonLang.version,
        files: [
          {
            content: trimmedCode,
          },
        ],
      }),
      // Abort signal could be added here for robust timeout handling, but fetch is generally fine on Vercel (times out based on maxDuration)
    });

    if (!response.ok) {
      // If piston returns a JSON error, we try to parse it
      let errorMsg = 'Execution engine failed';
      try {
        const errData = await response.json();
        if (errData.message) errorMsg = errData.message;
      } catch (e) {
        errorMsg = `Execution engine returned status ${response.status}`;
      }
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      stdout: data.run?.stdout || '',
      stderr: data.run?.stderr || '',
      code: data.run?.code || 0,
    });
  } catch (error: any) {
    console.error('Run code error:', error);
    return NextResponse.json({ error: 'Failed to execute code' }, { status: 500 });
  }
}

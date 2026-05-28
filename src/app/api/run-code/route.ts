import { NextRequest, NextResponse } from 'next/server';

const LANGUAGE_MAP: Record<string, string> = {
  javascript: 'nodejs-20.17.0',
  python: 'cpython-3.10.15',
  cpp: 'gcc-13.2.0',
  java: 'openjdk-jdk-21+35',
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

    const wandboxCompiler = LANGUAGE_MAP[language];
    if (!wandboxCompiler) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        compiler: wandboxCompiler,
        code: trimmedCode,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Execution engine returned status ${response.status}` }, { status: response.status });
    }

    const data = await response.json();

    // Combine wandbox outputs
    const stdout = (data.compiler_output || '') + (data.program_output || '');
    const stderr = (data.compiler_error || '') + (data.program_error || '');

    return NextResponse.json({
      stdout: stdout,
      stderr: stderr,
      code: parseInt(data.status || "0", 10),
    });
  } catch (error: any) {
    console.error('Run code error:', error);
    return NextResponse.json({ error: 'Failed to execute code' }, { status: 500 });
  }
}

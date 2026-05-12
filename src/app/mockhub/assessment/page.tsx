import React from 'react';

export default function Page({ params, searchParams }: any) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4 animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mb-4">
        <span className="text-2xl">⚡</span>
      </div>
      <h1 className="text-3xl font-black text-white tracking-tight">Mock Hub</h1>
      <h2 className="text-xl font-bold text-muted-foreground uppercase tracking-widest">Route: /mockhub/assessment</h2>
      <p className="text-muted-foreground max-w-md">This module is running in an isolated Next.js Server Component environment. Realtime scope is restricted to this specific view.</p>
    </div>
  );
}

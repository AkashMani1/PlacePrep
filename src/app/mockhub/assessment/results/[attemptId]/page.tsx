'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentResults } from '@/components/mocks/components/AssessmentResults';
import { useMockStore } from '@/store/useMockStore';
import { Loader2 } from 'lucide-react';

export default function AssessmentResultsPage({ params }: { params: { attemptId: string } }) {
  const router = useRouter();
  const { submissions } = useMockStore();
  const [submission, setSubmission] = useState<any>(null);

  useEffect(() => {
    // In a real app, you would fetch the specific submission from the DB.
    // For this client-side store architecture, we find it in the global state.
    const sub = submissions.find(s => s.id === params.attemptId);
    if (sub) {
      setSubmission(sub);
    } else {
      // Provide a slight delay before deciding it's missing just in case Zustand is hydrating
      const timeout = setTimeout(() => {
        if (!submissions.find(s => s.id === params.attemptId)) {
          router.push('/mockhub/assessment/history');
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [params.attemptId, submissions, router]);

  if (!submission) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <AssessmentResults 
        submission={submission} 
        onClose={() => router.push('/mockhub/assessment/history')} 
      />
    </div>
  );
}

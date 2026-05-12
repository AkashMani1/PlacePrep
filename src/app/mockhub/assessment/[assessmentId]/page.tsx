'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentPortal } from '@/components/mocks/components/AssessmentPortal';
import { useMockStore } from '@/store/useMockStore';
import { Loader2 } from 'lucide-react';
import { SEED_ASSESSMENTS } from '@/lib/mockQuestions';

export default function AssessmentPage({ params }: { params: { assessmentId: string } }) {
  const router = useRouter();
  const { isAssessmentActive, startAssessment } = useMockStore();

  useEffect(() => {
    if (!isAssessmentActive && params.assessmentId) {
      const assessment = SEED_ASSESSMENTS.find(a => a.id === params.assessmentId);
      if (assessment) {
        startAssessment(assessment.id);
      } else {
        startAssessment(SEED_ASSESSMENTS[0].id);
      }
    }
  }, [params.assessmentId, isAssessmentActive, startAssessment]);

  if (!isAssessmentActive) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <AssessmentPortal />
    </div>
  );
}

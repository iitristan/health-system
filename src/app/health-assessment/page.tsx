// app/health-assessment/page.tsx (or similar)
import { Suspense } from 'react';
import HealthAssessmentPage from './healthassessmentpage/page';

export default function HealthAssessmentWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HealthAssessmentPage />
    </Suspense>
  );
}

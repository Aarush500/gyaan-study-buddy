import { useCallback, useEffect, useState } from 'react';

export interface OnboardingDraft {
  classLevel: string;
  strongSubjects: string[];
  weakSubjects: string[];
  language: string;
  studyStyle: string;
}

const KEY = 'gyaan:onboarding';

const EMPTY: OnboardingDraft = {
  classLevel: '',
  strongSubjects: [],
  weakSubjects: [],
  language: '',
  studyStyle: '',
};

function read(): OnboardingDraft {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

export function clearOnboardingDraft() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function useOnboardingDraft() {
  const [draft, setDraft] = useState<OnboardingDraft>(read);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(draft)); } catch { /* ignore */ }
  }, [draft]);

  const update = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  return { draft, update };
}

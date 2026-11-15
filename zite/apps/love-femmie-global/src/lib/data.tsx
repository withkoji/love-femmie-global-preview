import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from 'zitejs/auth';
import { getCatalog, getMe, claimReferral, type GetCatalogOutputType, type GetMeOutputType } from 'zitejs/api';

export type Article = GetCatalogOutputType['articles'][0];

export type Course = GetCatalogOutputType['courses'][0];
export type Recipe = GetCatalogOutputType['recipes'][0];
export type Video = GetCatalogOutputType['videos'][0];
export type Me = GetMeOutputType;

export const PLAN_RANK: Record<string, number> = { Discover: 0, Essential: 1, Plus: 2, Elite: 3 };
export const canAccess = (plan: string | undefined, required: string) => (PLAN_RANK[plan ?? 'Discover'] ?? 0) >= (PLAN_RANK[required] ?? 0);

export const PLANS = [
  { name: 'Discover', price: 0, tagline: 'Start exploring for free', features: ['Selected recipes and articles', 'Limited introductory videos', 'Community reading access', 'Free learning samples'] },
  { name: 'Essential', price: 4, tagline: 'Everything to start learning', features: ['Initial 200-course library', 'Educational videos and quizzes', 'Recipe collections', 'Progress tracking and certificates', 'Basic rewards eligibility'] },
  { name: 'Plus', price: 9.99, tagline: 'Go deeper, learn more', popular: true, features: ['400 courses as released', 'Advanced learning programs', 'Expanded streaming library', 'Downloadable materials', 'Additional member benefits'] },
  { name: 'Elite', price: 19.99, tagline: 'The complete FEMMIE experience', features: ['Full 1,000-content roadmap', 'Exclusive masterclasses', 'Premium streaming collections', 'Advanced certifications', 'Priority support & exclusive rewards'] },
] as const;

type Ctx = { catalog: GetCatalogOutputType | null; me: Me | null; refreshMe: () => Promise<void> };
const DataCtx = createContext<Ctx>({ catalog: null, me: null, refreshMe: async () => {} });

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<GetCatalogOutputType | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const refreshMe = useCallback(async () => {
    if (!user) return setMe(null);
    const ref = localStorage.getItem('lf-ref');
    if (ref) { localStorage.removeItem('lf-ref'); await claimReferral({ code: ref }).catch(() => {}); }
    setMe(await getMe({}));
  }, [user]);
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) localStorage.setItem('lf-ref', ref);
    getCatalog({}).then(setCatalog).catch(() => setCatalog({ courses: [], recipes: [], videos: [], articles: [] }));
  }, []);
  useEffect(() => { refreshMe().catch(() => {}); }, [refreshMe]);
  return <DataCtx.Provider value={{ catalog, me, refreshMe }}>{children}</DataCtx.Provider>;
}

export const useData = () => useContext(DataCtx);

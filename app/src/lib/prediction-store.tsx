import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BracketPicks, Prediction } from "./types";
import { PRIZE_POOL_BASE_SOL, STORAGE_KEY } from "./config";
import {
  applyPick,
  getChampionId,
  isBracketComplete,
  isMatchLocked,
  predictedCount,
  scoreBracket,
  totalToPredict,
} from "./bracket-logic";
import { MATCHES, RESULTS, TEAM_BY_ID } from "./tournament-data";
import { fetchPoolSol } from "./supabase-data";

interface PersistedState {
  picks: BracketPicks;
  locked: boolean;
  predictions: Prediction[];
  poolSol: number;
}

const EMPTY: PersistedState = {
  picks: {},
  locked: false,
  predictions: [],
  poolSol: PRIZE_POOL_BASE_SOL,
};

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      picks: parsed.picks ?? {},
      locked: parsed.locked ?? false,
      predictions: parsed.predictions ?? [],
      poolSol: parsed.poolSol ?? PRIZE_POOL_BASE_SOL,
    };
  } catch {
    return EMPTY;
  }
}

interface RecordInput {
  wallet: string;
  stakeSol: number;
  depositAddress?: string;
  paymentStatus?: "awaiting" | "paid";
  bracketHash?: string;
}

interface PredictionContextValue {
  picks: BracketPicks;
  locked: boolean;
  predictions: Prediction[];
  poolSol: number;
  championId: string | undefined;
  predicted: number;
  toPredict: number;
  complete: boolean;
  pick: (matchId: string, teamId: string) => void;
  reset: () => void;
  /** Lock + add a submitted prediction (payment handled by the modal/edge fn). */
  recordPrediction: (input: RecordInput) => void;
  /** Re-read the live prize pool from Supabase. */
  refreshPool: () => Promise<void>;
}

const PredictionContext = createContext<PredictionContextValue | null>(null);

export function PredictionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() =>
    typeof window === "undefined" ? EMPTY : load(),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Displayed pool = guaranteed base + real deposits (DB tracks deposits only).
  const refreshPool = useCallback(async () => {
    const sol = await fetchPoolSol();
    if (sol != null) setState((s) => ({ ...s, poolSol: PRIZE_POOL_BASE_SOL + sol }));
  }, []);

  // Load the live pool on mount (falls back to the cached value if offline).
  useEffect(() => {
    void refreshPool();
  }, [refreshPool]);

  const pick = useCallback((matchId: string, teamId: string) => {
    setState((s) => {
      if (s.locked || isMatchLocked(matchId)) return s;
      return { ...s, picks: applyPick(s.picks, matchId, teamId, MATCHES, RESULTS) };
    });
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({ ...s, picks: {}, locked: false }));
  }, []);

  const recordPrediction = useCallback((input: RecordInput) => {
    setState((s) => {
      const championId = getChampionId(s.picks);
      if (!championId) return s;
      const champion = TEAM_BY_ID[championId];
      const grade = scoreBracket(s.picks);
      const prediction: Prediction = {
        id: `pred_${Date.now().toString(36)}_${Math.floor(performance.now())}`,
        wallet: input.wallet,
        championId,
        championCode: champion.code,
        championName: champion.name,
        championFlag: champion.flag ?? "",
        picks: { ...s.picks },
        bracketHash: input.bracketHash,
        stakeSol: input.stakeSol,
        createdAt: Date.now(),
        status: "pending",
        correctPicks: grade.correct,
        gradedResults: grade.graded,
        depositAddress: input.depositAddress,
        paymentStatus: input.paymentStatus ?? "awaiting",
      };
      return { ...s, locked: true, predictions: [prediction, ...s.predictions] };
    });
  }, []);

  const value = useMemo<PredictionContextValue>(
    () => ({
      picks: state.picks,
      locked: state.locked,
      predictions: state.predictions,
      poolSol: state.poolSol,
      championId: getChampionId(state.picks),
      predicted: predictedCount(state.picks),
      toPredict: totalToPredict(),
      complete: isBracketComplete(state.picks),
      pick,
      reset,
      recordPrediction,
      refreshPool,
    }),
    [state, pick, reset, recordPrediction, refreshPool],
  );

  return <PredictionContext.Provider value={value}>{children}</PredictionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePredictions(): PredictionContextValue {
  const ctx = useContext(PredictionContext);
  if (!ctx) throw new Error("usePredictions must be used within a PredictionProvider");
  return ctx;
}

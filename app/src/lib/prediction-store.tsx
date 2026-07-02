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
import { MIN_STAKE_SOL, STORAGE_KEY } from "./config";
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
  poolSol: 0,
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
      poolSol: parsed.poolSol ?? 0,
    };
  } catch {
    return EMPTY;
  }
}

interface SubmitResult {
  ok: boolean;
  error?: string;
}

interface PredictionContextValue {
  picks: BracketPicks;
  locked: boolean;
  predictions: Prediction[];
  poolSol: number;
  /** Predicted champion (winner of the final), if the bracket reaches it. */
  championId: string | undefined;
  /** How many to-predict matches are filled, and how many there are. */
  predicted: number;
  toPredict: number;
  complete: boolean;
  /** Predict a match winner (no-op if locked/played or the match isn't editable). */
  pick: (matchId: string, teamId: string) => void;
  /** Clear the bracket and unlock. */
  reset: () => void;
  /** Lock + record the prediction (mock — no chain/DB). */
  submit: (wallet: string, stakeSol: number) => SubmitResult;
}

const PredictionContext = createContext<PredictionContextValue | null>(null);

export function PredictionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() =>
    typeof window === "undefined" ? EMPTY : load(),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const pick = useCallback((matchId: string, teamId: string) => {
    setState((s) => {
      if (s.locked || isMatchLocked(matchId)) return s;
      return { ...s, picks: applyPick(s.picks, matchId, teamId, MATCHES, RESULTS) };
    });
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({ ...s, picks: {}, locked: false }));
  }, []);

  const submit = useCallback((wallet: string, stakeSol: number): SubmitResult => {
    if (!wallet) return { ok: false, error: "Connect your wallet first." };
    if (!Number.isFinite(stakeSol) || stakeSol < MIN_STAKE_SOL) {
      return { ok: false, error: `Minimum stake is ${MIN_STAKE_SOL} SOL.` };
    }

    let result: SubmitResult = { ok: false };
    setState((s) => {
      if (!isBracketComplete(s.picks)) {
        result = { ok: false, error: "Fill in the whole bracket first." };
        return s;
      }
      const championId = getChampionId(s.picks)!;
      const champion = TEAM_BY_ID[championId];
      const grade = scoreBracket(s.picks);
      const prediction: Prediction = {
        id: `pred_${Date.now().toString(36)}_${Math.floor(performance.now())}`,
        wallet,
        championId,
        championCode: champion.code,
        championName: champion.name,
        championFlag: champion.flag ?? "",
        picks: { ...s.picks },
        stakeSol,
        createdAt: Date.now(),
        status: "pending",
        correctPicks: grade.correct,
        gradedResults: grade.graded,
      };
      result = { ok: true };
      return {
        ...s,
        locked: true,
        predictions: [prediction, ...s.predictions],
        poolSol: s.poolSol + stakeSol,
      };
    });
    return result;
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
      submit,
    }),
    [state, pick, reset, submit],
  );

  return <PredictionContext.Provider value={value}>{children}</PredictionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePredictions(): PredictionContextValue {
  const ctx = useContext(PredictionContext);
  if (!ctx) throw new Error("usePredictions must be used within a PredictionProvider");
  return ctx;
}

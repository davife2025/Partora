"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";

export interface HistorySong {
  song_id:      string;
  title:        string;
  artist?:      string;
  key:          string;
  mode:         string;
  source:       string;
  artwork_url?: string;
  created_at:   string;
  result_id?:   string;
  soprano_solfa?: string;
  alto_solfa?:    string;
  tenor_solfa?:   string;
  bass_solfa?:    string;
}

interface HistoryState {
  songs:    HistorySong[];
  loading:  boolean;
  error:    string | null;
  hasMore:  boolean;
  offset:   number;
}

const PAGE = 20;

export function useHistory() {
  const [state, setState] = useState<HistoryState>({
    songs: [], loading: false, error: null, hasMore: false, offset: 0,
  });

  const fetchPage = useCallback(async (offset: number, append = false) => {
    setState((s) => ({ ...s, loading: true, error: null }));

    const res = await api.get<HistorySong[]>(
      `/api/user/history?limit=${PAGE}&offset=${offset}`
    );

    if (res.success && res.data) {
      setState((s) => ({
        songs:   append ? [...s.songs, ...res.data!] : res.data!,
        loading: false,
        error:   null,
        hasMore: res.data!.length === PAGE,
        offset:  offset + res.data!.length,
      }));
    } else {
      setState((s) => ({ ...s, loading: false, error: res.error ?? "Failed to load history" }));
    }
  }, []);

  const loadMore = useCallback(() => {
    fetchPage(state.offset, true);
  }, [fetchPage, state.offset]);

  const refresh = useCallback(() => {
    fetchPage(0, false);
  }, [fetchPage]);

  // Auto-load on first call
  const load = useCallback(() => {
    if (state.songs.length === 0 && !state.loading) fetchPage(0);
  }, [fetchPage, state.songs.length, state.loading]);

  return { ...state, load, loadMore, refresh };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface LibrarySong {
  id:          string;
  title:       string;
  artist?:     string;
  key:         string;
  mode:        string;
  source:      string;
  artwork_url?: string;
  created_at:  string;
  satb_results?: Array<{ id: string; created_at: string }>;
}

export interface LibraryState {
  songs:    LibrarySong[];
  loading:  boolean;
  error:    string | null;
  total:    number;
}

export function useLibrary() {
  const [state, setState] = useState<LibraryState>({
    songs: [], loading: true, error: null, total: 0,
  });

  const fetchLibrary = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const res = await api.get<LibrarySong[]>("/api/user/history?limit=50");
    if (res.success && res.data) {
      setState({ songs: res.data, loading: false, error: null, total: res.data.length });
    } else {
      setState((s) => ({ ...s, loading: false, error: res.error ?? "Failed to load library" }));
    }
  }, []);

  useEffect(() => { fetchLibrary(); }, [fetchLibrary]);

  const deleteSong = useCallback(async (songId: string) => {
    const res = await api.post(`/api/user/songs/${songId}/delete`, {});
    if (res.success) {
      setState((s) => ({
        ...s,
        songs: s.songs.filter((song) => song.id !== songId),
        total: s.total - 1,
      }));
      return true;
    }
    return false;
  }, []);

  return { ...state, fetchLibrary, deleteSong };
}

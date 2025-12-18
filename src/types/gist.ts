/**
 * Shared TypeScript type definitions for GitHub Gist data structures
 * 
 * These types are used across the application for type safety when working with GitHub Gist API responses.
 */

export interface GistFile {
  filename: string;
  type: string;
  language: string | null;
  raw_url: string;
  size: number;
  content: string;
}

export interface GistOwner {
  login: string;
  avatar_url: string;
}

export interface GistData {
  id: string;
  description: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: Record<string, GistFile>;
  owner: GistOwner | null;
  html_url: string;
}

export interface GistApiSuccess {
  success: true;
  data: GistData;
}

export interface GistApiError {
  success: false;
  error: string;
  status?: number;
  retryAfter?: number;
}

export type GistApiResult = GistApiSuccess | GistApiError;

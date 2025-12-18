/**
 * URL parsing result types
 */

export interface ParseSuccess {
  success: true;
  gistId: string;
  username?: string;
}

export interface ParseError {
  success: false;
  error: string;
}

export type ParseResult = ParseSuccess | ParseError;

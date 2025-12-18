/**
 * Content type inference and rendering type definitions
 */

export type InferredContentType = 
  | 'html'
  | 'markdown'
  | 'json'
  | 'css'
  | 'javascript'
  | 'code'
  | 'text';

export interface ContentTypeResult {
  type: InferredContentType;
  confidence: number;
}

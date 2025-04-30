import type { TiktokenModel } from '@dqbd/tiktoken';
import type { CommitType } from '../config.js';

export interface AIProvider {
  generateCommitMessage(
    apiKey: string,
    model: string,
    locale: string,
    diff: string,
    completions: number,
    maxLength: number,
    type: CommitType,
    timeout: number,
    proxy?: string,
  ): Promise<string[]>;
}

export interface AIProviderConfig {
  name: string;
  apiKey?: string;
  model: string;
  baseUrl?: string;
  timeout: number;
  proxy?: string;
} 
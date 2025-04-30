import { OpenAIProvider } from './openai.js';
import { DeepSeekProvider } from './deepseek.js';
import { OllamaProvider } from './ollama.js';
import type { AIProvider, AIProviderConfig } from './base.js';

export class AIProviderFactory {
  private static providers: Record<string, AIProvider> = {
    openai: new OpenAIProvider(),
    deepseek: new DeepSeekProvider(),
    ollama: new OllamaProvider(),
  };

  static getProvider(config: AIProviderConfig): AIProvider {
    const provider = this.providers[config.name.toLowerCase()];
    if (!provider) {
      throw new Error(`Unknown AI provider: ${config.name}`);
    }
    return provider;
  }

  static getAvailableProviders(): string[] {
    return Object.keys(this.providers);
  }
} 
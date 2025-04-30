import https from 'https';
import type { ClientRequest, IncomingMessage } from 'http';
import createHttpsProxyAgent from 'https-proxy-agent';
import { KnownError } from '../error.js';
import type { CommitType } from '../config.js';
import { generatePrompt } from '../prompt.js';
import type { AIProvider } from './base.js';

interface OllamaResponse {
  response: string;
}

const httpsPost = async (
  hostname: string,
  path: string,
  headers: Record<string, string>,
  json: unknown,
  timeout: number,
  proxy?: string,
) => new Promise<{
  request: ClientRequest;
  response: IncomingMessage;
  data: string;
}>((resolve, reject) => {
  const postContent = JSON.stringify(json);
  const request = https.request(
    {
      port: 443,
      hostname,
      path,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postContent),
      },
      timeout,
      agent: (
        proxy
          ? createHttpsProxyAgent(proxy)
          : undefined
      ),
    },
    (response) => {
      const body: Buffer[] = [];
      response.on('data', chunk => body.push(chunk));
      response.on('end', () => {
        resolve({
          request,
          response,
          data: Buffer.concat(body).toString(),
        });
      });
    },
  );
  request.on('error', reject);
  request.on('timeout', () => {
    request.destroy();
    reject(new KnownError(`Time out error: request took over ${timeout}ms. Try increasing the \`timeout\` config`));
  });

  request.write(postContent);
  request.end();
});

const createChatCompletion = async (
  baseUrl: string,
  json: any,
  timeout: number,
  proxy?: string,
) => {
  const url = new URL(baseUrl);
  const { response, data } = await httpsPost(
    url.hostname,
    url.pathname,
    {},
    json,
    timeout,
    proxy,
  );

  if (
    !response.statusCode
    || response.statusCode < 200
    || response.statusCode > 299
  ) {
    let errorMessage = `Ollama API Error: ${response.statusCode} - ${response.statusMessage}`;

    if (data) {
      errorMessage += `\n\n${data}`;
    }

    throw new KnownError(errorMessage);
  }

  return JSON.parse(data) as OllamaResponse;
};

const sanitizeMessage = (message: string) => message.trim().replace(/[\n\r]/g, '').replace(/(\w)\.$/, '$1');

export class OllamaProvider implements AIProvider {
  async generateCommitMessage(
    _apiKey: string,
    model: string,
    locale: string,
    diff: string,
    _completions: number,
    maxLength: number,
    type: CommitType,
    timeout: number,
    proxy?: string,
  ): Promise<string[]> {
    try {
      const completion = await createChatCompletion(
        'http://localhost:11434/api/generate',
        {
          model,
          prompt: `${generatePrompt(locale, maxLength, type)}\n\n${diff}`,
          stream: false,
        },
        timeout,
        proxy,
      );

      return [sanitizeMessage(completion.response)];
    } catch (error) {
      const errorAsAny = error as any;
      if (errorAsAny.code === 'ENOTFOUND') {
        throw new KnownError(`Error connecting to Ollama API. Make sure Ollama is running locally on port 11434.`);
      }

      throw errorAsAny;
    }
  }
} 
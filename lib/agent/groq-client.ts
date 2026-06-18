import { LanguageModel } from "ai";
import { groq } from "@ai-sdk/groq";

// Simple in-memory queue for rate limiting
// For multi-instance deployments, replace with Redis-based queue
interface QueuedRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  execute: () => Promise<unknown>;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private running = 0;
  private readonly concurrency: number;
  private readonly maxRetries: number;
  private readonly baseDelay: number;

  constructor(concurrency = 2, maxRetries = 3, baseDelay = 1000) {
    this.concurrency = concurrency;
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }

  async enqueue<T>(execute: () => T | Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        resolve: resolve as (value: unknown) => void,
        reject,
        execute: async () => execute(),
      });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const item = this.queue.shift()!;

    try {
      const result = await this.executeWithRetry(item.execute);
      item.resolve(result);
    } catch (error) {
      item.reject(error as Error);
    } finally {
      this.running--;
      this.process();
    }
  }

  private async executeWithRetry<T>(
    execute: () => Promise<T>,
    attempt = 1
  ): Promise<T> {
    try {
      return await execute();
    } catch (error: unknown) {
      const isRateLimit = this.isRateLimitError(error);
      const isRetryable = isRateLimit || this.isRetryableError(error);

      if (isRetryable && attempt < this.maxRetries) {
        const delay = this.calculateDelay(attempt, isRateLimit);
        await this.sleep(delay);
        return this.executeWithRetry(execute, attempt + 1);
      }

      throw error;
    }
  }

  private isRateLimitError(error: unknown): boolean {
    if (error instanceof Response) {
      return error.status === 429;
    }
    if (error && typeof error === "object" && "status" in error) {
      return (error as { status: number }).status === 429;
    }
    if (error && typeof error === "object" && "cause" in error) {
      return this.isRateLimitError((error as { cause: unknown }).cause);
    }
    const message = error instanceof Error ? error.message : String(error);
    return message.includes("429") || message.includes("rate limit") || message.includes("Rate limit");
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof Response) {
      return error.status >= 500;
    }
    if (error && typeof error === "object" && "status" in error) {
      return (error as { status: number }).status >= 500;
    }
    return false;
  }

  private calculateDelay(attempt: number, isRateLimit: boolean): number {
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000;
    // Rate limits get longer delays
    return isRateLimit ? exponentialDelay * 2 + jitter : exponentialDelay + jitter;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getRunningCount(): number {
    return this.running;
  }
}

// Singleton queue instance
const requestQueue = new RequestQueue(
  parseInt(process.env.GROQ_QUEUE_CONCURRENCY ?? "2", 10),
  parseInt(process.env.GROQ_MAX_RETRIES ?? "3", 10),
  parseInt(process.env.GROQ_BASE_DELAY_MS ?? "1000", 10)
);

/**
 * Get a Groq model with optional queue wrapping.
 * Use `useQueue: true` for production traffic to respect rate limits.
 */
export function getGroqModel(
  modelId?: string,
  options?: { useQueue?: boolean }
): LanguageModel {
  const model = groq(modelId ?? process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile");

  if (!options?.useQueue) {
    return model;
  }

  // Wrap the model to use the queue
  // Note: This is a simplified wrapper. The AI SDK doesn't directly support
  // middleware on models, so we use the queue at the streamText call site instead.
  // This function is kept for API consistency.
  return model;
}

/**
 * Execute a streamText call with queue and retry logic.
 * Use this instead of calling streamText directly for production requests.
 */
export async function queuedStreamText<T>(
  execute: () => T | Promise<T>
): Promise<T> {
  return requestQueue.enqueue(async () => execute()) as Promise<T>;
}

/**
 * Check if we're approaching rate limits (for monitoring/alerting)
 */
export function getQueueStats(): { queued: number; running: number } {
  return {
    queued: requestQueue.getQueueLength(),
    running: requestQueue.getRunningCount(),
  };
}

/**
 * Estimate if a request would exceed token limits
 */
export function wouldExceedTokenLimit(
  estimatedInputTokens: number,
  estimatedOutputTokens: number = 2000,
  modelContextWindow: number = 128000
): boolean {
  const total = estimatedInputTokens + estimatedOutputTokens;
  return total > modelContextWindow * 0.9; // 90% safety margin
}
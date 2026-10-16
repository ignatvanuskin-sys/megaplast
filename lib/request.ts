/**
 * Определение IP клиента для ограничения частоты запросов.
 *
 * Прокси дописывает адрес в конец цепочки X-Forwarded-For, поэтому первый
 * элемент подделывается любым клиентом — брать его нельзя. На Vercel
 * достоверный адрес приходит в x-real-ip; там, где его нет (локальный запуск),
 * используем последний элемент цепочки.
 */
export function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;

  const chain = request.headers.get("x-forwarded-for");
  if (chain) {
    const parts = chain
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return "unknown";
}

/** Простое ограничение частоты: N действий за окно времени на один IP. */
export class RateLimiter {
  private buckets = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  /** true — запрос нужно отклонить. */
  hit(key: string): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return false;
    }

    bucket.count += 1;

    // Не даём словарю расти бесконечно на долгоживущем процессе
    if (this.buckets.size > 5000) {
      for (const [k, v] of this.buckets) {
        if (v.resetAt < now) this.buckets.delete(k);
      }
    }

    return bucket.count > this.limit;
  }
}

/**
 * 统一 API 错误响应与日志：避免在生产环境把敏感信息写入日志，并返回可区分的错误码供前端提示。
 */
import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'RATE_LIMIT'
  | 'INSUFFICIENT_CREDITS'
  | 'INTERNAL_ERROR';

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  extra?: Record<string, unknown>
): NextResponse {
  const body = { error: message, code, ...extra };
  return NextResponse.json(body, { status });
}

/** 生产环境不把完整 error 对象打到 console，只打 message 与 code */
export function logApiError(context: string, err: unknown, code?: ApiErrorCode): void {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${context}]`, code ?? 'ERROR', msg);
  } else {
    console.error(`[${context}]`, err);
  }
}

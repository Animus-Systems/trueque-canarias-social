import { TRPCClientError } from '@trpc/client';

export function readErrorMessage(error: unknown): string {
  if (error instanceof TRPCClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected application error';
}

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../src/server/router';

let currentLang = 'es';

export function setApiLanguage(lang: string) {
  currentLang = lang;
}

function makeLink(extraHeaders?: () => Record<string, string>) {
  return httpBatchLink({
    url: `${import.meta.env.VITE_API_URL || ''}/trpc`,
    headers() {
      return {
        'accept-language': currentLang,
        ...extraHeaders?.(),
      };
    },
    fetch(url, options) {
      return fetch(url, { ...options, credentials: 'include' });
    },
  });
}

export const api = createTRPCProxyClient<AppRouter>({
  links: [makeLink()],
});

export function createAdminClient(token: string) {
  return createTRPCProxyClient<AppRouter>({
    links: [makeLink(() => ({ 'x-admin-token': token }))],
  });
}

import { generateOpenApiDocument } from 'trpc-openapi';
import { appConfig } from './config.js';
import { appRouter } from './router.js';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Trueque Canarias Social API',
  description: 'Anonymous barter-equivalent search and contribution API.',
  version: '1.0.0',
  baseUrl: `${appConfig.appOrigin}/api`,
  tags: ['session', 'equivalents', 'ai', 'contributions', 'feedback', 'flags', 'moderation'],
});

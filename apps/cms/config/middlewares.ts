import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            env('R2_PUBLIC_URL', '').replace(/^https?:\/\//, ''),
            '*.r2.dev',
            '*.r2.cloudflarestorage.com',
          ].filter(Boolean),
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            env('R2_PUBLIC_URL', '').replace(/^https?:\/\//, ''),
            '*.r2.dev',
            '*.r2.cloudflarestorage.com',
          ].filter(Boolean),
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;

import type { Core } from '@strapi/strapi';
import { registerCloudflareSync } from './utils/cloudflare-sync';
import { normalizeUploadFileRecord } from './utils/media-url';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ['plugin::upload.file'],
      afterFindOne(event: any) {
        normalizeUploadFileRecord(event.result);
      },
      afterFindMany(event: any) {
        normalizeUploadFileRecord(event.result);
      },
    });

    registerCloudflareSync(strapi);
  },
};

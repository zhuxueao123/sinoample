type SyncEntity =
  | 'product-category'
  | 'product'
  | 'solution'
  | 'blog-category'
  | 'blog-post'
  | 'faq'
  | 'sales-region-rule';

const uidToEntity: Record<string, SyncEntity> = {
  'api::product-category.product-category': 'product-category',
  'api::product.product': 'product',
  'api::solution.solution': 'solution',
  'api::blog-category.blog-category': 'blog-category',
  'api::blog-post.blog-post': 'blog-post',
  'api::faq.faq': 'faq',
  'api::sales-region-rule.sales-region-rule': 'sales-region-rule',
};

export function registerCloudflareSync(strapi: any) {
  strapi.db.lifecycles.subscribe({
    models: Object.keys(uidToEntity),
    async afterCreate(event: any) {
      await syncEvent(strapi, event);
    },
    async afterUpdate(event: any) {
      await syncEvent(strapi, event);
    },
    async afterDelete(event: any) {
      await deleteEvent(strapi, event);
    },
  });
}

async function syncEvent(strapi: any, event: any) {
  const entity = uidToEntity[event.model.uid];
  if (!entity || !event.result?.id) return;

  const record = await strapi.documents(event.model.uid).findOne({
    documentId: event.result.documentId,
    populate: '*',
    status: 'published',
  }).catch(() => null);

  if (!record) {
    await postSync(strapi, entity, { delete: true, strapiId: event.result.id });
    return;
  }

  await postSync(strapi, entity, { record: normalizeRecord(entity, record) });
}

async function deleteEvent(strapi: any, event: any) {
  const entity = uidToEntity[event.model.uid];
  if (!entity || !event.result?.id) return;
  await postSync(strapi, entity, { delete: true, strapiId: event.result.id, slug: event.result.slug });
}

async function postSync(strapi: any, entity: SyncEntity, payload: Record<string, unknown>) {
  const url = process.env.CLOUDFLARE_SYNC_URL;
  const token = process.env.CLOUDFLARE_SYNC_SECRET;

  if (!url || !token) {
    strapi.log.debug(`[cloudflare-sync] skipped ${entity}: missing CLOUDFLARE_SYNC_URL or CLOUDFLARE_SYNC_SECRET`);
    return;
  }

  const response = await fetch(`${url.replace(/\/+$/, '')}/api/sync/${entity}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    strapi.log.error(`[cloudflare-sync] ${entity} failed: ${message}`);
  }
}

function normalizeRecord(entity: SyncEntity, record: any) {
  const base = {
    strapi_id: record.id,
    published_at: record.publishedAt ?? record.published_at ?? null,
  };

  if (entity === 'product') {
    return {
      ...base,
      name: record.name,
      slug: record.slug,
      category_id: record.category?.id,
      category_slug: record.category?.slug ?? '',
      model_number: record.model_number,
      short_description: record.short_description,
      overview: record.overview,
      cover_image_url: mediaUrl(record.cover_image),
      gallery: mediaUrls(record.gallery),
      video_url: record.video_url,
      key_features: record.key_features,
      specifications: record.specifications,
      payment_options: record.payment_options,
      capacity: record.capacity,
      cooling_heating_system: record.cooling_heating_system,
      dimensions: record.dimensions,
      weight: record.weight,
      power_supply: record.power_supply,
      screen_options: record.screen_options,
      network_options: record.network_options,
      custom_branding_options: record.custom_branding_options,
      recommended_solution_ids: (record.recommended_solutions ?? []).map((item: any) => item.id),
      is_featured: record.is_featured,
      sort_order: record.sort_order,
      seo_title: record.seo_title,
      seo_description: record.seo_description,
      og_image_url: mediaUrl(record.og_image),
    };
  }

  if (entity === 'solution') {
    return {
      ...base,
      title: record.title,
      slug: record.slug,
      short_description: record.short_description,
      overview: record.overview,
      cover_image_url: mediaUrl(record.cover_image),
      pain_points: record.pain_points,
      recommended_product_ids: (record.recommended_products ?? []).map((item: any) => item.id),
      deployment_notes: record.deployment_notes,
      payment_and_management_notes: record.payment_and_management_notes,
      business_model_notes: record.business_model_notes,
      cta_title: record.cta_title,
      cta_description: record.cta_description,
      sort_order: record.sort_order,
      seo_title: record.seo_title,
      seo_description: record.seo_description,
      og_image_url: mediaUrl(record.og_image),
    };
  }

  if (entity === 'blog-post') {
    return {
      ...base,
      title: record.title,
      slug: record.slug,
      category_id: record.category?.id,
      category_slug: record.category?.slug,
      tags: record.tags,
      cover_image_url: mediaUrl(record.cover_image),
      excerpt: record.excerpt,
      content: record.content,
      author_name: record.author_name,
      reading_time: record.reading_time,
      is_featured: record.is_featured,
      seo_title: record.seo_title,
      seo_description: record.seo_description,
      og_image_url: mediaUrl(record.og_image),
    };
  }

  return {
    ...base,
    ...record,
    cover_image_url: mediaUrl(record.cover_image),
  };
}

function mediaUrl(media: any) {
  return media?.url ?? null;
}

function mediaUrls(media: any) {
  if (!Array.isArray(media)) return [];
  return media.map((item) => item.url).filter(Boolean);
}

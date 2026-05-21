CREATE TABLE IF NOT EXISTS product_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strapi_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  is_active INTEGER DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strapi_id INTEGER UNIQUE,
  category_id INTEGER,
  category_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  model_number TEXT,
  short_description TEXT,
  overview TEXT,
  cover_image_url TEXT,
  gallery_json TEXT,
  video_url TEXT,
  key_features_json TEXT,
  specifications_json TEXT,
  payment_options_json TEXT,
  capacity TEXT,
  cooling_heating_system TEXT,
  dimensions TEXT,
  weight TEXT,
  power_supply TEXT,
  screen_options_json TEXT,
  network_options_json TEXT,
  custom_branding_options_json TEXT,
  recommended_solution_ids_json TEXT,
  is_featured INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  published_at TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE(category_slug, slug)
);

CREATE TABLE IF NOT EXISTS solutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strapi_id INTEGER UNIQUE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  overview TEXT,
  cover_image_url TEXT,
  pain_points_json TEXT,
  recommended_product_ids_json TEXT,
  deployment_notes TEXT,
  payment_and_management_notes TEXT,
  business_model_notes TEXT,
  cta_title TEXT,
  cta_description TEXT,
  sort_order INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  published_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strapi_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strapi_id INTEGER UNIQUE,
  category_id INTEGER,
  category_slug TEXT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tags_json TEXT,
  cover_image_url TEXT,
  excerpt TEXT,
  content TEXT,
  author_name TEXT,
  published_at TEXT,
  reading_time INTEGER,
  is_featured INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strapi_id INTEGER UNIQUE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sales_region_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strapi_id INTEGER UNIQUE,
  region_name TEXT NOT NULL,
  countries_json TEXT NOT NULL,
  sales_name TEXT NOT NULL,
  sales_email TEXT NOT NULL,
  cc_emails_json TEXT,
  is_default INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_no TEXT NOT NULL UNIQUE,
  source_page TEXT,
  source_type TEXT,
  product_id INTEGER,
  product_name TEXT,
  solution_id INTEGER,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  country TEXT NOT NULL,
  quantity TEXT,
  message TEXT,
  privacy_accepted INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to TEXT,
  assigned_sales_name TEXT,
  assigned_sales_email TEXT,
  email_sent_at TEXT,
  email_status TEXT NOT NULL DEFAULT 'pending',
  email_error TEXT,
  zoho_message_id TEXT,
  sales_note TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_country ON inquiries(country);

CREATE TABLE IF NOT EXISTS sync_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sync_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  status TEXT NOT NULL,
  message TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT
);

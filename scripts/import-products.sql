DELETE FROM products;
DELETE FROM product_categories;
INSERT INTO product_categories (strapi_id, name, slug, description, sort_order, is_active, updated_at)
VALUES (NULL, 'Locker Vending Machines', 'locker-vending-machines', 'Smart locker-based vending units for ambient and controlled product pickup workflows.', 1, 1, '2026-05-21T08:32:21.200Z');
INSERT INTO product_categories (strapi_id, name, slug, description, sort_order, is_active, updated_at)
VALUES (NULL, 'Pet Vending Stations', 'pet-vending-stations', 'Automated vending and service stations for pet food, treats, and related services.', 2, 1, '2026-05-21T08:32:21.200Z');
INSERT INTO products (
  strapi_id, category_id, category_slug, name, slug, model_number, short_description, overview,
  key_features_json, specifications_json, dimensions, is_featured, sort_order, published_at, updated_at
) VALUES (
  NULL,
  (SELECT id FROM product_categories WHERE slug = 'locker-vending-machines' LIMIT 1),
  'locker-vending-machines',
  'Locker + control',
  'locker-control',
  NULL,
  'Ambient Locker Vending machine',
  'Ambient Locker Vending machine
Screen:21.5 inch screen
Capacity:15 lockers
Payment System: Not include
Refrigeration system：Without
Smart venidng system',
  '["1. Multiple purchase offer discount feature","2. Promotion product feature","3. Remote upload advertisement","4. Remote on/off AC and lighting","5. Real time inventory","6. Real time sales data","7 Support shopping cart","8. Can upload company logo and service number.","9. Sub account setting","10. Software remote upgrade"]',
  '[["Price (1-4 units, USD)","2438.46"],["Price (5-9 units, USD)","1776.92"],["Price (10-29 units, USD)","1611.54"],["Price (30+ units, USD)","1480"]]',
  NULL,
  1,
  1,
  '2026-05-21T08:32:21.200Z',
  '2026-05-21T08:32:21.200Z'
);
INSERT INTO products (
  strapi_id, category_id, category_slug, name, slug, model_number, short_description, overview,
  key_features_json, specifications_json, dimensions, is_featured, sort_order, published_at, updated_at
) VALUES (
  NULL,
  (SELECT id FROM product_categories WHERE slug = 'locker-vending-machines' LIMIT 1),
  'locker-vending-machines',
  'Stand alone locker as slave box',
  'stand-alone-locker-as-slave-box',
  NULL,
  'Ambient Locker as slave box',
  'Ambient Locker as slave box
Capacity:16 lockers',
  '[]',
  '[["Price (1-4 units, USD)","1636.92"],["Price (5-9 units, USD)","1353.85"],["Price (10-29 units, USD)","1196.92"],["Price (30+ units, USD)","1024.62"]]',
  NULL,
  1,
  2,
  '2026-05-21T08:32:21.200Z',
  '2026-05-21T08:32:21.200Z'
);
INSERT INTO products (
  strapi_id, category_id, category_slug, name, slug, model_number, short_description, overview,
  key_features_json, specifications_json, dimensions, is_featured, sort_order, published_at, updated_at
) VALUES (
  NULL,
  (SELECT id FROM product_categories WHERE slug = 'locker-vending-machines' LIMIT 1),
  'locker-vending-machines',
  'WM22-W PPE',
  'wm22-w',
  'WM22-W',
  'Spiral + Locker',
  'Spiral + Locker
Screen:21.5 inch touch screen
Capacity:6 floors, 9 slots per floor
Payment System: Not include
Refrigeration system：3-20℃
With R290 efficient & green gas
With wheel
Full glass door （More beautiful and better insulated）
With 8 lockers at the side
With 4G/WIFI Module
Order 5 machines above can be black color',
  '["1. Multiple purchase offer discount feature","2. Promotion product feature","3. Remote upload advertisement","4. Remote on/off AC and lighting","5. Real time inventory","6. Real time sales data","7 Support shopping cart","8. Can upload company logo and service number.","9. Sub account setting","10. Software remote upgrade"]',
  '[["Dimensions","W128×D83×H198"],["Price (1-4 units, USD)","2777.69"],["Price (5-9 units, USD)","2406.23"],["Price (10-29 units, USD)","2131.76"],["Price (30+ units, USD)","1841.91"]]',
  'W128×D83×H198',
  1,
  3,
  '2026-05-21T08:32:21.200Z',
  '2026-05-21T08:32:21.200Z'
);
INSERT INTO products (
  strapi_id, category_id, category_slug, name, slug, model_number, short_description, overview,
  key_features_json, specifications_json, dimensions, is_featured, sort_order, published_at, updated_at
) VALUES (
  NULL,
  (SELECT id FROM product_categories WHERE slug = 'pet-vending-stations' LIMIT 1),
  'pet-vending-stations',
  'Dog washing machine',
  'dog-washing-machine',
  NULL,
  'Screen:21.5 inch touch screen +32 inch LCD screen',
  'Screen:21.5 inch touch screen +32 inch LCD screen
Payment System: Not include
304 Stainless steel
With 4G/WIFI Module
Support selet time package.
With shampoo, conditioner, Disinfectant water, warm water, High speed dryer.',
  '["1. Remote upload advertisement","2. Display time count down","3. Sub account setting"]',
  '[["Price (1-4 units, USD)","5360"],["Price (5-9 units, USD)","4461.54"],["Price (10-29 units, USD)","4092.31"],["Price (30+ units, USD)","3969.23"]]',
  NULL,
  1,
  4,
  '2026-05-21T08:32:21.200Z',
  '2026-05-21T08:32:21.200Z'
);
INSERT INTO products (
  strapi_id, category_id, category_slug, name, slug, model_number, short_description, overview,
  key_features_json, specifications_json, dimensions, is_featured, sort_order, published_at, updated_at
) VALUES (
  NULL,
  (SELECT id FROM product_categories WHERE slug = 'locker-vending-machines' LIMIT 1),
  'locker-vending-machines',
  'WM22-G Cooling locker 6 lockers',
  'wm22-g-6',
  'WM22-G',
  'Locker in the fridge.',
  'Locker in the fridge.
Screen:21.5 inch screen
Capacity: Standard is 6 lockers,can be customized
Payment System: Not include
Machandise Vairety:Max.40
Refrigeration system：3-20°C （adjustable)
R290 green gas
With 4G/WIFI Module',
  '[]',
  '[["Dimensions","W166*D71*H217"],["Price (1-4 units, USD)","3067.16"],["Price (5-9 units, USD)","2327.46"],["Price (10-29 units, USD)","2233.13"],["Price (30+ units, USD)","2098.81"]]',
  'W166*D71*H217',
  0,
  5,
  '2026-05-21T08:32:21.200Z',
  '2026-05-21T08:32:21.200Z'
);
INSERT INTO products (
  strapi_id, category_id, category_slug, name, slug, model_number, short_description, overview,
  key_features_json, specifications_json, dimensions, is_featured, sort_order, published_at, updated_at
) VALUES (
  NULL,
  (SELECT id FROM product_categories WHERE slug = 'locker-vending-machines' LIMIT 1),
  'locker-vending-machines',
  'Ambient Locker 9 lockers',
  'ambient-locker-9-lockers',
  NULL,
  'Ambient Locker Vending machine',
  'Ambient Locker Vending machine
Screen:21.5 inch screen
Capacity:9 lockers
Payment System: Not include
Refrigeration system：Without
Smart venidng system',
  '["1. Multiple purchase offer discount feature","2. Promotion product feature","3. Remote upload advertisement","4. Remote on/off AC and lighting","5. Real time inventory","6. Real time sales data","7 Support shopping cart","8. Can upload company logo and service number.","9. Sub account setting","10. Software remote upgrade"]',
  '[["Price (1-4 units, USD)","2432.84"],["Price (5-9 units, USD)","1723.88"],["Price (10-29 units, USD)","1563.43"],["Price (30+ units, USD)","1435.82"]]',
  NULL,
  0,
  6,
  '2026-05-21T08:32:21.200Z',
  '2026-05-21T08:32:21.200Z'
);
INSERT INTO products (
  strapi_id, category_id, category_slug, name, slug, model_number, short_description, overview,
  key_features_json, specifications_json, dimensions, is_featured, sort_order, published_at, updated_at
) VALUES (
  NULL,
  (SELECT id FROM product_categories WHERE slug = 'locker-vending-machines' LIMIT 1),
  'locker-vending-machines',
  'Cooling locker Smalller size',
  'cooling-locker-smalller-size',
  NULL,
  'Screen:21.5 inch screen',
  'Screen:21.5 inch screen
Capacity: Standard is 10 lockers,can be customized
Payment System: Not include
Machandise Vairety:Max.10
Refrigeration system：3-20°C （adjustable)
R290 green gas
With 4G/WIFI Module',
  '["1. Multiple purchase offer discount feature","2. Promotion product feature","3. Remote upload advertisement","4. Remote on/off AC and lighting","5. Real time inventory","6. Real time sales data","7 Support shopping cart","8. Can upload company logo and service number.","9. Sub account setting","10. Software remote upgrade"]',
  '[["Dimensions","W109*69*194"],["Price (1-4 units, USD)","2080.96"],["Price (5-9 units, USD)","1818.85"],["Price (10-29 units, USD)","1649.27"],["Price (30+ units, USD)","1541.46"]]',
  'W109*69*194',
  0,
  7,
  '2026-05-21T08:32:21.200Z',
  '2026-05-21T08:32:21.200Z'
);
INSERT INTO products (
  strapi_id, category_id, category_slug, name, slug, model_number, short_description, overview,
  key_features_json, specifications_json, dimensions, is_featured, sort_order, published_at, updated_at
) VALUES (
  NULL,
  (SELECT id FROM product_categories WHERE slug = 'locker-vending-machines' LIMIT 1),
  'locker-vending-machines',
  'Flower vending machine for indoor use',
  'flower-vending-machine-for-indoor-use-11',
  NULL,
  'Flower vending machine for shopping mall(indoor AC condition)',
  'Flower vending machine for shopping mall(indoor AC condition)
Screen:32 inch touch screen
Capacity: Standard is 24 lockers,can be customized
Payment System: Not include
Refrigeration system：15-20°C （adjustable)
With R290 efficient & green gas
With 4G/WIFI Module',
  '["1. Multiple purchase offer discount feature","2. Promotion product feature","3. Remote upload advertisement","4. Remote on/off AC and lighting","5. Real time inventory","6. Real time sales data","7 Support shopping cart","8. Can upload company logo and service number.","9. Sub account setting","10. Software remote upgrade"]',
  '[["Dimensions","W180*D861* H2197"],["Price (1-4 units, USD)","6022.39"],["Price (5-9 units, USD)","5111.94"],["Price (10-29 units, USD)","4570.9"],["Price (30+ units, USD)","4291.04"]]',
  'W180*D861* H2197',
  0,
  8,
  '2026-05-21T08:32:21.200Z',
  '2026-05-21T08:32:21.200Z'
);
INSERT INTO products (
  strapi_id, category_id, category_slug, name, slug, model_number, short_description, overview,
  key_features_json, specifications_json, dimensions, is_featured, sort_order, published_at, updated_at
) VALUES (
  NULL,
  (SELECT id FROM product_categories WHERE slug = 'locker-vending-machines' LIMIT 1),
  'locker-vending-machines',
  'Flower vending machine Transparent door',
  'flower-vending-machine-transparent-door-11',
  NULL,
  'Flower vending machine for shopping mall(indoor AC condition)',
  'Flower vending machine for shopping mall(indoor AC condition)
Screen:22 inch touch screen
Capacity: Standard is 32 lockers,can be customized
Payment System: Not include
Refrigeration system：5-20°C （adjustable)
With R290 efficient & green gas
With 4G/WIFI Module',
  '["1. Multiple purchase offer discount feature","2. Promotion product feature","3. Remote upload advertisement","4. Remote on/off AC and lighting","5. Real time inventory","6. Real time sales data","7 Support shopping cart","8. Can upload company logo and service number.","9. Sub account setting","10. Software remote upgrade"]',
  '[["Dimensions","W280*D75* H210"],["Price (1-4 units, USD)","4884.62"],["Price (5-9 units, USD)","4423.08"],["Price (10-29 units, USD)","4134.62"],["Price (30+ units, USD)","3730.77"]]',
  'W280*D75* H210',
  0,
  9,
  '2026-05-21T08:32:21.200Z',
  '2026-05-21T08:32:21.200Z'
);
INSERT INTO products (
  strapi_id, category_id, category_slug, name, slug, model_number, short_description, overview,
  key_features_json, specifications_json, dimensions, is_featured, sort_order, published_at, updated_at
) VALUES (
  NULL,
  (SELECT id FROM product_categories WHERE slug = 'locker-vending-machines' LIMIT 1),
  'locker-vending-machines',
  'Flower vending machine',
  'flower-vending-machine',
  NULL,
  'Screen:32 inch touch screen',
  'Screen:32 inch touch screen
Capacity: Standard is 6+6 lockers,can be customized
Payment System: Not include
Refrigeration system：3-20°C （adjustable)
R290 green gas
With 4G/WIFI Module',
  '["1. Multiple purchase offer discount feature","2. Promotion product feature","3. Remote upload advertisement","4. Remote on/off AC and lighting","5. Real time inventory","6. Real time sales data","7 Support shopping cart","8. Can upload company logo and service number.","9. Sub account setting","10. Software remote upgrade"]',
  '[["Dimensions","W286(335 with roof)*D120(179 with roof)*H197 (215 with roof)"],["Price (1-4 units, USD)","7029.85"],["Price (5-9 units, USD)","5087.76"],["Price (10-29 units, USD)","4884.18"],["Price (30+ units, USD)","4511.04"]]',
  'W286(335 with roof)*D120(179 with roof)*H197 (215 with roof)',
  0,
  10,
  '2026-05-21T08:32:21.200Z',
  '2026-05-21T08:32:21.200Z'
);

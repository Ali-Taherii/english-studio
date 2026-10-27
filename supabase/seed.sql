-- Local/staging sample data only. Never run against production.
-- Prices and lesson counts are placeholders until the real packages are decided.

insert into packages (slug, title, description, features, format, lesson_count, lesson_minutes, valid_days, price_amount, currency, is_popular, is_published, sort_order)
values
  ('starter',
   '{"fa": "شروع", "en": "Starter"}',
   '{"fa": "کلاس گروهی برای سطح A1 تا A2", "en": "Group lessons for A1–A2"}',
   '[{"fa": "تکلیف آنلاین هفتگی", "en": "Weekly online homework"}]',
   'group', 8, 60, 90, 0, 'IRR', false, true, 1),
  ('progress',
   '{"fa": "پیشرفت", "en": "Progress"}',
   '{"fa": "کلاس خصوصی برای همه سطوح", "en": "Private lessons, all levels"}',
   '[{"fa": "برنامه شخصی و تکلیف بعد از هر جلسه", "en": "Personal plan and homework after every lesson"}]',
   'one_to_one', 12, 60, 90, 0, 'IRR', true, true, 2),
  ('ielts',
   '{"fa": "آمادگی آیلتس", "en": "IELTS prep"}',
   '{"fa": "کلاس خصوصی برای سطح B1 به بالا", "en": "Private lessons for B1 and above"}',
   '[{"fa": "تصحیح رایتینگ و آزمون آزمایشی", "en": "Writing correction and mock tests"}]',
   'one_to_one', 16, 90, 120, 0, 'IRR', false, true, 3);

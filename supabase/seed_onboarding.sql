insert into public.onboarding_questions (id, prompt, description, type, sort_order)
values
  (gen_random_uuid(), 'How many years have you been trading?', 'Helps us tailor coaching paths to your experience.', 'SINGLE_SELECT', 1),
  (gen_random_uuid(), 'Which markets do you focus on?', 'Pick every market you actively follow.', 'MULTI_SELECT', 2),
  (gen_random_uuid(), 'What best describes your trading style?', null, 'SINGLE_SELECT', 3),
  (gen_random_uuid(), 'What is your primary goal on T-Line?', null, 'SINGLE_SELECT', 4)
on conflict (prompt) do update set
  description = excluded.description,
  type = excluded.type,
  sort_order = excluded.sort_order,
  updated_at = now();

with question_ids as (
  select id, prompt from public.onboarding_questions
)
insert into public.onboarding_options (question_id, label, value, sort_order)
select qi.id,
       option.label,
       option.value,
       option.sort_order
from question_ids qi
join (
  select 'How many years have you been trading?'::text as prompt, 'Less than 1 year'::text as label, 'lt_1_year'::text as value, 1 as sort_order union all
  select 'How many years have you been trading?', '1-3 years', '1_3_years', 2 union all
  select 'How many years have you been trading?', '3-5 years', '3_5_years', 3 union all
  select 'How many years have you been trading?', '5+ years', 'gt_5_years', 4 union all
  select 'Which markets do you focus on?', 'Forex', 'forex', 1 union all
  select 'Which markets do you focus on?', 'Stocks', 'stocks', 2 union all
  select 'Which markets do you focus on?', 'Crypto', 'crypto', 3 union all
  select 'Which markets do you focus on?', 'Indices', 'indices', 4 union all
  select 'Which markets do you focus on?', 'Commodities', 'commodities', 5 union all
  select 'What best describes your trading style?', 'Technical analyst', 'technical', 1 union all
  select 'What best describes your trading style?', 'Fundamental investor', 'fundamental', 2 union all
  select 'What best describes your trading style?', 'Quantitative/systematic', 'quant', 3 union all
  select 'What best describes your trading style?', 'Copy/social trader', 'copy', 4 union all
  select 'What is your primary goal on T-Line?', 'Learn fundamentals', 'learn', 1 union all
  select 'What is your primary goal on T-Line?', 'Practice new strategies', 'practice', 2 union all
  select 'What is your primary goal on T-Line?', 'Prepare for funded account', 'funded', 3 union all
  select 'What is your primary goal on T-Line?', 'Grow consistent profits', 'grow', 4
) as option on option.prompt = qi.prompt
on conflict (question_id, value) do update set
  label = excluded.label,
  sort_order = excluded.sort_order,
  updated_at = now();

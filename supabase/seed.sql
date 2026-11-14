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


-- Starter question bank for the free level test (S4): 9 questions per level from A1 to C1
-- and 6 at C2, split between grammar, vocabulary and reading. correct_answer is the
-- 0-based position of the right option. Review and replace these in the panel (S6).
insert into test_questions (level, skill, prompt, options, correct_answer)
values
  ('A1', 'grammar', 'She ___ a teacher.', '["am", "is", "are", "be"]', '1'),
  ('A1', 'grammar', 'I ___ two brothers.', '["has", "having", "have", "am"]', '2'),
  ('A1', 'grammar', '___ you like coffee?', '["Do", "Does", "Are", "Is"]', '0'),
  ('A1', 'vocabulary', 'The opposite of ''hot'' is ___.', '["cold", "big", "fast", "new"]', '0'),
  ('A1', 'vocabulary', 'We eat breakfast in the ___.', '["night", "morning", "evening", "afternoon"]', '1'),
  ('A1', 'vocabulary', 'A person who works in a hospital and helps sick people is a ___.', '["driver", "farmer", "cook", "doctor"]', '3'),
  ('A1', 'reading', 'My name is Tom. I am ten years old. I live in a small house with my mother, my father and my sister Anna. We have a dog. His name is Max.

How old is Tom?', '["eight", "nine", "ten", "eleven"]', '2'),
  ('A1', 'reading', 'My name is Tom. I am ten years old. I live in a small house with my mother, my father and my sister Anna. We have a dog. His name is Max.

Who is Anna?', '["Tom''s mother", "Tom''s sister", "Tom''s friend", "Tom''s dog"]', '1'),
  ('A1', 'reading', 'My name is Tom. I am ten years old. I live in a small house with my mother, my father and my sister Anna. We have a dog. His name is Max.

What is the dog''s name?', '["Max", "Tom", "Anna", "Sam"]', '0'),
  ('A2', 'grammar', 'Yesterday we ___ to the cinema.', '["go", "goes", "went", "gone"]', '2'),
  ('A2', 'grammar', 'This book is ___ than that one.', '["more interesting", "most interesting", "interestinger", "the interesting"]', '0'),
  ('A2', 'grammar', 'Look! It ___.', '["rains", "is raining", "rain", "rained"]', '1'),
  ('A2', 'vocabulary', 'Can I pay by credit ___?', '["money", "cash", "card", "ticket"]', '2'),
  ('A2', 'vocabulary', 'I''m really ___. Can I have a glass of water?', '["hungry", "thirsty", "tired", "angry"]', '1'),
  ('A2', 'vocabulary', 'You borrow books from a ___.', '["library", "bakery", "pharmacy", "station"]', '0'),
  ('A2', 'reading', 'Sara usually takes the bus to work, but last Monday the bus was late, so she walked. It took forty minutes. She was tired, but she enjoyed the fresh air. Now she walks to work every Friday.

Why did Sara walk to work last Monday?', '["She missed the bus.", "The bus was late.", "She wanted exercise.", "Her car was broken."]', '1'),
  ('A2', 'reading', 'Sara usually takes the bus to work, but last Monday the bus was late, so she walked. It took forty minutes. She was tired, but she enjoyed the fresh air. Now she walks to work every Friday.

How long did the walk take?', '["Fourteen minutes", "Twenty minutes", "Forty minutes", "An hour"]', '2'),
  ('A2', 'reading', 'Sara usually takes the bus to work, but last Monday the bus was late, so she walked. It took forty minutes. She was tired, but she enjoyed the fresh air. Now she walks to work every Friday.

What does Sara do now?', '["She drives to work.", "She never takes the bus.", "She walks to work every day.", "She walks to work on Fridays."]', '3'),
  ('B1', 'grammar', 'I ___ here since 2019.', '["live", "am living", "have lived", "lived"]', '2'),
  ('B1', 'grammar', 'If it rains tomorrow, we ___ at home.', '["stay", "will stay", "would stay", "stayed"]', '1'),
  ('B1', 'grammar', 'The bridge ___ in 1890.', '["was built", "built", "has built", "is building"]', '0'),
  ('B1', 'vocabulary', 'I''m looking ___ to seeing you next week.', '["after", "up", "ahead", "forward"]', '3'),
  ('B1', 'vocabulary', 'She ___ the job because the salary was too low.', '["turned down", "turned up", "turned on", "turned into"]', '0'),
  ('B1', 'vocabulary', 'The meeting was ___ until next Tuesday because the manager was ill.', '["prevented", "postponed", "predicted", "pretended"]', '1'),
  ('B1', 'reading', 'When Daniel moved to Lisbon for work, he did not know anyone. At first he spent his evenings alone, watching films. Then a colleague invited him to a weekly football game. He was not a good player, but he kept going, and within a few months he had a group of close friends.

What did Daniel do in the evenings at first?', '["He played football.", "He watched films alone.", "He worked late.", "He met colleagues."]', '1'),
  ('B1', 'reading', 'When Daniel moved to Lisbon for work, he did not know anyone. At first he spent his evenings alone, watching films. Then a colleague invited him to a weekly football game. He was not a good player, but he kept going, and within a few months he had a group of close friends.

How did Daniel make friends?', '["By joining a weekly football game", "By watching films with colleagues", "By changing his job", "By moving to a new flat"]', '0'),
  ('B1', 'reading', 'When Daniel moved to Lisbon for work, he did not know anyone. At first he spent his evenings alone, watching films. Then a colleague invited him to a weekly football game. He was not a good player, but he kept going, and within a few months he had a group of close friends.

What do we learn about Daniel as a football player?', '["He was the best in the group.", "He stopped playing quickly.", "He was not very good but continued.", "He had played for years."]', '2'),
  ('B2', 'grammar', 'If I ___ more free time, I would learn to play the guitar.', '["had", "have", "will have", "am having"]', '0'),
  ('B2', 'grammar', 'By the time we arrived, the film ___.', '["already started", "had already started", "has already started", "was already starting"]', '1'),
  ('B2', 'grammar', 'I''d rather you ___ smoke in here.', '["don''t", "won''t", "didn''t", "not"]', '2'),
  ('B2', 'vocabulary', 'The new policy had a significant ___ on small businesses.', '["affect", "impact", "outcome", "reaction"]', '1'),
  ('B2', 'vocabulary', 'He managed to ___ a solution after hours of discussion.', '["come up with", "come down with", "come across as", "come round to"]', '0'),
  ('B2', 'vocabulary', 'Her explanation was so ___ that nobody had any questions.', '["vague", "casual", "thorough", "rough"]', '2'),
  ('B2', 'reading', 'Remote work has changed how companies hire. Employers who once limited their search to people living nearby can now recruit across the world. However, managers report that building trust is harder when colleagues rarely meet, and some firms now ask staff to gather in person several times a year.

According to the text, what is one advantage of remote work for employers?', '["Lower salaries", "A wider choice of candidates", "Fewer managers", "Shorter working hours"]', '1'),
  ('B2', 'reading', 'Remote work has changed how companies hire. Employers who once limited their search to people living nearby can now recruit across the world. However, managers report that building trust is harder when colleagues rarely meet, and some firms now ask staff to gather in person several times a year.

What problem do managers mention?', '["Staff refuse to travel.", "Hiring takes longer.", "It is harder to build trust.", "Offices are too expensive."]', '2'),
  ('B2', 'reading', 'Remote work has changed how companies hire. Employers who once limited their search to people living nearby can now recruit across the world. However, managers report that building trust is harder when colleagues rarely meet, and some firms now ask staff to gather in person several times a year.

Why do some firms organise in-person meetings?', '["To help colleagues build relationships", "To reduce travel costs", "To check working hours", "To replace online meetings completely"]', '0'),
  ('C1', 'grammar', 'Not only ___ the deadline, but they also went over budget.', '["they missed", "did they miss", "they did miss", "missed they"]', '1'),
  ('C1', 'grammar', '___ I known about the delay, I would have taken a later train.', '["Should", "Were", "If", "Had"]', '3'),
  ('C1', 'grammar', 'It''s high time the government ___ action on housing.', '["takes", "took", "has taken", "will take"]', '1'),
  ('C1', 'vocabulary', 'The scandal seriously ___ public confidence in the bank.', '["underwent", "undertook", "undermined", "underlined"]', '2'),
  ('C1', 'vocabulary', 'She gave a ___ account of the events, leaving out no detail.', '["meticulous", "negligent", "tentative", "superficial"]', '0'),
  ('C1', 'vocabulary', 'The two reports are broadly similar, but there are some ___ differences in tone.', '["vast", "subtle", "blunt", "crude"]', '1'),
  ('C1', 'reading', 'Critics of standardised testing argue that it narrows the curriculum, since teachers feel compelled to prioritise examined content. Proponents counter that without a common measure, inequalities between schools would simply go unnoticed. What both camps tend to overlook is that a test reveals little unless the results are used to change how teaching is done.

What do critics claim standardised testing does?', '["It hides inequalities between schools.", "It reduces what is taught.", "It makes teachers'' work easier.", "It improves examined content."]', '1'),
  ('C1', 'reading', 'Critics of standardised testing argue that it narrows the curriculum, since teachers feel compelled to prioritise examined content. Proponents counter that without a common measure, inequalities between schools would simply go unnoticed. What both camps tend to overlook is that a test reveals little unless the results are used to change how teaching is done.

What is the supporters'' main argument?', '["Tests make differences between schools visible.", "Tests motivate students to study.", "Tests are cheap to run.", "Tests widen the curriculum."]', '0'),
  ('C1', 'reading', 'Critics of standardised testing argue that it narrows the curriculum, since teachers feel compelled to prioritise examined content. Proponents counter that without a common measure, inequalities between schools would simply go unnoticed. What both camps tend to overlook is that a test reveals little unless the results are used to change how teaching is done.

What is the writer''s own point?', '["Testing should be abolished.", "Both sides are equally right.", "Results matter only if they lead to changes in teaching.", "Teachers should design the tests."]', '2'),
  ('C2', 'grammar', 'Little ___ that the decision would cost him his career.', '["he knew", "did he know", "he did know", "knew he"]', '1'),
  ('C2', 'grammar', 'He talks about the project as though he ___ it single-handedly, which is far from the truth.', '["ran", "had run", "has run", "would run"]', '1'),
  ('C2', 'vocabulary', 'His apology was so ___ that it only made matters worse.', '["heartfelt", "earnest", "profuse", "perfunctory"]', '3'),
  ('C2', 'vocabulary', 'The minister tried to ___ the scale of the crisis, insisting that everything was under control.', '["play down", "play up", "play along", "play out"]', '0'),
  ('C2', 'reading', 'It is tempting to regard the historian as a neutral conduit through which the past speaks. Yet every act of selection – which letters to quote, which silences to leave undisturbed – is itself an argument, however discreetly made. The most persuasive histories are rarely those that proclaim their impartiality, but those whose authors are candid about the choices they have made.

Which view of the historian does the writer question?', '["That historians invent their sources", "That historians simply pass on the past without shaping it", "That historians argue too openly", "That historians ignore letters"]', '1'),
  ('C2', 'reading', 'It is tempting to regard the historian as a neutral conduit through which the past speaks. Yet every act of selection – which letters to quote, which silences to leave undisturbed – is itself an argument, however discreetly made. The most persuasive histories are rarely those that proclaim their impartiality, but those whose authors are candid about the choices they have made.

According to the writer, which histories convince readers most?', '["Those that claim to be impartial", "Those that avoid making any argument", "Those whose authors are open about their choices", "Those that quote the most sources"]', '2');

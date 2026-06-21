-- Polish defaults for the public landing page.
-- Existing customized content is preserved: rows are updated only when they
-- still contain the original English seed values.

ALTER TABLE tenant_config.landing_hero
    ALTER COLUMN cta_primary_text SET DEFAULT 'Nasze usługi',
    ALTER COLUMN cta_secondary_text SET DEFAULT 'Skontaktuj się';

ALTER TABLE tenant_config.landing_about
    ALTER COLUMN section_label SET DEFAULT 'O nas';

ALTER TABLE tenant_config.landing_tips_section
    ALTER COLUMN section_label SET DEFAULT 'Porady ekspertów',
    ALTER COLUMN headline SET DEFAULT 'Porady motoryzacyjne';

ALTER TABLE tenant_config.landing_contact
    ALTER COLUMN section_label SET DEFAULT 'Skontaktuj się z nami',
    ALTER COLUMN headline SET DEFAULT 'Kontakt',
    ALTER COLUMN towing_text SET DEFAULT 'Dostępna pomoc drogowa — zadzwoń do nas!';

ALTER TABLE tenant_config.landing_gallery_section
    ALTER COLUMN section_label SET DEFAULT 'Nasze realizacje',
    ALTER COLUMN headline SET DEFAULT 'Galeria zdjęć';

UPDATE tenant_config.landing_hero SET company_name = 'Twój Warsztat Samochodowy' WHERE company_name = 'Your Auto Shop';
UPDATE tenant_config.landing_hero SET tagline = 'Profesjonalna naprawa i serwis samochodów' WHERE tagline = 'Professional Auto Repair & Maintenance';
UPDATE tenant_config.landing_hero SET subtitle = 'Fachowa obsługa, której możesz zaufać — zadbamy o wszystkie potrzeby Twojego samochodu.' WHERE subtitle = 'Quality service you can trust for all your automotive needs.';
UPDATE tenant_config.landing_hero SET specialty_text = 'Dla kierowców z naszej okolicy' WHERE specialty_text = 'Serving Your Community';
UPDATE tenant_config.landing_hero SET cta_primary_text = 'Nasze usługi' WHERE cta_primary_text = 'Our Services';
UPDATE tenant_config.landing_hero SET cta_secondary_text = 'Skontaktuj się' WHERE cta_secondary_text = 'Contact Us';

UPDATE tenant_config.landing_about SET section_label = 'O nas' WHERE section_label = 'About Us';
UPDATE tenant_config.landing_about SET headline = 'Zaufani specjaliści od napraw samochodowych' WHERE headline = 'Your Trusted Auto Repair Experts';
UPDATE tenant_config.landing_about SET description = 'Zapewniamy uczciwą i niezawodną obsługę kierowcom z naszej okolicy.' WHERE description = 'We are dedicated to providing honest, reliable service to our community.';
UPDATE tenant_config.landing_about SET secondary_description = 'Nasi mechanicy wykonują fachową diagnostykę, przeglądy okresowe i solidne naprawy samochodów wszystkich marek i modeli.' WHERE secondary_description = 'Our technicians deliver skilled diagnostics, preventive maintenance, and quality repairs for all makes and models.';

UPDATE tenant_config.landing_about_feature SET text = 'Wykwalifikowani mechanicy' WHERE text = 'Certified Technicians';
UPDATE tenant_config.landing_about_feature SET text = 'Części i materiały wysokiej jakości' WHERE text = 'Quality Parts & Materials';
UPDATE tenant_config.landing_about_feature SET text = 'Przejrzyste ceny' WHERE text = 'Transparent Pricing';
UPDATE tenant_config.landing_about_feature SET text = 'Zadowolenie klientów' WHERE text = 'Customer Satisfaction';

UPDATE tenant_config.landing_stat SET label = 'lat doświadczenia' WHERE label = 'Years Experience';
UPDATE tenant_config.landing_stat SET label = 'zadowolonych klientów', value = '5 000+' WHERE label = 'Satisfied Customers' AND value = '5,000+';

UPDATE tenant_config.landing_tips_section SET section_label = 'Porady ekspertów' WHERE section_label = 'Expert Advice';
UPDATE tenant_config.landing_tips_section SET headline = 'Porady motoryzacyjne' WHERE headline = 'Auto Care Tips';
UPDATE tenant_config.landing_tips_section SET description = 'Zadbaj o sprawność swojego samochodu dzięki praktycznym poradom naszych ekspertów.' WHERE description = 'Keep your vehicle in top shape with these helpful maintenance tips from our experts.';

UPDATE tenant_config.landing_tip SET title = 'Regularnie sprawdzaj poziom oleju', description = 'Sprawdzaj poziom oleju co najmniej raz w miesiącu. Zbyt niski poziom może doprowadzić do poważnego uszkodzenia silnika.' WHERE title = 'Check Your Oil Regularly' AND description = 'Check your oil level at least once a month. Low oil can cause serious engine damage.';
UPDATE tenant_config.landing_tip SET title = 'Kontroluj ciśnienie w oponach', description = 'Prawidłowe ciśnienie zmniejsza zużycie paliwa i wydłuża żywotność opon. Sprawdzaj je co miesiąc.' WHERE title = 'Monitor Tire Pressure' AND description = 'Proper tire pressure improves fuel economy and extends tire life. Check monthly.';
UPDATE tenant_config.landing_tip SET title = 'Zwracaj uwagę na hamulce', description = 'Piszczenie lub zgrzytanie może oznaczać zużycie klocków hamulcowych. Nie ignoruj sygnałów ostrzegawczych.' WHERE title = 'Listen to Your Brakes' AND description = 'Squealing or grinding sounds indicate worn brake pads. Don''t ignore warning signs.';
UPDATE tenant_config.landing_tip SET title = 'Pamiętaj o wymianie płynów', description = 'Olej przekładniowy, płyn chłodniczy i płyn hamulcowy wymagają okresowej wymiany.' WHERE title = 'Keep Up with Fluid Changes' AND description = 'Transmission fluid, coolant, and brake fluid all need periodic replacement.';
UPDATE tenant_config.landing_tip SET title = 'Obserwuj kontrolki ostrzegawcze', description = 'Jeśli zapali się kontrolka silnika, jak najszybciej wykonaj diagnostykę.' WHERE title = 'Watch Your Warning Lights' AND description = 'If your check engine light comes on, get it diagnosed promptly.';
UPDATE tenant_config.landing_tip SET title = 'Wymieniaj wycieraczki i filtry', description = 'Wymieniaj pióra wycieraczek co 6–12 miesięcy, a filtry powietrza co 15 000–25 000 km.' WHERE title = 'Replace Wipers & Filters' AND description = 'Change wiper blades every 6-12 months and air filters every 12,000-15,000 miles.';

UPDATE tenant_config.landing_footer SET company_description = 'Profesjonalna naprawa i serwis samochodów, którym możesz zaufać.' WHERE company_description = 'Professional auto repair and maintenance services you can trust.';

UPDATE tenant_config.landing_contact SET section_label = 'Skontaktuj się z nami' WHERE section_label = 'Get In Touch';
UPDATE tenant_config.landing_contact SET headline = 'Kontakt' WHERE headline = 'Contact Us';
UPDATE tenant_config.landing_contact SET description = 'Masz pytania lub chcesz umówić wizytę? Wypełnij formularz albo zadzwoń do nas!' WHERE description = 'Have questions or need to schedule service? Fill out the form or give us a call!';
UPDATE tenant_config.landing_contact SET towing_text = 'Dostępna pomoc drogowa — zadzwoń do nas!' WHERE towing_text = 'Towing service available — call us!';
UPDATE tenant_config.landing_contact
SET business_hours = '[{"day": "Poniedziałek", "open": "8:00", "close": "18:00"}, {"day": "Wtorek", "open": "8:00", "close": "18:00"}, {"day": "Środa", "open": "8:00", "close": "18:00"}, {"day": "Czwartek", "open": "8:00", "close": "18:00"}, {"day": "Piątek", "open": "8:00", "close": "18:00"}, {"day": "Sobota", "open": "9:00", "close": "15:00"}, {"day": "Niedziela", "open": "Zamknięte", "close": "Zamknięte"}]'
WHERE business_hours = '[{"day": "Monday", "open": "8:00 AM", "close": "6:00 PM"}, {"day": "Tuesday", "open": "8:00 AM", "close": "6:00 PM"}, {"day": "Wednesday", "open": "8:00 AM", "close": "6:00 PM"}, {"day": "Thursday", "open": "8:00 AM", "close": "6:00 PM"}, {"day": "Friday", "open": "8:00 AM", "close": "6:00 PM"}, {"day": "Saturday", "open": "9:00 AM", "close": "3:00 PM"}, {"day": "Sunday", "open": "Closed", "close": "Closed"}]';

UPDATE tenant_config.landing_service SET title = 'Obsługa okresowa', description = 'Regularne przeglądy i czynności serwisowe zapewniające sprawną pracę samochodu.' WHERE title = 'General Maintenance' AND description = 'Regular maintenance services to keep your vehicle running smoothly.';
UPDATE tenant_config.landing_service SET title = 'Wymiana oleju', description = 'Regularna wymiana oleju chroni silnik i zapewnia jego prawidłową pracę. Stosujemy wysokiej jakości oleje i filtry do samochodów wszystkich marek i modeli.' WHERE title = 'Oil Change' AND description = 'Regular oil changes to keep your engine running smoothly. We use quality oils and filters for all makes and models.';
UPDATE tenant_config.landing_service SET title = 'Serwis hamulców', description = 'Kompleksowo sprawdzamy układ hamulcowy, wymieniamy klocki, regenerujemy tarcze i wymieniamy płyn hamulcowy, dbając o Twoje bezpieczeństwo.' WHERE title = 'Brake Service' AND description = 'Complete brake inspections, pad replacements, rotor resurfacing, and brake fluid flushes for your safety.';
UPDATE tenant_config.landing_service SET title = 'Naprawa silnika', description = 'Od regulacji i drobnych napraw po kompleksowe remonty silnika — nasi wykwalifikowani mechanicy zajmą się wszystkim.' WHERE title = 'Engine Repair' AND description = 'From minor tune-ups to major engine overhauls, our certified technicians handle it all.';
UPDATE tenant_config.landing_service SET title = 'Skrzynia biegów', description = 'Wymieniamy olej przekładniowy, naprawiamy i regenerujemy skrzynie biegów, zapewniając płynną zmianę przełożeń.' WHERE title = 'Transmission' AND description = 'Transmission fluid changes, repairs, and rebuilds. We keep your vehicle shifting smoothly.';
UPDATE tenant_config.landing_service SET title = 'Serwis opon', description = 'Wykonujemy rotację i wyważanie kół oraz montaż nowych opon, aby jazda była komfortowa i bezpieczna.' WHERE title = 'Tire Service' AND description = 'Tire rotations, balancing, and new tire installations. Keep your ride smooth and safe.';
UPDATE tenant_config.landing_service SET title = 'Diagnostyka', description = 'Nowoczesny sprzęt diagnostyczny pozwala nam szybko wykrywać i usuwać usterki samochodu.' WHERE title = 'Diagnostics' AND description = 'State-of-the-art diagnostic equipment to quickly identify and resolve any vehicle issues.';
UPDATE tenant_config.landing_service SET title = 'Pomoc drogowa', description = 'Awaria na drodze? Zapewniamy niezawodne holowanie samochodu bezpiecznie do naszego warsztatu.' WHERE title = 'Towing Service' AND description = 'Stranded? We offer reliable towing services to get your vehicle to our shop safely.';

UPDATE tenant_config.landing_gallery_section SET section_label = 'Nasze realizacje' WHERE section_label = 'Our Work';
UPDATE tenant_config.landing_gallery_section SET headline = 'Galeria zdjęć' WHERE headline = 'Photo Gallery';
UPDATE tenant_config.landing_gallery_section SET description = 'Zobacz nasze ostatnie realizacje i samochody zadowolonych klientów.' WHERE description = 'Take a look at some of our recent work and satisfied customers.';

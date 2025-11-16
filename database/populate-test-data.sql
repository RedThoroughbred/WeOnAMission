-- Populate Test Data for Trinity Church
-- Run this in Supabase SQL Editor to add sample data with church_id

-- First, ensure Trinity Church exists
INSERT INTO churches (id, name, slug, description)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Trinity Church',
    'trinity',
    'Sample Trinity Church for testing'
)
ON CONFLICT (id) DO NOTHING;

-- Get the Trinity Church ID for use in inserts
DO $$
DECLARE
    trinity_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
    -- Delete existing sample data first (optional - remove this if you want to keep existing data)
    DELETE FROM events WHERE church_id = trinity_id AND name IN (
        'Parent Information Meeting', 'First Payment Deadline', 'Passport Application Day',
        'Fundraiser: Car Wash', 'Final Payment Deadline', 'Pre-Trip Orientation', 'Departure Day'
    );

    DELETE FROM resources WHERE church_id = trinity_id AND name IN (
        'Packing List PDF', 'Travel Insurance Guide', 'Peru Culture Video',
        'Spanish Language App', 'Medical Information Form', 'Trip Preparation Guide'
    );

    DELETE FROM faqs WHERE church_id = trinity_id AND category IN ('General', 'Payments', 'Travel');

    -- Insert sample events
    INSERT INTO events (name, description, event_date, event_time, event_type, location, display_on_calendar, church_id) VALUES
    ('Parent Information Meeting', 'Learn about the trip, meet other families, and ask questions', '2025-11-15', '19:00', 'meeting', 'Trinity Church Fellowship Hall', true, trinity_id),
    ('First Payment Deadline', 'Initial deposit of $500 due', '2025-12-01', NULL, 'deadline', 'Online', true, trinity_id),
    ('Passport Application Day', 'Help available for passport applications', '2025-12-10', '10:00', 'activity', 'Trinity Church', true, trinity_id),
    ('Fundraiser: Car Wash', 'Help raise funds for the trip!', '2026-01-20', '09:00', 'fundraiser', 'Trinity Church Parking Lot', true, trinity_id),
    ('Final Payment Deadline', 'All remaining balances due', '2026-05-01', NULL, 'deadline', 'Online', true, trinity_id),
    ('Pre-Trip Orientation', 'Final preparation meeting before departure', '2026-06-15', '18:00', 'preparation', 'Trinity Church', true, trinity_id),
    ('Departure Day', 'Meet at church parking lot at 4:00 AM', '2026-06-26', '04:00', 'travel', 'Trinity Church Parking Lot', true, trinity_id);

    -- Insert sample resources
    INSERT INTO resources (name, description, url, resource_type, church_id) VALUES
    ('Packing List PDF', 'Complete checklist of items to bring', 'https://example.com/packing-list.pdf', 'document', trinity_id),
    ('Travel Insurance Guide', 'Information about included travel insurance', 'https://example.com/insurance.pdf', 'document', trinity_id),
    ('Peru Culture Video', 'Learn about Peruvian culture and customs', 'https://www.youtube.com/watch?v=example', 'video', trinity_id),
    ('Spanish Language App', 'Free app to learn essential Spanish phrases', 'https://duolingo.com', 'website', trinity_id),
    ('Medical Information Form', 'Required form for all participants', 'https://forms.google.com/example', 'form', trinity_id),
    ('Trip Preparation Guide', 'Comprehensive guide to preparing for the trip', 'https://example.com/guide.pdf', 'guide', trinity_id);

    -- Insert sample FAQs
    INSERT INTO faqs (question, answer, category, display, church_id) VALUES
    ('What is the trip cost?', 'The total trip cost is $2,500 per person. We offer payment plans to help families manage the cost.', 'Payments', true, trinity_id),
    ('Do I need a passport?', 'Yes, you will need a valid passport to travel to Peru. We recommend starting the application process immediately if you don''t have one.', 'Travel', true, trinity_id),
    ('What is the itinerary?', 'We will be spending time at Luz de Esperanza school, doing service work, and experiencing Peruvian culture. A detailed itinerary will be provided closer to the trip date.', 'General', true, trinity_id),
    ('Can parents go on the trip?', 'This is a student-focused trip, but we may have limited opportunities for parent volunteers. Contact us for more information.', 'General', true, trinity_id),
    ('What about travel insurance?', 'Travel insurance is included in the trip cost. We partner with a reputable travel insurance company that covers medical emergencies and trip cancellations.', 'Travel', true, trinity_id),
    ('How do I submit travel documents?', 'You can upload documents like passports, medical forms, and insurance information through the Parent Portal.', 'General', true, trinity_id);

END $$;

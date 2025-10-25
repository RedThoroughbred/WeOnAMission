-- Mission Trip Platform Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('parent', 'student', 'admin');
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE memory_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE event_type AS ENUM ('meeting', 'deadline', 'activity', 'preparation', 'travel', 'fundraiser', 'other');
CREATE TYPE resource_type AS ENUM ('document', 'video', 'website', 'form', 'guide', 'other');
CREATE TYPE question_type AS ENUM ('question', 'feedback', 'bug_report');
CREATE TYPE question_status AS ENUM ('submitted', 'pending', 'complete');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'parent',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    grade INTEGER,
    date_of_birth DATE,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_info TEXT,
    allergies TEXT,
    dietary_restrictions TEXT,
    additional_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_type TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment summary view (total cost, amount paid, balance)
CREATE TABLE payment_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE UNIQUE,
    total_cost DECIMAL(10, 2) NOT NULL DEFAULT 2500.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table (uploaded by parents)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    document_type TEXT, -- 'passport', 'medical', 'permission', etc.
    status document_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip memories table (photos and notes from students)
CREATE TABLE trip_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT,
    photo_path TEXT,
    status memory_status DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id)
);

-- Events table (calendar)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    event_type event_type DEFAULT 'other',
    location TEXT,
    display_on_calendar BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table (links, documents, videos)
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    resource_type resource_type DEFAULT 'other',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Questions table (questions submitted by users from the app)
CREATE TABLE user_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    question TEXT NOT NULL,
    question_type question_type DEFAULT 'question',
    status question_status DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question Responses table (admin responses to user questions)
CREATE TABLE question_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES user_questions(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES users(id),
    response TEXT NOT NULL,
    is_faq BOOLEAN DEFAULT false,
    user_notified BOOLEAN DEFAULT false,
    notified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs table (questions and answers for the FAQ section)
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    display BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Items table (dynamically managed content: packing lists, Spanish phrases, preparation tips, etc.)
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section TEXT NOT NULL, -- 'packing_list', 'spanish_phrases', 'preparation_tips', 'nice_to_know'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    display BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_students_parent_id ON students(parent_id);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_documents_student_id ON documents(student_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_trip_memories_student_id ON trip_memories(student_id);
CREATE INDEX idx_trip_memories_status ON trip_memories(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_display ON events(display_on_calendar);
CREATE INDEX idx_user_questions_status ON user_questions(status);
CREATE INDEX idx_user_questions_user_id ON user_questions(user_id);
CREATE INDEX idx_question_responses_question_id ON question_responses(question_id);
CREATE INDEX idx_faqs_display ON faqs(display);
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_content_items_section ON content_items(section);
CREATE INDEX idx_content_items_display ON content_items(display);

-- Create a view for payment summaries
CREATE OR REPLACE VIEW payment_summaries AS
SELECT 
    s.id as student_id,
    s.full_name as student_name,
    s.parent_id,
    COALESCE(pc.total_cost, 2500.00) as total_cost,
    COALESCE(SUM(p.amount), 0) as amount_paid,
    COALESCE(pc.total_cost, 2500.00) - COALESCE(SUM(p.amount), 0) as balance_due,
    CASE 
        WHEN COALESCE(SUM(p.amount), 0) = 0 THEN 'pending'::payment_status
        WHEN COALESCE(SUM(p.amount), 0) >= COALESCE(pc.total_cost, 2500.00) THEN 'paid'::payment_status
        ELSE 'partial'::payment_status
    END as status
FROM students s
LEFT JOIN payments p ON s.id = p.student_id
LEFT JOIN payment_config pc ON s.id = pc.student_id
GROUP BY s.id, s.full_name, s.parent_id, pc.total_cost;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for students table
CREATE POLICY "Parents can view own students" ON students
    FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert own students" ON students
    FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update own students" ON students
    FOR UPDATE USING (parent_id = auth.uid());

-- RLS Policies for payments table
CREATE POLICY "Parents can view payments for their students" ON payments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM students WHERE id = student_id AND parent_id = auth.uid())
    );

-- RLS Policies for payment_config table
CREATE POLICY "Parents can view config for their students" ON payment_config
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM students WHERE id = student_id AND parent_id = auth.uid())
    );

-- RLS Policies for documents table
CREATE POLICY "Parents can view documents for their students" ON documents
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM students WHERE id = student_id AND parent_id = auth.uid())
    );

CREATE POLICY "Parents can upload documents for their students" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM students WHERE id = student_id AND parent_id = auth.uid())
    );

-- RLS Policies for trip_memories table
CREATE POLICY "Students can view own memories" ON trip_memories
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM students WHERE id = student_id AND parent_id = auth.uid())
    );

CREATE POLICY "Students can submit memories" ON trip_memories
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM students WHERE id = student_id AND parent_id = auth.uid())
    );

-- RLS Policies for events table (public read, admin write)
CREATE POLICY "Anyone can view events" ON events
    FOR SELECT USING (display_on_calendar = true);

-- RLS Policies for resources table (public read, admin write)
CREATE POLICY "Anyone can view resources" ON resources
    FOR SELECT USING (true);

-- RLS Policies for user_questions table
CREATE POLICY "Users can view own questions" ON user_questions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can submit questions" ON user_questions
    FOR INSERT WITH CHECK (true);

-- RLS Policies for question_responses table
CREATE POLICY "Users can view responses to their questions" ON question_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_questions uq
            WHERE uq.id = question_id AND uq.user_id = auth.uid()
        )
    );

-- RLS Policies for faqs table (public read, admin write)
CREATE POLICY "Anyone can view faqs" ON faqs
    FOR SELECT USING (display = true);

-- RLS Policies for content_items table (public read, admin write)
CREATE POLICY "Anyone can view content items" ON content_items
    FOR SELECT USING (display = true);

-- Function to automatically create user record after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'parent')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_questions_updated_at BEFORE UPDATE ON user_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional - remove for production)
-- This helps with testing

-- Sample events
INSERT INTO events (name, description, event_date, event_time, event_type, display_on_calendar) VALUES
('Parent Information Meeting', 'Learn about the trip, meet other families, and ask questions', '2025-11-15', '19:00', 'meeting', true),
('First Payment Deadline', 'Initial deposit of $500 due', '2025-12-01', NULL, 'deadline', true),
('Passport Application Day', 'Help available for passport applications', '2025-12-10', '10:00', 'activity', true),
('Fundraiser: Car Wash', 'Help raise funds for the trip!', '2026-01-20', '09:00', 'fundraiser', true),
('Final Payment Deadline', 'All remaining balances due', '2026-05-01', NULL, 'deadline', true),
('Pre-Trip Orientation', 'Final preparation meeting before departure', '2026-06-15', '18:00', 'preparation', true),
('Departure Day', 'Meet at church parking lot at 4:00 AM', '2026-06-26', '04:00', 'travel', true);

-- Sample resources
INSERT INTO resources (name, description, url, resource_type) VALUES
('Packing List PDF', 'Complete checklist of items to bring', 'https://example.com/packing-list.pdf', 'document'),
('Travel Insurance Guide', 'Information about included travel insurance', 'https://example.com/insurance.pdf', 'document'),
('Peru Culture Video', 'Learn about Peruvian culture and customs', 'https://www.youtube.com/watch?v=example', 'video'),
('Spanish Language App', 'Free app to learn essential Spanish phrases', 'https://duolingo.com', 'website'),
('Medical Information Form', 'Required form for all participants', 'https://forms.google.com/example', 'form'),
('Trip Preparation Guide', 'Comprehensive guide to preparing for the trip', 'https://example.com/guide.pdf', 'guide');

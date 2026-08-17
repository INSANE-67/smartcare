-- Create Enum for message roles safely
DO $$ BEGIN
    CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system', 'data');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. AI Usage Logs Table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add Updated At Trigger for conversations
DROP TRIGGER IF EXISTS set_updated_at ON conversations;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Conversations
-- Patients can select their own conversations
DROP POLICY IF EXISTS "Patients can view their own conversations" ON conversations;
CREATE POLICY "Patients can view their own conversations"
    ON conversations FOR SELECT
    USING (auth.uid() = patient_id);

-- Patients can insert their own conversations
DROP POLICY IF EXISTS "Patients can create conversations" ON conversations;
CREATE POLICY "Patients can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

-- Patients can update their own conversations (e.g. changing title)
DROP POLICY IF EXISTS "Patients can update their own conversations" ON conversations;
CREATE POLICY "Patients can update their own conversations"
    ON conversations FOR UPDATE
    USING (auth.uid() = patient_id)
    WITH CHECK (auth.uid() = patient_id);

-- RLS Policies for Messages
-- Patients can view messages in their conversations
DROP POLICY IF EXISTS "Patients can view messages in their conversations" ON messages;
CREATE POLICY "Patients can view messages in their conversations"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.patient_id = auth.uid()
        )
    );

-- Patients can insert messages into their conversations
DROP POLICY IF EXISTS "Patients can insert messages in their conversations" ON messages;
CREATE POLICY "Patients can insert messages in their conversations"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.patient_id = auth.uid()
        )
    );

-- RLS Policies for AI Usage Logs
-- Patients can view their own usage logs (inserted securely via Admin Client)
DROP POLICY IF EXISTS "Patients can view their own usage logs" ON ai_usage_logs;
CREATE POLICY "Patients can view their own usage logs"
    ON ai_usage_logs FOR SELECT
    USING (auth.uid() = patient_id);

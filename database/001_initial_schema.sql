-- ===========================================
-- Splitly
-- Initial database schema
-- Version: 001
-- ===========================================

-- import per generare uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- creiamo campi "scelta multipla"
CREATE TYPE split_type AS ENUM (
    'equal',
    'custom',
    'percentage'
);
CREATE TYPE activity_type AS ENUM (
    'group_created',
    'member_joined',
    'member_left',
    'expense_created',
    'expense_updated',
    'expense_deleted',
    'payment_created',
    'payment_deleted'
);
CREATE TYPE payment_status AS ENUM (
    'pending',
    'completed',
    'cancelled'
);
CREATE TYPE entity_type AS ENUM (
    'group',
    'member',
    'expense',
    'payment'
);

-- creiamo le tabelle vere e proprie
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL CHECK (length(trim(name)) > 0),

    invite_code TEXT NOT NULL UNIQUE CHECK(length(invite_code) = 8),
    
    currency CHAR(3) NOT NULL DEFAULT 'EUR' CHECK (currency ~ '^[A-Z]{3}$'),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

    name TEXT NOT NULL CHECK (length(trim(name)) > 0),

    member_token TEXT NOT NULL UNIQUE CHECK(length(member_token) >= 16),

    recovery_code TEXT NOT NULL UNIQUE CHECK(length(recovery_code) >= 8),         --per recuperare il token member se cambio telefono

    is_owner BOOLEAN NOT NULL DEFAULT FALSE,

    avatar_color TEXT NOT NULL CHECK (length(trim(avatar_color)) > 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    UNIQUE (group_id, name)         -- nello stesso group_id non posso esserci due "name" uguali
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

    paid_by_member_id UUID NOT NULL REFERENCES group_members(id),

    description TEXT NOT NULL CHECK (length(trim(description)) > 0),

    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),

    category TEXT,

    split_type split_type NOT NULL DEFAULT 'equal',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()    
);

CREATE TABLE expense_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,

    member_id UUID NOT NULL REFERENCES group_members(id),

    share_amount NUMERIC(10,2),

    percentage NUMERIC(5,2),

    UNIQUE (expense_id, member_id),

    CHECK (share_amount IS NOT NULL OR percentage IS NOT NULL)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

    from_member_id UUID NOT NULL REFERENCES group_members(id),

    to_member_id UUID NOT NULL REFERENCES group_members(id),

    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),

    status payment_status NOT NULL DEFAULT 'completed',

    note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (from_member_id <> to_member_id)
);

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

    member_id UUID REFERENCES group_members(id),
    
    event_type activity_type NOT NULL,

    entity_type entity_type,

    entity_id UUID,
    
    description TEXT NOT NULL CHECK (length(trim(description)) > 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
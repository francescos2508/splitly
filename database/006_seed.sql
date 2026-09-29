-- ===========================================
-- Splitly
-- Development seed data
-- Version: 006
-- ===========================================


-- ===========================================
-- GROUP
-- ===========================================

INSERT INTO groups (
    id,
    name,
    invite_code,
    currency
)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Barcelona trip',
    'BCN2026X',
    'EUR'
);


-- ===========================================
-- MEMBERS
-- ===========================================

INSERT INTO group_members (
    id,
    group_id,
    name,
    member_token,
    recovery_code,
    is_owner,
    avatar_color
)
VALUES

(
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Francesco',
    'token_francesco_123456',
    'recover01',
    TRUE,
    '#FF5733'
),

(
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Marco',
    'token_marco_12345678',
    'recover02',
    FALSE,
    '#33FF57'
),

(
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'Luca',
    'token_luca_12345678',
    'recover03',
    FALSE,
    '#3357FF'
),

(
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'Anna',
    'token_anna_12345678',
    'recover04',
    FALSE,
    '#F333FF'
);


-- ===========================================
-- EXPENSES
-- ===========================================

INSERT INTO expenses (
    id,
    group_id,
    paid_by_member_id,
    description,
    amount,
    category,
    split_type
)
VALUES

(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Dinner',
    80.00,
    'restaurant',
    'equal'
),

(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'Spesa supermercato',
    50.00,
    'groceries',
    'custom'
);


-- ===========================================
-- EXPENSE PARTICIPANTS
-- ===========================================

-- Dinner:
-- Francesco pays 80€, 20€ each

INSERT INTO expense_participants (
    expense_id,
    member_id,
    share_amount
)
VALUES

(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    20.00
),

(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    20.00
),

(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '44444444-4444-4444-4444-444444444444',
    20.00
),

(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '55555555-5555-5555-5555-555555555555',
    20.00
);


-- Groceries:
-- paid from Marco
-- splitted between Marco and Luca

INSERT INTO expense_participants (
    expense_id,
    member_id,
    share_amount
)
VALUES

(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    25.00
),

(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '44444444-4444-4444-4444-444444444444',
    25.00
);


-- ===========================================
-- PAYMENTS
-- ===========================================

-- Marco pays Francesco 20€

INSERT INTO payments (
    id,
    group_id,
    from_member_id,
    to_member_id,
    amount,
    status,
    note
)
VALUES

(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    20.00,
    'completed',
    'For the dinner'
);


-- ===========================================
-- ACTIVITY LOG
-- ===========================================

INSERT INTO activity_log (
    group_id,
    member_id,
    event_type,
    entity_type,
    entity_id,
    description
)
VALUES

(
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'group_created',
    'group',
    '11111111-1111-1111-1111-111111111111',
    'Francesco created the group'
),

(
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'member_joined',
    'member',
    '33333333-3333-3333-3333-333333333333',
    'Marco joined the group'
),

(
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'expense_created',
    'expense',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Expense Dinner created'
);
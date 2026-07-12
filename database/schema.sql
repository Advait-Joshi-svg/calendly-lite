CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE USERS(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    slug varchar(100) NOT NULL UNIQUE,
    timezone varchar(100) NOT NULL DEFAULT 'America/New_York',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);
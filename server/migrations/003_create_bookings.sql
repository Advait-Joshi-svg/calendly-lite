CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  host_user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  guest_name VARCHAR(255) NOT NULL,

  guest_email VARCHAR(255) NOT NULL,

  starts_at TIMESTAMPTZ NOT NULL,

  ends_at TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT bookings_valid_time_range
    CHECK (ends_at > starts_at)
);
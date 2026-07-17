ALTER TABLE bookings
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
ADD COLUMN cancelled_at TIMESTAMPTZ;

ALTER TABLE bookings
ADD CONSTRAINT bookings_status_check
CHECK (status IN ('confirmed', 'cancelled'));
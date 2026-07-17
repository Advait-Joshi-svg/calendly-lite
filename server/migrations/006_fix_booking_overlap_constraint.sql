ALTER TABLE bookings
DROP CONSTRAINT bookings_no_overlap;

ALTER TABLE bookings
ADD CONSTRAINT bookings_no_overlap
EXCLUDE USING gist (
  host_user_id WITH =,
  tstzrange(starts_at, ends_at, '[)') WITH &&
)
WHERE (status = 'confirmed');
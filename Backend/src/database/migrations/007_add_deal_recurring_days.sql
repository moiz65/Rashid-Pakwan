ALTER TABLE deals
  ADD COLUMN days_of_week JSON NULL AFTER end_at,
  ADD COLUMN daily_start_time TIME NULL AFTER days_of_week,
  ADD COLUMN daily_end_time TIME NULL AFTER daily_start_time;

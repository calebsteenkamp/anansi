-- Owner-reviewed activation: only the four explicitly supplied, verified Auth UUIDs.
-- No account, profile, story, review or audio is deleted. Test memberships remain temporary.
begin;
select anansi_private.activate_demo(array[
 '18e02f00-0855-4b78-86a8-ecf0c4e4dd85', -- accounta@example.com
 'e7597f44-9cf2-4436-ac49-960759887600', -- accountb@example.com
 '2ecdc03a-7b65-498b-ad94-38b86742d203', -- storyteller@example.com
 'e8dc3c22-6e54-4c2c-a6c2-67d0829119cb'  -- verifier@example.com
]::uuid[]);
commit;

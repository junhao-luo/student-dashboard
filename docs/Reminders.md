# Assignment and exam email reminders

Sender: `reminder@eljhon.me`, via the server-only `RESEND_API_KEY` in each Convex deployment. Recipient: the owner's generated school email from the private server profile. The email contains task title, course, and Taiwan due time; no phone, student-profile dump, notes or files.

Check **Email a reminder to my school email**, choose the offset (default 1 day, 0 at the deadline), then save and sync. Local-only tasks do not schedule mail. Future tasks whose selected reminder time has already passed schedule a prompt reminder; overdue tasks do not. Existing cloud opt-ins begin scheduling on their next synchronized save.

Completed, deleted or opted-out tasks cancel pending jobs after synchronization. Changing the deadline/offset creates a new job generation; stale workers cannot claim it. A submission already in progress may still arrive. After a reminder is sent, metadata edits alone do not send another; changing its due time/offset can.

Caps reserve attempted sends: 10/day and 200/month per account, 50/day and 1,000/month per deployment (UTC windows), independently of the smaller support-email budget. Limits stop the job; no paid overages are enabled. Other apps using the same Resend account are outside these counters. Reminders are best effort, and the frontend does not currently display per-job delivery status.

Internal actions claim a job transactionally with a two-minute lease/watchdog. Resend receives the same idempotency key and frozen payload for retries. Retry transient/network/429/5xx failures at five minutes, at most three attempts and within 23 hours. Missing configuration and permanent provider errors stop the job. Zero-day reminders allow 15 minutes of scheduler delay; other reminders stop once the due time passes. Provider acceptance is recorded as sent, not proven inbox delivery. Job metadata is retained privately until its task is removed; provider/mailbox copies have separate retention.

References: [Convex durable scheduling and cancellation](https://docs.convex.dev/scheduling/scheduled-functions), [Resend 24-hour idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).

---
status: accepted
---

# Preserve the combined tip record for regular checkpoints

New regular Checkpoint forms collect Cash Tips and QR Tips separately, but submit
their sum as both `tips` and the existing `Чай` field record. Existing edit forms
restore values by field label, so storing two new records would lose the amount
when those forms reopen a Checkpoint. We retain the combined record to keep editing
compatible; the cash/QR split cannot be recovered for regular checkpoints, while
final checkpoints continue to retain their existing separate records.

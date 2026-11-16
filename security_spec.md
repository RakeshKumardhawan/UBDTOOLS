# Security Specification & Invariants

## 1. Data Invariants
1. All PC reports, live status records, and feedback documents MUST have strictly bounded field sets (`keys().hasAll` + `keys().hasOnly`), validated `isValidId()` document IDs (`^[a-zA-Z0-9_\-]+$`, max 128 chars), and bounded string lengths.
2. Star ratings in `user_feedbacks` MUST be integers in `[1, 5]`.
3. Server timestamps (`createdAt` / `updatedAt`) MUST equal `request.time`.
4. Read, list, and delete access to `/installed_pcs`, `/pc_reports`, and `/user_feedbacks` is strictly restricted to verified Admin (`Rakeshkumardhawan123@gmail.com` with `email_verified == true` or `/admins/{uid}` document), preventing unauthorized scraping or PII exposure.
5. Client-side role self-escalation on `/admins/{uid}` is forbidden (`allow write: if false`).

## 2. Adversarial "Dirty Dozen" Payloads (All Must Fail)
1. Shadow field injection (`isAdmin: true`) on `installed_pcs` create -> Rejected by `hasOnly`.
2. Oversized 1MB `officeLocation` string -> Rejected by `.size() <= 200`.
3. Invalid document ID containing `/` or spaces or >128 chars -> Rejected by `isValidId`.
4. Forged `updatedAt` client timestamp != `request.time` -> Rejected by `data.updatedAt == request.time`.
5. Rating out of bounds (`rating: 99` or `rating: 0` or `rating: "5"`) -> Rejected by `is int && rating >= 1 && rating <= 5`.
6. Unauthenticated read/list on `installed_pcs` -> Rejected by `isAdmin()`.
7. Non-admin authenticated user with unverified admin email reading `user_feedbacks` -> Rejected by `isAdmin()`.
8. Email spoofing (`email == 'Rakeshkumardhawan123@gmail.com'` with `email_verified == false`) -> Rejected by `email_verified == true`.
9. Deleting `pc_reports` without admin auth -> Rejected by `isAdmin()`.
10. Creating a document in `/admins/{uid}` to escalate privilege -> Rejected by `allow write: if false`.
11. Modifying `pcId` on `installed_pcs` update -> Rejected by `incoming().pcId == existing().pcId`.
12. Mutating immutable `pc_reports` or `user_feedbacks` after creation -> Rejected by `allow update: if isAdmin()`.
13. Non-admin client trying to toggle `/app_settings/licensing` or create/activate `/pc_licenses/{pcId}` -> Rejected by `isAdmin()`.
14. Attempting to list all `/pc_licenses` documents without Admin auth -> Rejected by `allow list: if isAdmin()`.
15. Injecting negative price or arbitrary `mode` in `/app_settings/licensing` -> Rejected by `isValidLicensePolicy`.
16. Reusing/updating an existing `/payment_claims/UTR-{utr}` document as non-admin -> Rejected (`allow update: if isAdmin()` + immutable `create` with server-enforced `exists == false` atomic precondition).
17. Submitting a `payment_claims` doc with pre-set `status: 'APPROVED'` on create -> Rejected by `incoming().status == 'PENDING'`.
18. Attempting to list `/payment_claims` without Admin auth -> Rejected by `allow list: if isAdmin()`.


# 🛠 NEURØN Developer Log (Post-Audit Hardening)

### 1. Entropy & ID Management
- **Issue**: Use of `Math.random()` created predictable/guessable team IDs and sequences.
- **Solution**: Implemented `generateSecureID` using `window.crypto.getRandomValues()`.
- **Impact**: Mitigates ID enumeration attacks.

### 2. Payment Integrity
- **Issue**: Hardcoded `sim_order` string allowed for client-side payment bypass.
- **Solution**: Removed all simulation/bypass logic. Strict HMAC-SHA256 signature verification is mandatory.
- **Impact**: Secures financial registration flow.

### 3. Hashed Authentication (VITE_ Shielding)
- **Issue**: Storing plain-text passwords in `VITE_` variables makes them visible in the browser's DevTools (F12).
- **Solution**: Migrated to SHA-256 Hashed Authentication. The environment variable now stores `VITE_ADMIN_HASH`. 
- **Implementation**: The client computes the hash of the user's input and compares it to the stored hash. The original password is never part of the bundle.
- **Action Required**: Admins must generate a SHA-256 hash of their password and set it as `VITE_ADMIN_HASH` in the environment configuration.

### 4. Persistence Migration (Supabase Shift)
- **Issue**: MongoDB Atlas Data API restrictions.
- **Solution**: Migrated to Supabase (PostgreSQL).
- **Impact**: Standardized SQL and RLS for better data integrity.

### 5. Data Integrity: Uniqueness Enforcement
- **Issue**: Potential for multiple club applications using the same Register Number or Phone.
- **Solution**: Implemented application-level validation and provided database-level constraints.
- **SQL Migration**:
  ```sql
  /* Enforce uniqueness for club applications in Supabase SQL Editor */
  ALTER TABLE club_applications ADD CONSTRAINT unique_reg_number UNIQUE (reg_number);
  ALTER TABLE club_applications ADD CONSTRAINT unique_phone UNIQUE (phone);
  ```

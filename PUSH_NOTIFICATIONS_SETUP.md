# Push Notificaties Setup Guide

## Wat je zelf moet doen

### 1. Firebase Project aanmaken (voor Android)

1. Ga naar [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project"
3. Project naam: `allignd` (of je eigen naam)
4. Google Analytics kan aan of uit
5. Klik "Create project"

6. Ga naar Project Settings (tandwiel icoon)
7. Scroll naar "Your apps" sectie
8. Klik op het Android icoon
9. Register app:
   - Android package name: `nl.allignd.app`
   - App nickname: `Allignd Android`
   - Debug signing certificate: (optioneel, kan later)
10. Download `google-services.json`
11. Plaats dit bestand in: `android/app/google-services.json`

### 2. APNs Key genereren (voor iOS)

1. Ga naar [Apple Developer Portal](https://developer.apple.com/account/)
2. Ga naar "Certificates, Identifiers & Profiles"
3. Klik op "Keys" (links)
4. Klik "+" om nieuwe key te maken
5. Key name: `Allignd Push Notifications`
6. Vink "Apple Push Notifications service (APNs)" aan
7. Klik "Continue" → "Register"
8. Download de `.p8` file
9. Noteer de **Key ID** (staat op de key pagina)
10. Noteer je **Team ID** (staat rechtsboven op je account pagina)

### 3. Upload naar Supabase

1. Ga naar je Supabase project
2. Settings → Auth → Push Notifications
3. **iOS:**
   - Upload je `.p8` file
   - Vul Key ID in
   - Vul Team ID in
4. **Android:**
   - Upload je `google-services.json` file

### 4. Database Migration uitvoeren

Voer deze SQL uit in Supabase SQL Editor:

```sql
-- Add push_token column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON profiles(push_token);
```

### 5. Testen

1. Build de app: `npm run build`
2. Sync Capacitor: `npx cap sync`
3. Open in Xcode (iOS) of Android Studio (Android)
4. Run op device (niet simulator voor push notificaties)
5. App zou om toestemming moeten vragen
6. Check Supabase → profiles tabel → push_token kolom moet gevuld zijn

### 6. Notificaties sturen

**Via Supabase Dashboard (handmatig testen):**
1. Ga naar Authentication → Users
2. Klik op een user
3. Scroll naar "Push Tokens"
4. Klik "Send Test Push"

**Via de Allignd API (automatisch):**
Er is een serverless endpoint `api/notifications.js` dat dagelijkse herinneringen en fase-overgangen verstuurt via FCM (Android) en APNs (iOS). Twee cron jobs (gedefinieerd in `vercel.json`) roepen hem elke dag aan:

- `GET /api/notifications/daily` (06:00 UTC) — dagelijkse check-in herinnering, overgeslagen voor gebruikers die al gelogd hebben
- `GET /api/notifications/phase` (07:00 UTC) — melding zodra een gebruiker in een nieuwe cyclusfase komt

#### Required environment variables (Vercel)

| Variabele | Doel |
| --- | --- |
| `CRON_SECRET` | Beschermt de cron endpoints. Vercel stuurt dit automatisch mee als `Authorization: Bearer <CRON_SECRET>` bij cron jobs. |
| `FCM_SERVICE_ACCOUNT_JSON` | Firebase service account JSON (Firebase Console → Project Settings → Service Accounts → "Generate new private key"). Nodig voor Android. |
| `APNS_KEY` | De inhoud van je `.p8` bestand (uit stap 2). Nodig voor iOS. |
| `APNS_KEY_ID` | Key ID van je APNs key (uit stap 2). |
| `APNS_TEAM_ID` | Team ID van je Apple developer account (uit stap 2). |
| `APNS_BUNDLE_ID` | Bundle ID van de app (`nl.allignd.app`). Optioneel, heeft een default. |

Optioneel: `NOTIFICATIONS_SECRET` (fallback als `CRON_SECRET` niet is gezet) en `APNS_ENV=sandbox` (voor testen op een development build).

#### Migratie uitvoeren

De API gebruikt twee extra kolommen op `profiles` (staan al in `add_push_token_column.sql`, maar voer gerust opnieuw uit):

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_platform TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_notified_phase TEXT;
```

De app slaat hier automatisch `push_platform` ('ios' of 'android') op bij het registeren van het token. `last_notified_phase` voorkomt dubbele fase-overgang berichten.

#### Handmatig sturen

```bash
curl -X POST https://<jouw-domain>.vercel.app/api/notifications/send \
  -H "Authorization: Bearer <CRON_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"userId":"<user-id>","title":"Test","body":"Werkt dit?","view":"today"}'
```

Let op: een `user_id` in de `profiles` tabel is een UUID. Het endpoint verwacht dat ID, niet het e-mailadres.

## Bestanden die zijn aangemaakt

- `src/utils/pushNotifications.js` - Push notificatie logic
- `src/utils/platform.js` - Platform detection (iOS/Android/Web)
- `add_push_token_column.sql` - Database migration
- `api/notifications.js` - Serverless endpoint voor dagelijkse + fase notificaties (FCM/APNs)

## Bestanden die zijn aangepast

- `capacitor.config.ts` - PushNotifications plugin config
- `src/pages/Onboarding.jsx` - Push registratie na onboarding
- `src/context/UserContext.jsx` - Push token verwijderen bij logout
- `vercel.json` - Cron jobs + rewrites voor `/api/notifications`
- `src/App.jsx` - Navigatie na een push-notificatie tap (`allignd-push-navigate` event)

## Belangrijke notes

- Push notificaties werken alleen op native devices (iOS/Android), niet in web browser
- iOS vereist een echt device (niet simulator) voor push notificaties
- Android kan getest worden in emulator
- Users moeten toestemming geven voor push notificaties
- Token wordt automatisch opgeslagen in Supabase na toestemming

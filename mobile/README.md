# Allignd iOS- en Android-app

The Expo app lives in this directory. Its primary app view renders the real web
`MainLayout`, providers and `src/index.css` in a bundled Expo DOM component. This
keeps the logo header, five tabs, screens, typography and phase colors identical
to the Vite app. It does not load the public website as the screen source.

The older native Today files and the `/website` route are temporary migration
work, not the primary visual direction. Do not introduce a different native visual
interpretation without the owner's approval.

## Preview on an iPhone

1. Install **Expo Go** from the App Store on the iPhone.
2. From this directory, run:

   ```sh
   npm ci
   npx expo start
   ```

3. Scan the QR code with Expo Go. The iPhone needs to reach the development server.

## Preview in the Review pane

Run `npm run web -- --port 8081 --localhost`, open the shown localhost URL and
choose **Bekijk de demo**. The demo opens the real web Vandaag screen with sample
data and working tabs for Community, Beweging, Voeding and Cyclus. Preview data
does not sync to an account. Choose **Bekijk de onboarding** to walk through the
same onboarding and calorie calculation without creating an account or writing to
Supabase. The Expo flow skips the old paywall and opens Vandaag after completion;
Apple purchases will be a separate store integration. A signed-in Expo session is
passed to the bundled web Supabase client, but backend and account flows still
need device verification.

## Verify the app bundle

```sh
npm run typecheck
npm test
npx expo-doctor
npx expo export --platform ios --platform android --output-dir dist-preview
```

Web rendering is a visual preview. Verify the bundled DOM component, typography,
safe areas, forms and account actions on real iOS and Android devices as well.

## iPhone beta builds

EAS Build can compile iOS in Expo's cloud, avoiding a local Xcode build. A cloud
build requires signing in to an Expo account. Installing a standalone beta on a
device or distributing it through TestFlight requires Apple signing credentials
and an Apple Developer account.

The iOS and Android application identifier is `nl.allignd.app`.

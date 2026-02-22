# IFMedium MVP-0 (Expo SDK 54)

Local-first mobile app for interpreting conversation messages with versioned manual tagging and simulated AI suggestions.

## Stack
- Expo SDK 54 + TypeScript
- React Navigation (native stack)
- Local SQLite on-device storage with `expo-sqlite`
- Validation with `zod`
- No auth and no external APIs

## Run in GitHub Codespaces + Expo Go v54
1. Open this repository in GitHub Codespaces.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Expo with a tunnel:
   ```bash
   npx expo start --tunnel
   ```
4. In Expo Go **v54** on your physical phone, scan the QR code shown in the terminal.
5. The app should open from the tunneled URL.

## Features in MVP-0
- Conversations list and creation
- Per-conversation message list and message creation
- Automatic interpretation `v1` on message creation
  - `intentLabel = inform`
  - `toneLabel = neutral`
  - `certainty = 50`
  - `concerns = []`
- Edit Interpretation modal that always creates a **new version** (append-only)
- History screen ordered by `versionNumber`
- Diff screen comparing any two versions field-by-field with changed-field highlighting
- Simulated suggestion engine (`suggestInterpretation`) with simple heuristics and "Apply suggestion"
- First-launch seeding:
  - 1 conversation
  - 3 messages
  - one message gets interpretation `v2`

## Database schema
Created on app startup if missing:
- `conversation(id TEXT PRIMARY KEY, title TEXT, createdAt INTEGER)`
- `message(id TEXT PRIMARY KEY, conversationId TEXT, authorLabel TEXT, rawText TEXT, createdAt INTEGER)`
- `interpretation_version(id TEXT PRIMARY KEY, messageId TEXT, versionNumber INTEGER, intentLabel TEXT, toneLabel TEXT, certainty INTEGER, concernsJson TEXT, notes TEXT, createdAt INTEGER)`

## Codespaces devcontainer
`.devcontainer/devcontainer.json` includes:
- Node LTS base image
- `postCreateCommand` to run `npm install`
- Forwarded ports: `8081`, `19000`, `19001`

## Notes
- This app is local-first and stores data in SQLite on the device running Expo Go.
- No network APIs are called for inference; suggestions are simulated heuristics.

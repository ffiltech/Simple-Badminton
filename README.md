# Simple Badminton

A React Native Expo app for managing badminton matches with score tracking and statistics.

## 🏸 Features

- Track match scores in real-time
- Customizable winning score (11, 15, 21 points)
- Player name customization
- Match statistics and history
- Action logging during matches
- Dark mode UI

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd app_antigravity
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your EAS project ID
# You can get this from https://expo.dev
```

4. Run the app:
```bash
npx expo start
```

## 📱 Building for Production

### Android APK

To build an Android APK:

```bash
# Make sure you have your .env file configured with EXPO_PUBLIC_EAS_PROJECT_ID
eas build --platform android --profile preview
```

### iOS

To build for iOS:

```bash
eas build --platform ios --profile production
```

## 🔧 Configuration

The app uses environment variables for sensitive configuration. Create a `.env` file based on `.env.example`:

```env
EXPO_PUBLIC_EAS_PROJECT_ID=your-project-id-here
```

**Important**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

## 📂 Project Structure

```
app_antigravity/
├── app/              # App screens and navigation
├── assets/           # Images, icons, and other assets
├── src/
│   ├── components/   # Reusable UI components
│   ├── logic/        # Business logic and utilities
│   └── types/        # TypeScript type definitions
├── app.config.js     # Dynamic Expo configuration
├── app.json          # Static Expo configuration (no secrets)
└── .env.example      # Environment variables template
```

## 🔐 Security Notes

- The `app.json` file does not contain sensitive data
- All secrets are managed through environment variables in `.env`
- The `.env` file is excluded from version control
- Use `.env.example` as a template for required variables

## 📄 License

This project is private and not licensed for public use.

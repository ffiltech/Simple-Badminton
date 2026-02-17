# Simple Badminton 🏸

A modern, feature-rich React Native app for tracking badminton matches with real-time scoring, statistics, and match history. Built with Expo for cross-platform support on iOS, Android, and Web.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Expo](https://img.shields.io/badge/Expo-~54.0-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-green.svg)](https://reactnative.dev/)

## ✨ Features

- **📊 Real-time Score Tracking** - Keep track of points as the match progresses
- **⚙️ Customizable Game Settings** - Choose winning score (11, 15, or 21 points)
- **👥 Player Management** - Set custom player names for each match
- **📈 Match Statistics** - View detailed stats after each game
- **📜 Match History** - Browse and review past matches
- **🎯 Action Logging** - Record all actions during a match
- **🌙 Dark Mode UI** - Beautiful dark theme for comfortable viewing
- **📱 Cross-Platform** - Works on iOS, Android, and Web

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ffiltech/Simple-Badminton.git
   cd simple-badminton
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your preferred platform**
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal or open http://localhost:8081 in your browser

## 📱 Building for Production

### Android APK

To build a production APK:

1. Set up your EAS project (first time only):
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   # Edit .env and add your EXPO_PUBLIC_EAS_PROJECT_ID
   ```

3. Build the APK:
   ```bash
   eas build --platform android --profile preview
   ```

### iOS

To build for iOS:

```bash
eas build --platform ios --profile production
```

## 🎮 How to Use

1. **Start a New Match**
   - Tap "New Match" on the home screen
   - Enter player names (optional)
   - Select winning score (11, 15, or 21 points)

2. **Track Scores**
   - Tap on player buttons to add points
   - Use undo/redo for corrections
   - Log fouls and other actions

3. **View Statistics**
   - After the match, view detailed statistics
   - See match history on the home screen
   - Share match results

## 📂 Project Structure

```
simple-badminton/
├── app/                    # App screens and navigation (Expo Router)
│   ├── index.tsx          # Home screen
│   ├── match/             # Match-related screens
│   └── about.tsx          # About screen
├── assets/                # Images, icons, and fonts
├── src/
│   ├── components/        # Reusable UI components
│   ├── logic/             # Business logic and utilities
│   │   ├── ScoreEngine.ts # Match scoring logic
│   │   └── i18n.ts        # Internationalization
│   └── types/             # TypeScript type definitions
├── app.config.js          # Dynamic Expo configuration
├── app.json               # Static Expo configuration
└── .env.example           # Environment variables template
```

## 🔧 Configuration

### Environment Variables

The app uses environment variables for build configuration. Create a `.env` file:

```env
EXPO_PUBLIC_EAS_PROJECT_ID=your-project-id-here
```

> **Note**: The `.env` file is gitignored and should never be committed. Use `.env.example` as a template.

## 🛠️ Tech Stack

- **[React Native](https://reactnative.dev/)** - Mobile framework
- **[Expo](https://expo.dev/)** - Development platform
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - File-based routing
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Local data persistence
- **[Lucide React Native](https://lucide.dev/)** - Icon library

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Inspired by the love of badminton 🏸

## 📞 Support

If you have any questions or run into issues, please [open an issue](https://github.com/ffiltech/Simple-Badminton/issues) on GitHub.

---



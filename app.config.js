// Load environment variables from .env file
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                const value = valueParts.join('=').trim();
                if (key && value) {
                    process.env[key.trim()] = value;
                }
            }
        });
    }
}

loadEnv();

export default {
    expo: {
        name: "Simple Badminton",
        slug: "simple-badminton",
        version: "1.0.10",
        orientation: "default",
        icon: "./assets/icon.png",
        userInterfaceStyle: "dark",
        scheme: "badminton-manager",
        newArchEnabled: true,
        platforms: ["ios", "android", "web"],
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff",
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.simplebadminton.app",
            buildNumber: "10",
            infoPlist: {
                ITSAppUsesNonExemptEncryption: false,
            },
        },
        android: {
            package: "com.simplebadminton.app",
            versionCode: 10,
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#E8E8E8",
            },
            permissions: [],
            edgeToEdgeEnabled: true,
        },
        web: {
            favicon: "./assets/favicon.png",
        },
        extra: {
            eas: {},
        },
        plugins: [],
    },
};

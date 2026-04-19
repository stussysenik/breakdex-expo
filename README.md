# Breakdex

> **A breakdancing move tracker for B-Boys and B-Girls**

Breaks is a mobile application built with **Expo** and **React Native** that helps breakdancers track, review, and master their moves. Whether you're a beginner learning toprock or a seasoned b-boy perfecting your freezes, Breakdex has you covered.

![Breakdex Logo](assets/icon.png)

## Features

- **Arsenal**: Browse and organize your move collection
- **Create Moves**: Add new moves with categories, notes, and progress tracking
- **Review**: Watch and rate your recorded sessions
- **Flow**: Build and practice combos
- **Stats**: Track your progress with visual analytics
- **Lab**: Experiment with new moves and variations
- **Settings**: Customize your theme (light/dark mode)

## Tech Stack

### Frontend
- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **UI Components**: [React Native Elements](https://reactnativeelements.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [@expo/vector-icons](https://docs.expo.dev/versions/latest/sdk/vector-icons/)
- **Styling**: Custom theme system with DSL

### Backend & Data
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Storage**: Local storage with AsyncStorage

### Development
- **Language**: TypeScript + ClojureScript (hybrid)
- **Build Tool**: [shadow-cljs](https://shadow-cljs.org/) for ClojureScript
- **Type Checking**: TypeScript
- **Linting**: ESLint

###DevOps
- **Containerization**: Docker
- **CI/CD**: GitHub Actions (TBD)

## Project Structure

```
breakdex-expo/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx             # Arsenal (main moves list)
│   │   ├── review.tsx            # Session review
│   │   ├── flow.tsx              # Combo builder
│   │   ├── stats.tsx             # Analytics
│   │   ├── lab.tsx               # Move laboratory
│   │   └── settings.tsx          # App settings
│   ├── move/
│   │   ├── [id].tsx              # Move detail view
│   │   └── create.tsx            # Create new move
│   └── _layout.tsx               # Root layout
├── lib/                          # Shared utilities
│   ├── theme.ts                  # Theme definitions
│   ├── dsl/                      # Design system DSL
│   ├── store/                    # Zustand stores
│   │   ├── moveStore.ts          # Moves store
│   │   ├── reviewStore.ts        # Review store
│   │   └── settingsStore.ts      # Settings store
│   └── database/                 # Database utilities
├── src/                          # ClojureScript source
│   ├── clj/                      # Clojure code
│   │   ├── breakdex/
│   │   │   ├── core.cljs         # Core logic
│   │   │   ├── design/tokens.cljs
│   │   │   ├── dsl/components.cljs
│   │   │   ├── screens.cljs
│   │   │   └── state/store.cljs
│   └── cljs/                     # ClojureScript entry
│       └── breakdex/rn_init.cljs
├── openspec/                     # OpenSpec documentation
│   ├── config.yaml
│   └── changes/
│       └── flutter-to-expo-rewrite/
│           ├── .openspec.yaml
│           ├── proposal.md
│           ├── specs/
│           └── tasks.md
├── assets/                       # Static assets
├── docker-compose.yml            # Docker Compose config
├── Dockerfile                    # Docker build config
├── app.json                      # Expo config
├── package.json                  # Dependencies
└── README.md                     # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Git
- (Optional) Docker for containerized development

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/stussysenik/breakdex-expo.git
   cd breakdex-expo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   # Create .env file with your Supabase credentials
   cp .env.example .env
   # Edit .env with your Supabase URL andanon key
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Run on device/emulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Or scan the QR code with Expo Go app on your phone

### Docker Development

To run the app in a containerized environment:

```bash
# Build and start containers
docker-compose up --build

# Or run individually
docker build -t breakdex-expo .
docker run -p 19000:19000 -p 19001:19001 -p 19002:19002 breakdex-expo
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

### Expo Configuration

Edit `app.json` to customize:
- App name and slug
- Icons and splash screen
- Platform-specific settings
- Plugins and permissions

## Architecture

### State Management

Breakdex uses **Zustand** for client-side state management with three main stores:

- **moveStore**: Manages moves (CRUD operations, filtering, categorization)
- **reviewStore**: Handles session recordings and reviews
- **settingsStore**: Stores user preferences (theme, etc.)

### Navigation

Expo Router provides file-based routing:
- Tab navigation at `/(tabs)/`
- Stack navigation for move creation/editing
- Dynamic routes for move details (`/move/[id]`)

### Theme System

Custom theme DSL supports:
- Light and dark modes
- Color tokens and spacing system
- Responsive design utilities
- Component variants

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- **TypeScript**: Strict typing enabled
- **ESLint**: Pre-configured with React Native rules
- **ClojureScript**: Follow shadow-cljs conventions
- **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/)

### Running Tests

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
```

## License

This project is **private** and proprietary. All rights reserved.

## Acknowledgments

- Built with [Expo](https://expo.dev/)
- Inspired by the global breakdancing community
- Special thanks to all B-Boys and B-Girls who keep the culture alive

---

**Made with love for the breaking community**

[![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![License: Private](https://img.shields.io/badge/License-Private-red)](https://github.com/stussysenik/breakdex-expo)

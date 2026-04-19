# Contributing to Breakdex

Thank you for your interest in contributing to Breakdex! We welcome contributions from everyone.

## How to Contribute

### Reporting Bugs

1. **Check for existing issues**: Please search the [issues](https://github.com/stussysenik/breakdex-expo/issues) to see if the bug has already been reported.

2. **Create a new issue**: If the bug hasn't been reported, open a new issue with:
   - A clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots or screen recordings (if applicable)
   - Your device/OS information
   - Expo SDK version

### Suggesting Features

We love new ideas! To suggest a feature:

1. Open a new issue with the `enhancement` label
2. Provide a clear description of the feature
3. Explain the use case and benefits
4. Include mockups or sketches if helpful

### Code Contributions

#### Prerequisites

- Familiarity with React Native and Expo
- Node.js 18+ installed
- Git installed
- Expo CLI installed (`npm install -g expo-cli`)

#### Getting Started

1. **Fork the repository**: Click the "Fork" button at the top-right of the repository page.

2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/breakdex-expo.git
   cd breakdex-expo
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/stussysenik/breakdex-expo.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Create environment file**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

6. **Run the app**:
   ```bash
   npm start
   ```

#### Creating a Feature Branch

Always work on a new branch, not on `main`:

```bash
# Sync with upstream first
git fetch upstream
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

#### Branch Naming Conventions

| Type | Prefix | Example |
|------|--------|---------|
| Feature | `feature/` | `feature/add-video-recording` |
| Bug fix | `fix/` | `fix/move-deletion-bug` |
| Documentation | `docs/` | `docs/update-readme` |
| Refactor | `refactor/` | `refactor/theme-system` |
| Chore | `chore/` | `chore/update-dependencies` |

#### Making Changes

1. **Follow existing patterns**: Match the coding style and architecture patterns already in use.

2. **Keep commits atomic**: Each commit should represent a single logical change.

3. **Write good commit messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add new feature`
   - `fix: fix a bug`
   - `docs: update documentation`
   - `refactor: refactor code`
   - `chore: maintenance tasks`

4. **Run checks before committing**:
   ```bash
   npm run lint
   npm run typecheck
   ```

5. **Update documentation**: If your changes affect the API or user-facing features, update the README and other relevant docs.

#### Submitting a Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request**: Go to the [Pull Requests](https://github.com/stussysenik/breakdex-expo/pulls) page and click "New Pull Request".

3. **Fill out the PR template**: Provide all requested information:
   - Clear description of changes
   - Related issues (link with `#123`)
   - Screenshots or videos if UI changes
   - Testing notes

4. **Request review**: Ask specific maintainers for review if needed.

5. **Address feedback**: Make requested changes and push new commits to the same branch.

## Development Guidelines

### TypeScript

- Use strict typing everywhere
- Avoid `any` type - use proper types or `unknown`
- Type all function parameters and return values
- Use interfaces for object shapes
- Prefer `type` for union types and simple aliases

### React/React Native

- Use functional components with hooks
- Extract reusable components to `lib/` or shared directories
- Use Zustand for state management (not React Context for complex state)
- Keep components focused and small
- Use memoization (`useMemo`, `useCallback`) for performance optimization

### ClojureScript

- Follow shadow-cljs conventions
- Use `:>` for React interop
- Keep ClojureScript logic separate from UI
- Use spec for runtime validation

### Styling

- Use the theme DSL for colors, spacing, and typography
- Avoid hardcoded values - use theme tokens
- Follow the existing design system
- Keep styles consistent across the app

### Navigation

- Use Expo Router's file-based routing
- Keep navigation logic in layout files
- Use TypeScript types for route parameters
- Avoid deep nesting in navigation

### State Management (Zustand)

- Create separate stores for different domains
- Keep stores focused and minimal
- Use selectors for derived state
- Avoid business logic in stores - keep them simple
- Use middleware (persist, devtools) as needed

## Testing

Currently, Breakdex uses:
- TypeScript type checking (`npm run typecheck`)
- ESLint for code quality (`npm run lint`)

Future testing strategy:
- Jest for unit tests
- React Native Testing Library for component tests
- Detox for end-to-end tests

## Code Review Process

1. **Initial review**: Maintainer will review within 1-3 days
2. **Feedback**: You may receive comments requesting changes
3. **Iteration**: Make changes and push to the same branch
4. **Approval**: Once approved, a maintainer will merge your PR
5. **Release**: Your changes will be included in the next release

## Becoming a Maintainer

Regular contributors who demonstrate:
- Deep understanding of the codebase
- Quality contributions
- Helpfulness in reviewing others' PRs
- Commitment to the project's vision

May be invited to become maintainers with write access.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). We expect all contributors to be respectful and inclusive.

## Questions?

If you have questions about contributing, please:
1. Check the existing issues and discussions
2. Open a new discussion on GitHub
3. Reach out to maintainers directly

Happy coding! 🎉

# Capability: App Structure

## ADDED Requirements

### Requirement: Expo Router Shell
The application SHALL provide a native Expo Router shell with a tabbed primary navigation for Arsenal, Review, Flow, Stats, Lab, and Settings.

#### Scenario: Launch the primary tab shell
- **GIVEN** the app launches successfully on iOS
- **WHEN** the user lands on the main experience
- **THEN** Arsenal is the default screen
- **AND** the primary tab routes for Review, Flow, Stats, Lab, and Settings are available

### Requirement: Move Management
The application SHALL let users create, browse, search, and edit moves from the Arsenal and move detail screens.

#### Scenario: Create and reopen a move
- **GIVEN** the user is on Arsenal
- **WHEN** they create a move with a name and optional category or notes
- **THEN** the move appears in the Arsenal list
- **AND** selecting the move opens the editable move detail screen

### Requirement: Review Workspace
The application SHALL expose a review workspace that shows due cards, session counters, and card rating actions.

#### Scenario: Open the review workspace
- **GIVEN** the application has launched
- **WHEN** the user navigates to Review
- **THEN** the screen shows due-now metrics and session statistics
- **AND** the current card state or empty-state guidance is visible

### Requirement: Training Support Screens
The application SHALL provide Flow, Stats, Lab, and Settings screens that render current store data for practice planning.

#### Scenario: Open support screens
- **GIVEN** the application has launched
- **WHEN** the user opens Flow, Stats, Lab, or Settings
- **THEN** each screen renders its header and current derived state
- **AND** the user can continue back to the rest of the app shell

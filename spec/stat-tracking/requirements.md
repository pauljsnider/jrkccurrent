# Stat-Tracking Requirements

## Feature Name
Youth Soccer Stat-Tracking Application

## Introduction
A mobile-optimized web application for coaches to track player statistics during youth soccer games. The application provides a simple, compact interface for real-time stat collection and automatically emails game summaries to the coach.

## User Stories
- As a youth soccer coach, I want to track player activities during games so that I can provide meaningful feedback and recognition
- As a coach, I want a mobile-friendly interface so that I can quickly log stats from the sideline without disrupting the game
- As a coach, I want an automatic game timer so that I know when stats occurred during the match
- As a coach, I want to receive an email summary after the game so that I can review performance and share with parents
- As a coach, I want to rate overall player contribution so that I can recognize attitude and leadership

## EARS Requirements

### 1. Roster Management
1.1. The system SHALL display a roster of all team players
1.2. The system SHALL allow viewing all players simultaneously for quick access
1.3. The system SHALL maintain player names persistently across sessions

### 2. Game Timer
2.1. The system SHALL provide a game timer that can be started and stopped
2.2. The system SHALL display the current game time prominently
2.3. The system SHALL record timestamps for all stat entries relative to game start
2.4. The system SHALL allow manual time adjustment if needed

### 3. Stat Tracking
3.1. The system SHALL track the following stat categories for each player:
   3.1.1. Goals - recorded when a player scores
   3.1.2. Assists - recorded when a player creates a scoring opportunity
   3.1.3. Blocks/Saves - recorded for defensive plays and goalkeeper saves
   3.1.4. Hustle/Effort Plays - recorded for exceptional effort moments
   3.1.5. Coach's Star Rating - 1-3 star rating for overall contribution

3.2. The system SHALL record the game time for each stat entry
3.3. The system SHALL allow quick single-tap stat entry for each category
3.4. The system SHALL provide visual confirmation when a stat is recorded
3.5. The system SHALL allow coaches to add free-form notes for each player
3.6. The system SHALL provide quick access to add notes without disrupting stat tracking flow

### 4. Mobile User Experience
4.1. The system SHALL be optimized for mobile phone screens
4.2. The system SHALL provide large, easily tappable buttons
4.3. The system SHALL work in portrait orientation
4.4. The system SHALL be usable with one hand during active coaching
4.5. The system SHALL have minimal loading times and smooth interactions

### 5. Data Export
5.1. The system SHALL automatically email game statistics to paul@paulsnider.net
5.2. The system SHALL format the email with player names, stats, timestamps, and notes
5.3. The system SHALL include the total game time in the email summary
5.4. The system SHALL send the email when the game timer is stopped or manually triggered

### 6. Data Persistence
6.1. The system SHALL save game data locally to prevent loss during the session
6.2. The system SHALL maintain roster information between sessions
6.3. The system SHALL handle network interruptions gracefully

### 7. Performance Requirements
7.1. The system SHALL respond to user input within 200ms
7.2. The system SHALL work on standard mobile browsers
7.3. The system SHALL function with limited network connectivity
7.4. The system SHALL be accessible via a simple URL
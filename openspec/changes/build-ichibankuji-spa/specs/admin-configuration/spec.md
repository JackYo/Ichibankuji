# Specification: Admin Configuration Panel

## Overview

The admin panel provides password-protected access to configure prize pools. Admin can add, edit, and delete prizes, then apply changes that take effect on the next round.

## Requirements

### 1. Password-Protected Access
- **ADDED**: Require password to access admin panel
- **WHEN** user navigates to /admin
- **THEN** show password input form if not authenticated
- **AND** require correct password before granting access
- **AND** validate against hardcoded admin password

### 2. Admin Authentication State
- **ADDED**: Maintain session authentication in-memory
- **WHEN** user enters correct password
- **THEN** set session flag to authenticated
- **AND** session persists during page lifetime
- **AND** session cleared on browser close (not localStorage)

### 3. Prize Configuration Editor
- **ADDED**: Allow adding, editing, and deleting prizes
- **WHEN** admin is authenticated
- **THEN** show form with rows for each prize (name, quantity)
- **AND** allow adding new prize rows
- **AND** allow editing existing prize names and quantities
- **AND** allow deleting prize rows

### 4. Configuration Validation
- **ADDED**: Validate prize configuration before applying
- **WHEN** admin clicks "Apply Changes"
- **THEN** validate all prizes have names
- **AND** validate all quantities are positive integers
- **AND** show error messages for invalid entries
- **AND** prevent apply if validation fails

### 5. Apply Changes
- **ADDED**: Save new configuration to localStorage for next round
- **WHEN** valid configuration submitted via "Apply Changes" button
- **THEN** store configuration in localStorage
- **AND** show confirmation message
- **AND** note that changes apply only to next round, not current

### 6. Admin Logout
- **ADDED**: Ability to exit admin mode and return to game
- **WHEN** admin clicks logout/back button
- **THEN** clear authentication state
- **AND** navigate to /game route
- **AND** require password re-entry if returning to /admin

## Implementation Notes

- Admin password: hardcoded in frontend (documented as config change point)
- Session state stored in React component state, not localStorage (doesn't survive reload)
- Configuration changes apply to next round only (current round quantities unchanged)
- Provide sensible defaults or load current configuration for editing

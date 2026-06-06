# Proposal: Ichibankuji Lottery Simulation Web App

## Why This Project?

Deploy a lottery simulation (一番賞) web application on GitHub Pages. The project provides an interactive gaming experience where users can:
- Draw prizes from a configured pool
- View draw history
- Reset rounds with confirmation
- Administrators can configure prizes via a hidden admin panel

The main constraint is working within GitHub Pages' static-only hosting model while providing admin configuration capabilities.

## What Changes

1. **New Prize Drawing Mechanism** - Implement weighted random selection from configured prizes
2. **Game State Persistence** - Store game state in browser localStorage without backend
3. **Admin Configuration Panel** - Hidden /admin route for configuring prizes before game starts
4. **Round Reset Capability** - "New Round" button with confirmation for safe data clearing

## Capabilities

1. **Interactive Prize Draw** - Users click "Draw" button to randomly select prizes from configured pool, with quantities auto-decrementing
2. **Draw History Tracking** - All draws in current round stored with timestamps and displayed in history panel
3. **Admin Configuration** - Hidden admin panel at /admin with password protection to configure new prize configurations
4. **Round Management** - "New Round" button with confirmation dialog clears current game state and loads new configuration if available

## Schema

spec-driven change workflow

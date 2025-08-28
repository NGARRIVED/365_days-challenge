# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

This is a **365 Days Challenge** repository - a personal coding challenge project where daily programming exercises, projects, or learning activities are documented and implemented. The repository follows a day-based organization structure.

## Repository Structure

- **DayN/**: Each day's challenge is contained in its own directory (Day1/, Day2/, etc.)
- Each day directory typically contains:
  - `readme.md`: Description of the day's challenge, goals, or learnings
  - Implementation files (varies by language/technology used)
  - Any supporting assets or documentation

## Common Development Commands

### Repository Management
```bash
# Clone the repository
git clone https://github.com/NGARRIVED/365_days-challenge.git

# Check current status
git status

# Add and commit daily work
git add .
git commit -m "Day N: [Brief description of challenge/project]"
git push origin main
```

### Daily Workflow
```bash
# Create new day directory
mkdir "Day$(Get-Date -Format 'yyyy-MM-dd')"  # PowerShell
mkdir "Day$(date +%Y-%m-%d)"                 # Bash/Zsh

# Navigate to current day
cd Day1  # or appropriate day number

# Create initial readme for the day
echo "# Day N Challenge" > readme.md
```

## Development Guidelines

### Commit Message Convention
Follow the pattern: `Day N: [Brief description]`
Examples:
- `Day 1: Hello World in Python`
- `Day 15: Binary Search Tree implementation`
- `Day 50: REST API with Express.js`

### Day Directory Organization
Each day should be self-contained with:
1. Clear documentation of the challenge/goal
2. Source code with meaningful file names
3. Comments explaining key concepts or approaches
4. Any test files or example inputs/outputs

### Language and Technology Flexibility
This repository supports multiple programming languages and technologies. Each day can use different tools based on:
- Learning objectives
- Challenge requirements  
- Personal interest areas

## Repository Context

- **License**: MIT License
- **Owner**: NGARRIVED
- **Remote**: https://github.com/NGARRIVED/365_days-challenge.git
- **Purpose**: Personal skill development through daily coding practice

## Getting Started with a New Day

1. Create new day directory: `mkdir DayN`
2. Navigate to directory: `cd DayN` 
3. Create readme.md documenting the day's objective
4. Implement the solution/project
5. Test and verify the implementation
6. Document any learnings or insights
7. Commit with descriptive message
8. Push to remote repository

This structure allows for consistent organization while maintaining flexibility for different types of daily challenges, from algorithm implementations to full project builds.

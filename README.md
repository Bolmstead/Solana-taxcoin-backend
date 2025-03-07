# Pwease-Gwitch

A Node.js Express application with MongoDB integration for managing snapshots and rewards.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/pwease-gwitch
   ```

## Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Snapshots

- `POST /api/snapshots` - Create a new snapshot
- `GET /api/snapshots` - Get all snapshots
- `GET /api/snapshots/:id` - Get a specific snapshot
- `PUT /api/snapshots/:id` - Update a snapshot
- `DELETE /api/snapshots/:id` - Delete a snapshot

### Rewards

- `POST /api/rewards` - Create a new reward
- `GET /api/rewards` - Get all rewards
- `GET /api/rewards/:id` - Get a specific reward
- `PUT /api/rewards/:id` - Update a reward
- `DELETE /api/rewards/:id` - Delete a reward

## Project Structure

```
src/
├── app.js              # Main application file
├── controllers/        # Route controllers
├── models/            # Mongoose models
├── routes/            # Express routes
└── helpers/           # Utility functions
```

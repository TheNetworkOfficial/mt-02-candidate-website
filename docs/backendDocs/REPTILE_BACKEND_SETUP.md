# Reptile Universe Backend Setup Guide

This guide explains how to configure the backend for a reptile adoption website based on the current project template. It covers the required database structures and outlines how PostgreSQL, MongoDB, and Redis work together.

## Overview

- **PostgreSQL**: Stores persistent relational data such as user accounts and reptile records.
- **MongoDB**: Stores flexible documents like reptile care sheets, scanned adoption contracts, and any rich text that doesn't fit well in a relational table.
- **Redis**: Handles sessions and caching for fast lookups (e.g., storing recent reptile listings).

All examples in this document use a new database name `reptile_universe` so the data does not collide with any previous projects.

## 1. PostgreSQL

### 1.1 Database Creation

Create a new PostgreSQL database and user:

```sql
CREATE DATABASE reptile_universe_dev;
CREATE USER reptile_user WITH ENCRYPTED PASSWORD 'yourPassword';
GRANT ALL PRIVILEGES ON DATABASE reptile_universe_dev TO reptile_user;
```

Update your `.env` file so the backend connects to this database:

```env
DB_NAME_DEV=reptile_universe_dev
DB_USERNAME=reptile_user
DB_PASSWORD=yourPassword
DB_HOST=localhost
DB_DIALECT=postgres
```

### 1.2 Tables

Based on `frontend/src/pages/details/details.html`, the main reptile fields include:

- `name`
- `species`
- `age`
- `location`
- `sex`
- `traits` (e.g., "Playful")
- `bio`
- `requirements`

Create the following tables:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reptiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(100) NOT NULL,
  age VARCHAR(50),
  location VARCHAR(100),
  sex VARCHAR(20),
  traits VARCHAR(100),
  bio TEXT,
  requirements TEXT,
  status VARCHAR(20) DEFAULT 'adoptable',
  owner_id INT REFERENCES users(id),
  image_urls TEXT[],
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE adoptions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  reptile_id INT REFERENCES reptiles(id),
  adopted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paperwork_id TEXT,
  UNIQUE(user_id, reptile_id)
);
```

The `paperwork_id` field links to MongoDB documents (see below).

## 2. MongoDB

MongoDB stores adoption documents such as signed PDF files or digital care sheets.

1. Create a new database named `reptile_universe_docs`.
2. Within this database create a `paperwork` collection to hold each adoption's paperwork.
   Example document structure:

```json
{
  "_id": ObjectId(),
  "reptileId": 1,
  "userId": 5,
  "files": [
    {
      "name": "adoption_agreement.pdf",
      "url": "https://example.com/docs/adoption_agreement.pdf"
    }
  ],
  "signedOn": ISODate()
}
```

Store the MongoDB document's ObjectId in the PostgreSQL `adoptions.paperwork_id` column to link the two systems.

## 3. Redis

Use Redis for caching and session storage.

- Set `REDIS_URL=redis://localhost:6379` in your `.env` file.
- Configure session middleware in `backend/src/server.js` (already present) to use Redis if desired. Example using `connect-redis`:

```javascript
const RedisStore = require("connect-redis").default;
const redisClient = require("../config/redis");
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
```

## 4. Updating the Backend Models

Create Sequelize models for the new tables. Example for `reptiles`:

```javascript
// backend/src/models/reptile.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Reptile = sequelize.define("Reptile", {
  name: DataTypes.STRING,
  species: DataTypes.STRING,
  age: DataTypes.STRING,
  location: DataTypes.STRING,
  sex: DataTypes.STRING,
  traits: DataTypes.STRING,
  bio: DataTypes.TEXT,
  requirements: DataTypes.TEXT,
  image_urls: DataTypes.ARRAY(DataTypes.TEXT),
});

module.exports = Reptile;
```

Repeat for `User` and `Adoption`. Ensure associations:

```javascript
User.hasMany(Adoption);
Reptile.hasMany(Adoption);
Adoption.belongsTo(User);
Adoption.belongsTo(Reptile);
```

Run migrations or `sequelize.sync()` during development to create the tables.

## 5. Example Workflow

1. User registers (entry in `users` table).
2. Admin creates a reptile listing (entry in `reptiles` table) with data like name, species, age, and bio.
3. When a user adopts a reptile, save the signed paperwork in MongoDB and create an entry in `adoptions` linking the user to the reptile.
4. Store frequently accessed data like the most recent reptile listings in Redis for quick retrieval.

With this setup, the reptile adoption site will have persistent data in PostgreSQL, flexible document storage in MongoDB, and fast session handling via Redis.
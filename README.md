# NNPTUD-C2-week5

**Student**: Thach Trong Khang - 2280601427

## Project Description

REST API for User, Role, and Category management with MongoDB.

## Features

- ✅ CRUD operations for User, Role, and Category
- ✅ Soft delete functionality (isDeleted flag)
- ✅ User enable/disable features
- ✅ MongoDB integration with Mongoose
- ✅ Input validation and error handling
- ✅ Pagination support

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- bcryptjs (for password hashing)

## Installation

```bash
npm install
```

## Configuration

Update database connection in `utils/config.js`:
```javascript
mongodb://localhost:27017/DbBaitapweek5
```

## Run

```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Roles
- `POST /api/v1/roles` - Create role
- `GET /api/v1/roles` - Get all roles
- `GET /api/v1/roles/:id` - Get role by ID
- `PUT /api/v1/roles/:id` - Update role
- `DELETE /api/v1/roles/:id` - Soft delete role

### Users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Soft delete user
- `POST /api/v1/users/enable` - Enable user account (status → true)
- `POST /api/v1/users/disable` - Disable user account (status → false)

### Categories
- `POST /api/v1/categories` - Create category
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get category by ID
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Soft delete category

## Data Models

### User
- username (string, unique, required)
- password (string, required)
- email (string, unique, required)
- fullName (string, default: "")
- avatarUrl (string, default: "https://i.sstatic.net/l60Hf.png")
- status (boolean, default: false)
- role (ObjectID ref to Role)
- loginCount (number, default: 0, min: 0)
- isDeleted (boolean, default: false)
- timestamps (createdAt, updatedAt)

### Role
- name (string, unique, required)
- description (string, default: "")
- isDeleted (boolean, default: false)
- timestamps (createdAt, updatedAt)

### Category
- name (string, unique, required)
- description (string, default: "")
- isDeleted (boolean, default: false)
- timestamps (createdAt, updatedAt)

## Author

Thach Trong Khang - 2280601427


# Role-Based Backend API

Node.js + Express + MongoDB + Socket.IO backend with:
- Role-based auth (Admin / User) with JWT
- Admin multi-session management
- Post creation with Pending → Approved / Rejected workflow
- Paginated endpoints (limit + offset)
- Real-time chat via Socket.IO

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP port | `5000` |
| `MONGO_URI` | MongoDB connection string | — |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `MAX_ADMIN_SESSIONS` | Max concurrent admin sessions | `5` |
| `CLIENT_URL` | CORS origin | `http://localhost:3000` |

---

## API Reference

### Auth  `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | ✗ | Register a new user |
| POST | `/login` | ✗ | Login (returns JWT) |
| GET | `/me` | ✓ | Get current user profile |
| POST | `/logout` | ✓ | Logout current session |
| POST | `/logout-all` | Admin | Revoke all admin sessions |
| GET | `/sessions` | Admin | List active admin sessions |
| DELETE | `/sessions/:id` | Admin | Revoke a specific session |

### Posts  `/api/posts`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | User | Create a post (status = pending) |
| GET | `/mine` | User | List my posts (filter by `?status=`) |
| GET | `/:id` | User | Get one post (own only) |
| PATCH | `/:id` | User | Edit post (only while pending) |
| DELETE | `/:id` | User | Delete post |

### Admin  `/api/admin`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Dashboard counts |
| GET | `/users` | Admin | List all users |
| POST | `/users` | Admin | Create user/admin |
| GET | `/users/:id` | Admin | Get user by ID |
| PATCH | `/users/:id/status` | Admin | Toggle user active status |
| GET | `/posts` | Admin | All posts (filter by `?status=`) |
| PATCH | `/posts/:id/review` | Admin | Approve or reject a post |

### Chat  `/api/chat`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/conversations` | ✓ | Start/get a DM conversation |
| GET | `/conversations` | ✓ | List my conversations |
| GET | `/conversations/:id/messages` | ✓ | Paginated messages |
| POST | `/conversations/:id/messages` | ✓ | Send a message (REST fallback) |
| DELETE | `/messages/:id` | ✓ | Soft-delete a message |

---

## Pagination

All list endpoints accept:

```
GET /api/posts/mine?page=1&limit=10
GET /api/admin/posts?status=pending&page=2&limit=20
```

Response envelope:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "totalPages": 10,
    "currentPage": 2,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

---

## Socket.IO Events

**Client → Server**

| Event | Payload | Description |
|---|---|---|
| `conversation:join` | `conversationId` | Join a chat room |
| `conversation:leave` | `conversationId` | Leave a chat room |
| `message:send` | `{ conversationId, content }` | Send a message |
| `typing:start` | `{ conversationId }` | User started typing |
| `typing:stop` | `{ conversationId }` | User stopped typing |
| `message:read` | `{ conversationId }` | Mark messages as read |
| `user:status` | `{ userIds: [...] }` | Check who is online |

**Server → Client**

| Event | Payload | Description |
|---|---|---|
| `message:new` | `{ message }` | New message in conversation |
| `conversation:updated` | preview data | Conversation list update |
| `typing:start` | `{ conversationId, user }` | Someone is typing |
| `typing:stop` | `{ conversationId, userId }` | Stopped typing |
| `message:read` | `{ conversationId, readBy }` | Read receipt |
| `user:online` | `{ userId }` | User came online |
| `user:offline` | `{ userId }` | User went offline |

**Authentication**
```js
const socket = io("http://localhost:5000", {
  auth: { token: "Bearer <JWT>" }
});
```

---

## Admin Multi-Session

Admins can have up to `MAX_ADMIN_SESSIONS` (default 5) concurrent sessions across different devices. Each session stores the token, device user-agent, IP, and expiry. The oldest session is automatically evicted when the cap is hit.

---

## Security Features

- Helmet HTTP headers
- CORS with origin whitelist
- Rate limiting (global + stricter on /auth)
- MongoDB injection sanitization (express-mongo-sanitize)
- bcrypt password hashing (12 rounds)
- JWT stored only in Authorization header (no cookies)
- Admin session token validation on every request
- Graceful shutdown on SIGTERM/SIGINT

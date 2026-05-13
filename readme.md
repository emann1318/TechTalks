# TechTalks Platform

A modern, community-driven platform for sharing technical tutorials, product reviews, and engineering insights. Built with React, Node.js, Express, and MongoDB.

## Features

- **Share Technical Content**: Publish tutorials, reviews, case studies, and technical opinions
- **Interactive Community**: Follow authors, rate posts, and engage in discussions via comments
- **Search & Filtering**: Discover content by category, difficulty level, tags, and keywords
- **User Profiles**: Customize your profile with avatar, bio, and track your published posts
- **Authentication**: Secure token-based JWT authentication with session persistence
- **Admin Panel**: Manage users, posts, and platform settings (admin-only)
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Live notification support and interactive feed for followers

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web server framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **CORS** - Cross-origin resource sharing

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Setup Steps

1. **Clone or download the project**
   ```bash
   cd techtalks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the root directory
   - Add the following variables:
   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/techtalks
   JWT_SECRET=your_secret_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
techtalks/
├── src/
│   ├── components/
│   │   ├── blog/
│   │   │   ├── Editor.jsx         # Post editor component
│   │   │   └── PostCard.jsx       # Post card display
│   │   └── layout/
│   │       └── Navbar.jsx         # Navigation bar
│   ├── context/
│   │   └── AuthContext.jsx        # Authentication state management
│   ├── pages/
│   │   ├── Admin.jsx              # Admin dashboard
│   │   ├── BlogDetail.jsx         # Single post view
│   │   ├── CreatePost.jsx         # Post creation
│   │   ├── EditPost.jsx           # Post editing
│   │   ├── Feed.jsx               # Personalized feed
│   │   ├── Home.jsx               # Explore posts
│   │   ├── Login.jsx              # Login page (hero layout)
│   │   ├── Notifications.jsx      # User notifications
│   │   ├── Profile.jsx            # User profile
│   │   └── Register.jsx           # User registration
│   ├── server/
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── Comment.js         # Comment schema
│   │   │   ├── Notification.js    # Notification schema
│   │   │   ├── Post.js            # Post schema
│   │   │   └── User.js            # User schema
│   │   ├── routes/
│   │   │   ├── admin.js           # Admin endpoints
│   │   │   ├── auth.js            # Authentication endpoints
│   │   │   ├── blog.js            # Blog/post endpoints
│   │   │   └── interaction.js     # User interaction endpoints
│   │   └── seed.js                # Database seeding script
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles
├── server.js                      # Express server entry point
├── package.json                   # Dependencies and scripts
├── vite.config.js                 # Vite configuration
├── index.html                     # HTML template
├── TechTalks_API.postman_collection.json    # Postman collection for API testing
└── TechTalks_Dev.postman_environment.json   # Postman environment variables
```

## 📮 Postman Collection

A complete Postman collection is included for testing all API endpoints. 

**Quick Setup:**
1. Open Postman
2. Click **Import** → Select `TechTalks_API.postman_collection.json`
3. Click **Import** → Select `TechTalks_Dev.postman_environment.json`
4. From the top-right dropdown, select **TechTalks - Development** environment
5. All requests are pre-configured with the base URL and authentication headers

**Pre-configured test credentials in environment:**
- Admin: `admin@techtalks.io` / `admin123`
- User: `user@techtalks.io` / `user123`

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Login to existing account
- `GET /api/auth/profile` - Get authenticated user profile
- `PUT /api/auth/profile` - Update user profile

### Blog/Posts
- `GET /api/blogs` - List all posts with filtering and pagination
- `POST /api/blogs` - Create a new post (authenticated)
- `GET /api/blogs/:id` - Get a single post
- `PUT /api/blogs/:id` - Update a post (authenticated)
- `DELETE /api/blogs/:id` - Delete a post (any authenticated user)
- `POST /api/blogs/:id/rate` - Rate a post
- `POST /api/blogs/:id/comments` - Add a comment
- `GET /api/blogs/:id/comments` - Get post comments

### Interactions
- `POST /api/interactions/follow/:userId` - Follow a user
- `GET /api/interactions/feed` - Get personalized feed

### Admin
- `GET /api/admin/users` - List all users (admin-only)
- `DELETE /api/admin/users/:id` - Delete a user (admin-only)
- `GET /api/admin/posts` - List all posts (admin-only)
- `DELETE /api/admin/posts/:id` - Delete a post (admin-only)

## Default Test Accounts

After seeding the database, you can login with:

- **Admin Account**
  - Email: `admin@techtalks.io`
  - Password: `admin123`

- **User Account**
  - Email: `user@techtalks.io`
  - Password: `user123`

## Key Features Breakdown

### Login & Registration
- Hero-style login page with interactive feature cards
- Secure token-based authentication
- Session persistence with localStorage

### Post Management
- Create, edit, and delete posts with rich content support
- Support for code blocks with syntax highlighting
- Tag management and category filtering
- Rating and comment system

### User Interactions
- Follow/unfollow authors
- Personalized feed based on followed users
- Real-time notification system
- User profile customization

### Admin Controls
- Manage users (enable/disable accounts)
- Moderate posts and comments
- View platform statistics

### Search & Discovery
- Full-text search across posts
- Filter by category, difficulty level, and date range
- Sort by newest, oldest, highest rated, or most commented

## Security Features

- JWT token-based authentication with 7-day expiration
- Password hashing using bcrypt
- Protected routes for authenticated and admin users
- CORS enabled for secure cross-origin requests
- Input validation on all endpoints

## Deployment

### Build for Production
```bash
npm run build
```

### Environment for Production
```
NODE_ENV=production
DATABASE_URL=your_production_mongodb_url
JWT_SECRET=your_strong_secret_key
```

## 📝 Notes

- **Delete Post**: Any authenticated user can delete any post (design choice for moderation flexibility)
- **Search Bar**: Hidden on login/register pages for cleaner UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Code Highlighting**: Supports 20+ programming languages

## Contributing

Feel free to fork, modify, and extend this platform for your use case.

## License

This project is provided as-is for educational and commercial use.

---

**TechTalks** - Built for engineers who love sharing knowledge. 

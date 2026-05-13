import User from './models/User.js';
import Post from './models/Post.js';

const samplePosts = [
  {
    title: "Mastering React 19: The Complete Guide to Server Actions",
    body: "React 19 is here with game-changing features. In this talk, we explore how Server Actions simplify data fetching.\n\n```javascript\n'use server';\n\nexport async function updateAction(formData) {\n  const name = formData.get('name');\n  return { success: true };\n}\n```\nServer actions reduce boilerplate significantly.",
    category: "Tutorial", difficulty: "Intermediate", tags: ["react", "frontend", "nextjs"],
  },
  {
    title: "Why Rust is the Future of Infrastructure Tooling",
    body: "From Turbopack to Bun, every modern tool is moving to Rust.\n\n```rust\nfn main() {\n    println!(\"Hello, TechTalks!\");\n}\n```",
    category: "Opinion", difficulty: "Advanced", tags: ["rust", "systems", "performance"],
  },
  {
    title: "Introduction to MongoDB Aggregation Pipelines",
    body: "Stop calculating business logic in your app. Move it to the database.\n\n```javascript\ndb.orders.aggregate([\n  { $match: { status: 'completed' } },\n  { $group: { _id: '$userId', total: { $sum: '$amount' } } }\n]);\n```",
    category: "Tutorial", difficulty: "Beginner", tags: ["mongodb", "database", "backend"],
  },
  {
    title: "Case Study: Scaling a Fintech App to 10M Concurrent Users",
    body: "How we used Redis and specialized indexing patterns to prevent race conditions during heavy traffic.",
    category: "Case Study", difficulty: "Advanced", tags: ["scaling", "fintech", "architecture"],
  },
  {
    title: "The Rise of AI-Driven Code Review: Myth vs Reality",
    body: "Can LLMs really understand your codebase context? We review the top 5 tools in 2024.",
    category: "Review", difficulty: "Beginner", tags: ["ai", "tooling", "productivity"],
  },
  {
    title: "Micro-Frontends: Why We Are Moving Away from Monoliths",
    body: "A deep dive into Module Federation and why it solved our organizational friction issues.",
    category: "News", difficulty: "Intermediate", tags: ["frontend", "microservices"],
  },
  {
    title: "Advanced TypeScript: Inferring Complex Generic Types",
    body: "A guide on using 'infer' and conditional types.\n\n```typescript\ntype ReturnType<T> = T extends (...args: any) => infer R ? R : any;\n```",
    category: "Tutorial", difficulty: "Advanced", tags: ["typescript", "javascript"],
  },
  {
    title: "Review: The New MacBook M3 for Software Developers",
    body: "Is 16GB really enough for Docker and local LLMs? Let's benchmark.",
    category: "Review", difficulty: "Intermediate", tags: ["hardware", "productivity"],
  },
  {
    title: "Understanding CSS Grid in 10 Minutes",
    body: "The most powerful layout system ever created.\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}\n```",
    category: "Tutorial", difficulty: "Beginner", tags: ["css", "frontend"],
  },
  {
    title: "Cybersecurity Tips for Modern Web Developers",
    body: "OWASP Top 10 has changed. Here is how to prevent XSS and SQL injection in 2024.",
    category: "Tutorial", difficulty: "Intermediate", tags: ["security", "backend"],
  },
];

const linkFollow = async (follower, followee) => {
  const f = await User.findById(follower._id);
  const t = await User.findById(followee._id);
  if (!f || !t) return;
  const already = f.following.some((id) => id.toString() === t._id.toString());
  if (already) return;
  f.following.push(t._id);
  if (!t.followers.some((id) => id.toString() === f._id.toString())) {
    t.followers.push(f._id);
  }
  await f.save();
  await t.save();
};

/** Ensures seeded demo accounts follow each other (fixes existing DBs where users exist but graph was empty). */
export const ensureSeedSocialGraph = async () => {
  const admin = await User.findOne({ username: 'admin' });
  const enthusiast = await User.findOne({ username: 'tech_enthusiast' });
  if (!admin || !enthusiast) return;
  await linkFollow(enthusiast, admin);
  await linkFollow(admin, enthusiast);

  const enthusiastPosts = await Post.countDocuments({ author: enthusiast._id });
  const adminOnlyLegacy = enthusiastPosts === 0 && (await Post.countDocuments({ author: admin._id })) > 0;
  if (adminOnlyLegacy) {
    const posts = await Post.find({ author: admin._id }).sort({ createdAt: 1 });
    for (let i = 1; i < posts.length; i += 2) {
      posts[i].author = enthusiast._id;
      await posts[i].save();
    }
  }
};

export const seedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial data...');

      const admin = new User({
        username: 'admin',
        email: 'admin@techtalks.com',
        password: 'adminpassword123',
        role: 'admin',
        bio: 'Official TechTalks Administrator.',
      });
      await admin.save();

      const user = new User({
        username: 'tech_enthusiast',
        email: 'user@example.com',
        password: 'userpassword123',
        bio: 'Passionate about new tech and clean code.',
      });
      await user.save();

      await linkFollow(user, admin);
      await linkFollow(admin, user);

      for (let i = 0; i < samplePosts.length; i++) {
        const p = samplePosts[i];
        const authorId = i % 2 === 0 ? admin._id : user._id;
        const post = new Post({ ...p, author: authorId });
        await post.save();
        const raterId = authorId.equals(admin._id) ? user._id : admin._id;
        post.ratings.push({
          user: raterId,
          score: Math.floor(Math.random() * 2) + 4,
        });
        await post.save();
      }

      console.log('Seed successful! 2 users + 10 posts created (split authors, mutual follows).');
    }
    await ensureSeedSocialGraph();
  } catch (error) {
    console.error('Seed error:', error);
  }
};

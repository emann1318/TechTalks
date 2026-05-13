import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, min: 1, max: 5 }
  }],
  averageRating: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
}, { timestamps: true });

postSchema.index({ title: 'text', body: 'text', tags: 'text' });

postSchema.pre('save', async function () {
  if (this.ratings && this.ratings.length > 0) {
    this.averageRating =
      this.ratings.reduce((acc, curr) => acc + curr.score, 0) / this.ratings.length;
  } else {
    this.averageRating = 0;
  }
});

export default mongoose.model('Post', postSchema);
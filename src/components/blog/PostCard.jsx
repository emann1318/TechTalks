import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Star, Tag, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

const authorIdFromPost = (post) => {
  const a = post?.author;
  if (a == null) return '';
  if (typeof a === 'object' && a._id != null) return a._id.toString();
  return String(a);
};

const PostCard = ({ post, onDeleted }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  if (!post) return null;

  const authorId = authorIdFromPost(post);
  const userId = user?._id != null ? String(user._id) : '';
  const isOwner = Boolean(user && authorId && userId && authorId === userId);
  const canDelete = Boolean(user);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this post? It will be removed for everyone.')) return;
    try {
      await axios.delete(`/api/blogs/${post._id}`);
      onDeleted?.(post._id);
      if (!onDeleted) navigate('/');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Could not delete this post.');
    }
  };

  const difficultyColors = {
    Beginner: 'bg-green-100 text-green-700 border-green-200',
    Intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Advanced: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-all duration-300"
    >
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${difficultyColors[post.difficulty] || 'bg-gray-100 text-gray-700'}`}>
            {post.difficulty}
          </span>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            {post.category}
          </span>
        </div>

        <Link to={`/blog/${post._id}`} className="group">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">
          {post.body?.replace(/[#*`]/g, '')}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags?.slice(0, 3).map((tag, i) => (
            <span key={i} className="flex items-center text-[10px] font-mono bg-gray-50 text-gray-500 px-2 py-1 rounded">
              <Tag className="h-3 w-3 mr-1" /> {tag}
            </span>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-50 mt-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={post.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author?.username}`}
                className="h-8 w-8 rounded-full bg-gray-100 ring-2 ring-white shrink-0"
                alt={post.author?.username || 'Author'}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-gray-900 truncate">{post.author?.username || 'Anonymous'}</span>
                <span className="text-[10px] text-gray-400">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center space-x-3 text-gray-400">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-medium text-gray-600">{(post.averageRating ?? 0).toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs font-medium text-gray-600">{post.commentCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(isOwner || canDelete) && (
          <div
            className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {isOwner && (
              <Link
                to={`/edit/${post._id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                <Pencil className="h-4 w-4" />
                Edit post
              </Link>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-red-700 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete post
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PostCard;

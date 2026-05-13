import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  MessageSquare,
  Trash2,
  Edit,
  UserPlus,
  UserMinus,
  Share2,
  Tag,
  Loader2,
  Send,
  Zap,
  X,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'motion/react';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [rating, setRating] = useState(0);

  const [showPublishedBanner, setShowPublishedBanner] = useState(false);

  useEffect(() => {
    setShowPublishedBanner(false);
    fetchPost();
    fetchComments();
    fetchRecommendations();
  }, [id]);

  useEffect(() => {
    if (!post || !user) return;
    const uid = user._id?.toString?.();
    if (!uid) return;
    const userRating = post.ratings?.find((r) => {
      const ru = r.user?._id ?? r.user;
      return ru?.toString?.() === uid;
    });
    setRating(userRating ? userRating.score : 0);
  }, [post, user]);

  useEffect(() => {
    if (!post || !user) return;
    const aid = post?.author?._id?.toString?.();
    const uid = user?._id?.toString?.();
    if (!aid || !uid || aid !== uid) return;
    const key = `postJustPublished:${id}`;
    if (sessionStorage.getItem(key)) {
      setShowPublishedBanner(true);
      sessionStorage.removeItem(key);
    }
  }, [post, user, id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/blogs/${id}`);
      setPost(data);
    } catch (error) {
      console.error(error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await axios.get(`/api/blogs/${id}/comments`);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setComments([]);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data } = await axios.get(`/api/blogs/${id}/recommendations`);
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setRecommendations([]);
    }
  };

  const handleRate = async (score) => {
    if (!user) return navigate('/login');
    try {
      await axios.post(`/api/blogs/${id}/rate`, { score });
      setRating(score);
      fetchPost();
    } catch (error) {
      console.error(error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      await axios.post(`/api/blogs/${id}/comments`, { content: newComment });
      setNewComment('');
      fetchComments();
      fetchPost();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this talk?')) {
      try {
        await axios.delete(`/api/blogs/${id}`);
        setShowPublishedBanner(false);
        navigate('/');
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || 'Could not delete this talk.');
      }
    }
  };

  const handleFollow = async () => {
    if (!user) return navigate('/login');
    const authorId = post?.author?._id;
    if (!authorId) return;
    try {
      await axios.post(`/api/interactions/follow/${authorId}`);
      fetchPost();
    } catch (error) {
      console.error(error);
    }
  };

  const normalizeHighlighterLanguage = (raw) => {
    const lang = (raw || 'javascript').toLowerCase().trim();
    const map = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      sh: 'bash',
      yml: 'yaml',
      md: 'markdown',
      rs: 'rust',
    };
    const resolved = map[lang] || lang;
    const supported = new Set([
      'javascript', 'typescript', 'jsx', 'tsx', 'rust', 'css', 'html', 'json', 'bash', 'shell',
      'python', 'java', 'c', 'cpp', 'go', 'markdown', 'yaml', 'sql', 'xml', 'diff', 'docker',
    ]);
    return supported.has(resolved) ? resolved : 'javascript';
  };

  const renderContent = (content) => {
    if (!content) return null;
    const parts = content.split('```');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const lines = part.split('\n');
        const rawLang = lines[0].trim() || 'javascript';
        const language = normalizeHighlighterLanguage(rawLang);
        const code = lines.slice(1).join('\n');
        return (
          <div key={index} className="my-8 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-100/50">
            <div className="bg-[#282a36] text-gray-400 px-6 py-2 flex justify-between items-center text-xs font-mono border-b border-white/5">
              <span>{rawLang.toUpperCase()}</span>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <SyntaxHighlighter language={language} style={dracula} customStyle={{ padding: '2rem', margin: 0, fontSize: '0.9rem' }}>
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }
      return <div key={index} className="whitespace-pre-wrap py-2 text-gray-800 leading-relaxed font-sans">{part}</div>;
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
    </div>
  );

  if (!post) return null;

  const authorId = post?.author?._id?.toString?.();
  const userId = user?._id?.toString?.();
  const isOwner = Boolean(user && authorId && userId && authorId === userId);
  const canDelete = Boolean(user);
  const isFollowing =
    Boolean(userId) &&
    Array.isArray(post?.author?.followers) &&
    post.author.followers.some((fid) => fid?.toString?.() === userId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
      {isOwner && showPublishedBanner && (
        <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-bold text-emerald-900">Your talk is live</p>
            <p className="text-sm text-emerald-800 mt-1">
              It appears on Explore with the newest posts. You can edit it anytime or remove it below.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-red-200 text-red-700 font-bold text-sm hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete this talk
            </button>
            <Link
              to={`/edit/${post._id}`}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors"
            >
              Edit talk
            </Link>
            <button
              type="button"
              onClick={() => setShowPublishedBanner(false)}
              className="p-2 rounded-xl text-emerald-800 hover:bg-emerald-100/80"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Main Content */}
        <div className="lg:col-span-8">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100 mb-12"
          >
            <header className="mb-10">
              <div className="flex items-center space-x-2 text-indigo-600 mb-6 font-bold text-xs uppercase tracking-widest">
                <span>{post.category}</span>
                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                <span>{post.difficulty}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] mb-8">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-gray-50 text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  {isOwner ? (
                    <Link to="/profile" className="flex items-center space-x-3 group">
                      <img
                        src={post?.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post?.author?.username}`}
                        className="h-12 w-12 rounded-2xl bg-gray-100 ring-4 ring-indigo-50 group-hover:scale-105 transition-transform"
                        alt={post?.author?.username}
                      />
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{post?.author?.username}</p>
                        <p className="text-xs">{new Date(post?.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <img
                        src={post?.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post?.author?.username}`}
                        className="h-12 w-12 rounded-2xl bg-gray-100 ring-4 ring-indigo-50"
                        alt={post?.author?.username}
                      />
                      <div>
                        <p className="font-bold text-gray-900">{post?.author?.username}</p>
                        <p className="text-xs">{new Date(post?.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {(isOwner || canDelete) && (
                    <div className="flex items-center space-x-2">
                      {isOwner && (
                        <Link to={`/edit/${post._id}`} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 rounded-xl">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Link>
                      )}
                      <button type="button" onClick={handleDelete} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 rounded-xl">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                  <button className="p-3 text-indigo-600 bg-indigo-50 rounded-xl flex items-center space-x-2 hover:bg-indigo-100 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </header>

            <div className="prose prose-indigo max-w-none mb-12 tech-content text-lg">
              {renderContent(post?.body || '')}
            </div>

            <div className="flex flex-wrap gap-2 pt-10 border-t border-gray-50">
              {post?.tags?.map((tag, i) => (
                <span key={i} className="flex items-center text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full">
                  <Tag className="h-3 w-3 mr-1.5" /> {tag}
                </span>
              ))}
            </div>
          </motion.article>

          {/* Social / Rating Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
                   <Star className="h-5 w-5 text-amber-400 fill-amber-400 mr-2" />
                   Rate this Talk
                </h3>
                <p className="text-sm text-gray-500">Help others find the best technical content.</p>
              </div>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleRate(s)}
                    className={`p-3 rounded-2xl transition-all duration-200 ${
                      rating >= s ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <Star className={`h-6 w-6 ${rating >= s ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center">
              <MessageSquare className="h-6 w-6 mr-3 text-indigo-600" />
              Community Discussion ({post?.commentCount || 0})
            </h2>

            <form onSubmit={handleComment} className="mb-10 group">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="What's your take on this?"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-300 min-h-30 resize-none"
                ></textarea>
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="absolute bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
                >
                  {submittingComment ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            </form>

            <div className="space-y-6">
              {Array.isArray(comments) && comments.map((comment) => (
                <div key={comment?._id} className="flex space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                  <img src={comment?.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment?.author?.username}`} className="h-10 w-10 rounded-xl bg-gray-100 shrink-0" alt="" />
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-gray-900 text-sm">{comment?.author?.username}</span>
                      <span className="text-[10px] text-gray-400">• {comment?.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Just now'}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{comment?.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-12">
          {/* Author Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">About the Author</h3>
            <div className="text-center">
              <img 
                src={post?.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post?.author?.username}`} 
                className="h-24 w-24 rounded-4xl mx-auto bg-indigo-50 p-1 ring-8 ring-indigo-50/50 mb-6" 
                alt="" 
              />
              <h4 className="text-2xl font-black text-gray-900 mb-2">{post?.author?.username}</h4>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 px-4">
                {post?.author?.bio || 'Technical content creator and software enthusiast. Sharing insights from the world of tech.'}
              </p>
              
              {!isOwner && (
                <button
                  onClick={handleFollow}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg ${
                    isFollowing 
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-gray-100' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                  }`}
                >
                  {isFollowing ? <><UserMinus className="h-5 w-5" /> <span>Following</span></> : <><UserPlus className="h-5 w-5" /> <span>Follow Author</span></>}
                </button>
              )}

              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50">
                <div>
                  <p className="text-2xl font-black text-gray-900">{post?.author?.followers?.length || 0}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Followers</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">12</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Talks</p>
                </div>
              </div>
            </div>
          </div>

          
          {recommendations?.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center">
                <Zap className="h-5 w-5 text-indigo-600 mr-2" />
                Related Talks
              </h3>
              <div className="space-y-4">
                {Array.isArray(recommendations) && recommendations.map((rec) => (
                  <Link
                    key={rec._id}
                    to={`/blog/${rec._id}`}
                    className="block group bg-white p-5 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all"
                  >
                    <span className="text-[10px] font-bold text-indigo-400 uppercase mb-2 block">{rec.category}</span>
                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                      {rec.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default BlogDetail;

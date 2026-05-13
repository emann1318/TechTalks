import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../components/blog/PostCard';
import { Rss, Loader2, Sparkles, UserPlus, Users, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const Feed = () => {
  const [posts, setPosts]             = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isDiscover, setIsDiscover]   = useState(false);
  const [following, setFollowing]     = useState(new Set());
  const [page, setPage]               = useState(1);
  const [pages, setPages]             = useState(1);

  useEffect(() => {
    fetchFeed(1);
    fetchSuggestions();
  }, []);

  const fetchFeed = async (p = 1) => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/interactions/feed', {
        params: { page: p, limit: 9 },
      });
      setPosts(data?.posts || []);
      setPages(data?.pages || 1);
      setPage(p);
      setIsDiscover(data?.isDiscover ?? false);
    } catch (error) {
      console.error('Feed error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const { data } = await axios.get('/api/interactions/suggestions');
      setSuggestions(data || []);
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const { data } = await axios.post(`/api/interactions/follow/${userId}`);
      setFollowing((prev) => {
        const next = new Set(prev);
        data.isFollowing ? next.add(userId) : next.delete(userId);
        return next;
      });
      fetchSuggestions();
      fetchFeed(1);
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col lg:flex-row gap-10">

        {/* ── Main feed column ─────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em] mb-3">
              {isDiscover
                ? <><Compass className="h-4 w-4" /><span>Discover Mode</span></>
                : <><Sparkles className="h-4 w-4" /><span>Following</span></>
              }
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
              {isDiscover ? 'Discover TechTalks' : 'Your Talk Feed'}
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              {isDiscover
                ? "You're not following anyone yet — here's what the community is talking about."
                : 'The latest from engineers you follow.'}
            </p>
          </div>

          {/* Discover banner */}
          {isDiscover && !loading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4"
            >
              <div className="bg-indigo-600 rounded-xl p-2 shrink-0">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-indigo-900 text-sm mb-1">
                  Personalise your feed
                </p>
                <p className="text-indigo-700 text-sm">
                  Follow authors from the suggestions panel and their posts will appear here exclusively.
                </p>
              </div>
            </motion.div>
          )}

          {/* Posts */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDeleted={(deletedId) =>
                    setPosts((prev) => prev.filter((p) => p._id !== deletedId))
                  }
                />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center mt-12 gap-2">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => fetchFeed(p)}
                      className={`w-10 h-10 rounded-xl font-bold transition-all ${
                        page === p
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-600 hover:text-indigo-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Rss className="h-16 w-16 text-gray-200 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-gray-900 mb-2">Nothing here yet</h3>
              <p className="text-gray-500 max-w-xs mx-auto mb-8 font-medium">
                Follow some technologists to see their latest tutorials and reviews here.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Explore All Posts
              </Link>
            </div>
          )}
        </div>

        {/* ── Who to Follow sidebar ─────────────────────────────── */}
        {suggestions.length > 0 && (
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-50">
                <h2 className="font-black text-gray-900 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-indigo-600" />
                  Who to Follow
                </h2>
                <p className="text-xs text-gray-400 mt-1">Expand your tech network</p>
              </div>

              <ul className="divide-y divide-gray-50">
                {suggestions.map((u) => {
                  const isFollowed = following.has(u._id);
                  return (
                    <li key={u._id} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                        className="h-10 w-10 rounded-xl bg-gray-100 shrink-0"
                        alt={u.username}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{u.username}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {u.followers?.length || 0} follower{u.followers?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => handleFollow(u._id)}
                        className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                          isFollowed
                            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-100'
                        }`}
                      >
                        {isFollowed ? 'Following' : 'Follow'}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="p-4 border-t border-gray-50">
                <Link
                  to="/"
                  className="block text-center text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Browse all posts →
                </Link>
              </div>
            </div>
          </aside>
        )}

      </div>
    </div>
  );
};

export default Feed;
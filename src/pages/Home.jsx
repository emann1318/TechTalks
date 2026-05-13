import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../components/blog/PostCard';
import { Filter, SortAsc, LayoutGrid, Search as SearchIcon, Loader2, PlusCircle, Sparkles } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    sort: 'newest',
    page: 1
  });
  const [totalPage, setTotalPage] = useState(1);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchPosts();
  }, [filters, searchQuery, user?._id]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { ...filters, search: searchQuery };
      if (!user) {
        const exclude = sessionStorage.getItem('exploreExcludeAuthor');
        if (exclude) params.excludeAuthor = exclude;
      }
      const { data } = await axios.get('/api/blogs', {
        params,
      });
      setPosts(data.posts || []);
      setTotalPage(data.pages || 1);
    } catch (err) {
      console.error('Error fetching posts:', err);
      if (err.response?.status === 503) {
        setError('The database is currently disconnected. Please configure DATABASE_URL in the environment.');
      } else {
        setError('Failed to load posts. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Tutorial', 'Opinion', 'News', 'Review', 'Case Study'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {user && !searchQuery && (
        <div className="mb-12 bg-linear-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2 text-indigo-100 uppercase tracking-widest text-xs font-bold">
                <Sparkles className="h-4 w-4" />
                <span>Share your knowledge</span>
              </div>
              <h2 className="text-3xl font-black mb-2">Ready to share your expertise?</h2>
              <p className="text-indigo-100 max-w-lg">
                Write a technical tutorial, review the latest gadgets, or share your thoughts on industry trends with the TechTalks community.
              </p>
            </div>
            <Link 
              to="/create" 
              className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Write a Talk</span>
            </Link>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl"></div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            {searchQuery ? `Results for "${searchQuery}"` : 'Explore TechTalks'}
          </h1>
          <p className="text-gray-500">Discover the latest in technology, software, and engineering.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_rated">Highest Rated</option>
              <option value="most_commented">Most Commented</option>
            </select>
            <SortAsc className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-white border border-red-100 p-12 rounded-3xl text-center shadow-sm max-w-2xl mx-auto">
          <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
             <Filter className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Service Unavailable</h3>
          <p className="text-gray-500 mb-8">{error}</p>
          <button 
            onClick={fetchPosts}
            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
          <span className="text-gray-500 font-medium">Booting up the latest talks...</span>
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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

          {totalPage > 1 && (
            <div className="flex items-center justify-center mt-16 space-x-2">
              {Array.from({ length: totalPage }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilters({ ...filters, page: p })}
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${
                    filters.page === p
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
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-1">No posts found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  FileText, 
  ShieldAlert, 
  UserX, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Search,
  Filter,
  BarChart3,
  Loader2,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'users') {
        const { data } = await axios.get('/api/admin/users');
        setUsers(Array.isArray(data) ? data : []);
      } else {
        const { data } = await axios.get('/api/admin/posts');
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (id) => {
    try {
      await axios.post(`/api/admin/users/${id}/toggle-active`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleTogglePost = async (id) => {
    try {
      await axios.post(`/api/admin/posts/${id}/toggle-status`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const renderUsers = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-4">
        <thead>
          <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest px-4">
            <th className="pb-4 pl-6">User</th>
            <th className="pb-4">Role</th>
            <th className="pb-4">Joined</th>
            <th className="pb-4 text-center">Status</th>
            <th className="pb-4 text-right pr-6">Action</th>
          </tr>
        </thead>
        <tbody className="space-y-4">
          {users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
            <tr key={user._id} className="bg-white group">
              <td className="py-4 pl-6 rounded-l-2xl border-y border-l border-gray-50 flex items-center space-x-3">
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} className="h-10 w-10 rounded-xl bg-indigo-50" alt="" />
                <div>
                  <div className="font-bold text-gray-900">{user.username}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
              </td>
              <td className="py-4 border-y border-gray-50">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                  {user.role}
                </span>
              </td>
              <td className="py-4 border-y border-gray-50 text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="py-4 border-y border-gray-50 text-center text-xs font-bold">
                {user.active ? (
                  <span className="text-green-500 flex items-center justify-center"><UserCheck className="h-4 w-4 mr-1" /> Active</span>
                ) : (
                  <span className="text-red-400 flex items-center justify-center"><UserX className="h-4 w-4 mr-1" /> Blocked</span>
                )}
              </td>
              <td className="py-4 pr-6 rounded-r-2xl border-y border-r border-gray-50 text-right">
                <button
                  onClick={() => handleToggleUser(user._id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${user.active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                >
                  {user.active ? 'Disable' : 'Restore'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPosts = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-4">
        <thead>
          <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest px-4">
            <th className="pb-4 pl-6">Talk Title</th>
            <th className="pb-4">Author</th>
            <th className="pb-4">Rating</th>
            <th className="pb-4 text-center">Visibility</th>
            <th className="pb-4 text-right pr-6">Action</th>
          </tr>
        </thead>
        <tbody className="space-y-4">
          {posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map(post => (
            <tr key={post._id} className="bg-white">
              <td className="py-4 pl-6 rounded-l-2xl border-y border-l border-gray-50">
                <div className="font-bold text-gray-900 line-clamp-1 max-w-xs">{post.title}</div>
                <div className="text-[10px] text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</div>
              </td>
              <td className="py-4 border-y border-gray-50 text-sm font-medium text-gray-600">
                @{post.author.username}
              </td>
              <td className="py-4 border-y border-gray-50">
                <div className="flex items-center text-amber-400 font-bold text-sm">
                  <BarChart3 className="h-4 w-4 mr-1.5" /> {post.averageRating.toFixed(1)}
                </div>
              </td>
              <td className="py-4 border-y border-gray-50 text-center">
                {post.status === 'active' ? (
                  <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">Public</span>
                ) : (
                  <span className="text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">Blocked</span>
                )}
              </td>
              <td className="py-4 pr-6 rounded-r-2xl border-y border-r border-gray-50 text-right">
                <button
                  onClick={() => handleTogglePost(post._id)}
                  className={`p-2 rounded-xl transition-all ${post.status === 'active' ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                >
                  {post.status === 'active' ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Mission Control</h1>
          <p className="text-gray-500 font-medium">Administrator dashboard for TechTalks platform.</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Users className="h-4 w-4 mr-2" /> Users
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'posts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <FileText className="h-4 w-4 mr-2" /> Blog Posts
          </button>
        </div>
      </div>

      <div className="mb-10 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3 h-5 w-5 text-gray-300" />
          <input
            type="text"
            placeholder="Search within this database..."
            className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl flex items-center font-bold text-sm hover:bg-gray-200 transition-colors">
          <Filter className="h-4 w-4 mr-2" /> Export JSON
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        </div>
      ) : activeTab === 'users' ? renderUsers() : renderPosts()}
    </div>
  );
};

export default Admin;

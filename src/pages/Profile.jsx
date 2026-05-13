import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  User as UserIcon, 
  Mail, 
  Settings, 
  Camera, 
  Save, 
  Loader2, 
  Zap, 
  Edit3,
  Calendar,
  LogOut,
  FileText,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, fetchProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: ''
  });

  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    if (user?._id) fetchMyPosts();
  }, [user?._id]);

  const fetchMyPosts = async () => {
    if (!user?._id) return;
    setPostsLoading(true);
    try {
      const { data } = await axios.get('/api/blogs', {
        params: { author: user._id, limit: 50, sort: 'newest' },
      });
      setMyPosts(data.posts || []);
    } catch (e) {
      console.error(e);
      setMyPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const deleteOnePost = async (postId) => {
    if (!window.confirm('Delete this talk?')) return;
    try {
      await axios.delete(`/api/blogs/${postId}`);
      setMyPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || 'Could not delete');
    }
  };

  const deleteAllMyPosts = async () => {
    if (!window.confirm('Delete ALL your talks? This cannot be undone.')) return;
    setDeletingAll(true);
    try {
      await axios.delete('/api/blogs/mine/all');
      setMyPosts([]);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || 'Could not delete posts');
    } finally {
      setDeletingAll(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/auth/profile', formData);
      await fetchProfile();
      setEditing(false);
    } catch (error) {
      console.error(error);
      alert('Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden relative">
        {/* Banner Decoration */}
        <div className="h-48 bg-linear-to-r from-indigo-500 to-purple-600 relative overflow-hidden">
          <Zap className="absolute -bottom-10 -right-10 h-64 w-64 text-white/10 rotate-12" />
        </div>

        <div className="px-8 pb-12">
          <div className="relative flex flex-col md:flex-row md:items-end -mt-16 mb-8 gap-6">
            <div className="relative group mx-auto md:mx-0">
              <img
                src={formData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                className="h-32 w-32 rounded-4xl bg-white p-1 shadow-xl shadow-indigo-100 ring-8 ring-white object-cover"
                alt=""
              />
              {editing && (
                <button 
                  onClick={() => {
                    const newSeed = Math.random().toString(36).substring(7);
                    setFormData({...formData, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${newSeed}`});
                  }}
                  className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-black text-gray-900 leading-none">
                  {user.username}
                </h1>
                {user.role === 'admin' && (
                  <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                    Staff
                  </span>
                )}
              </div>
              <p className="text-gray-400 flex items-center justify-center md:justify-start text-sm">
                <Calendar className="h-4 w-4 mr-1.5" /> Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'Recently'}
              </p>
            </div>

            <div className="flex gap-2 mx-auto md:mx-0">
              {!editing ? (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl flex items-center hover:bg-gray-200 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-2" /> Edit Profile
                  </button>
                  <button
                    onClick={() => logout(true)}
                    className="p-3 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8 border-t border-gray-50">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                  <Edit3 className="h-4 w-4 mr-2" /> Biography
                </h3>
                {editing ? (
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-100 outline-none min-h-30 resize-none text-gray-600 text-lg shadow-inner"
                  ></textarea>
                ) : (
                  <p className="text-gray-600 text-lg leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    {user.bio || 'This technologist hasn\'t added a bio yet. They\'re probably too busy coding something awesome.'}
                  </p>
                )}
              </section>

              <section>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
                    <FileText className="h-4 w-4 mr-2" /> My talks
                  </h3>
                  {myPosts.length > 0 && (
                    <button
                      type="button"
                      onClick={deleteAllMyPosts}
                      disabled={deletingAll}
                      className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingAll ? 'Deleting…' : 'Delete all my posts'}
                    </button>
                  )}
                </div>
                {postsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                  </div>
                ) : myPosts.length === 0 ? (
                  <p className="text-gray-500 text-sm bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    You have not published any talks yet.{' '}
                    <Link to="/create" className="text-indigo-600 font-bold hover:underline">
                      Write one
                    </Link>
                    .
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {myPosts.map((p) => (
                      <li
                        key={p._id}
                        className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 group"
                      >
                        <Link
                          to={`/blog/${p._id}`}
                          className="flex-1 min-w-0 font-medium text-gray-900 truncate hover:text-indigo-600 flex items-center gap-2"
                        >
                          {p.title}
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gray-400 opacity-0 group-hover:opacity-100" />
                        </Link>
                        <Link
                          to={`/edit/${p._id}`}
                          className="text-xs font-bold text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 shrink-0"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteOnePost(p._id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {editing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Username</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.username || ''}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        />
                      </div>
                   </div>
                </div>
              )}
            </div>

            <aside className="space-y-8">
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Engagement</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm">
                       <p className="text-2xl font-black text-indigo-600">{user.followers?.length || 0}</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">Followers</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm">
                       <p className="text-2xl font-black text-indigo-600">{user.following?.length || 0}</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">Following</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-indigo-600 bg-indigo-50 p-4 rounded-xl">
                  <Zap className="h-5 w-5" />
                   <span className="text-sm font-bold italic">Member of Early Access Tribe</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

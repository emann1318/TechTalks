import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, UserPlus, MessageSquare, Clock, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    markAsRead();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get('/api/interactions/notifications');
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await axios.post('/api/interactions/notifications/read');
    } catch (err) { /* silent */ }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'follow': return <UserPlus className="h-5 w-5 text-indigo-500" />;
      case 'comment': return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default: return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-black text-gray-900 flex items-center">
          <Bell className="h-8 w-8 text-indigo-600 mr-4" /> Activity
        </h1>
        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] bg-gray-100 px-3 py-1 rounded-full">
           Real-time
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {notifications.map((n, i) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-start bg-white p-5 rounded-2xl border ${n.read ? 'border-gray-50' : 'border-indigo-100 bg-indigo-50/10 shadow-sm'} group`}
              >
                <div className={`p-2.5 rounded-xl mr-4 shrink-0 ${n.read ? 'bg-gray-50' : 'bg-white shadow-sm'}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium text-sm leading-relaxed mb-1">
                    <span className="font-black">@{n.actor.username}</span> {n.type === 'follow' ? 'started following you' : `commented on "${n.post?.title}"`}
                  </p>
                  <div className="flex items-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    <Clock className="h-3 w-3 mr-1" /> {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {!n.read && (
                  <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2 shadow-lg shadow-indigo-100"></div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
           <Zap className="h-12 w-12 text-gray-200 mx-auto mb-4" />
           <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">Everything is quiet</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;

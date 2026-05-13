import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '../components/blog/Editor';
import { ArrowLeft, Loader2 } from 'lucide-react';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data } = await axios.get(`/api/blogs/${id}`);
      setPost({
        ...data,
        tags: data.tags?.join(', ') || ''
      });
    } catch (error) {
      console.error(error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedData) => {
    try {
      setSaving(true);
      await axios.put(`/api/blogs/${id}`, updatedData);
      navigate(`/blog/${id}`);
    } catch (error) {
      console.error(error);
      alert('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-40">
      <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-100 mb-6 font-bold text-xs uppercase"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to talk
          </button>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
             Edit <span className="text-indigo-600">Talk</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">Refining your technical masterpiece.</p>
        </div>
      </div>

      <Editor initialData={post} onSave={handleUpdate} loading={saving} />
    </div>
  );
};

export default EditPost;

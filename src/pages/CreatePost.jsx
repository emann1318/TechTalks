import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '../components/blog/Editor';
import { ArrowLeft } from 'lucide-react';

const CreatePost = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async (postData) => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/blogs', postData);
      if (!data?._id) {
        alert('Published but no post id returned. Check the home page.');
        navigate('/');
        return;
      }
      sessionStorage.setItem(`postJustPublished:${data._id}`, '1');
      navigate(`/blog/${data._id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to publish post. Please try again.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </button>
        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
          Craft your next <span className="text-indigo-600">TechTalk</span>
        </h1>
        <p className="text-gray-500 mt-2">Share your tutorials, reviews, or case studies with the community.</p>
      </div>

      <Editor onSave={handleSave} loading={loading} />
    </div>
  );
};

export default CreatePost;

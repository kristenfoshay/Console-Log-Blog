import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Calendar, Tag } from 'lucide-react';

// Types
interface Post {
_id: string;
title: string;
content: string;
tags: string[];
views: number;
createdAt: string;
updatedAt: string;
}

const BlogPlatform: React.FC = () => {
const [posts, setPosts] = useState<Post[]>([]);
const [selectedPost, setSelectedPost] = useState<Post | null>(null);
const [view, setView] = useState<'posts' | 'create' | 'detail'>('posts');
const [searchQuery, setSearchQuery] = useState('');

// Form states
const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });

// Fetch posts
const fetchPosts = async () => {
try {
const response = await fetch(`/api/posts`);
const data = await response.json();
setPosts(data.posts || []);
} catch (error) {
console.error('Error fetching posts:', error);
}
};


// Create post
const createPost = async () => {
if (!newPost.title || !newPost.content) {
alert('Please fill in all fields!');
return;
}

try {
  const response = await fetch(`/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...newPost,
      tags: newPost.tags.split(',').map(t => t.trim()).filter(t => t),
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create post');
  }
  
  await response.json();
  setNewPost({ title: '', content: '', tags: '' });
  fetchPosts();
  setView('posts');
  alert('Post created successfully!');
} catch (error) {
  console.error('Error creating post:', error);
  alert(`Error creating post: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
};


// Search posts
const searchPosts = async () => {
if (!searchQuery.trim()) {
fetchPosts();
return;
}

try {
  const response = await fetch(`/api/posts/search/${searchQuery}`);
  const data = await response.json();
  setPosts(data);
} catch (error) {
  console.error('Error searching posts:', error);
}

};

useEffect(() => {
fetchPosts();
}, []);

const formatDate = (date: string) => {
return new Date(date).toLocaleDateString('en-US', {
month: 'short',
day: 'numeric',
year: 'numeric',
});
};

// Posts List View
if (view === 'posts') {
return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
<div className="max-w-6xl mx-auto">
{/* Header */}
<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
<div className="flex justify-between items-center mb-6">
<h1 className="text-4xl font-bold text-gray-800">A Console Log Blog</h1>
<div className="flex gap-4 items-center">
<button
onClick={() => setView('create')}
className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
>
<Plus size={20} />
New Post
</button>
</div>
</div>

        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchPosts()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
          <button
            onClick={searchPosts}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
          >
            <Search size={20} />
            Search
          </button>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                fetchPosts();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Clear
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-4 text-sm text-gray-600">
            Showing search results for: <span className="font-semibold">"{searchQuery}"</span>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchQuery ? `No posts found matching "${searchQuery}"` : 'No posts yet. Create your first post!'}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              onClick={() => {
                setSelectedPost(post);
                setView('detail');
              }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {formatDate(post.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={16} />
                  {post.views} views
                </span>
              </div>
              <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
              {post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      <Tag size={14} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);
}

  // Create Post View
  if (view === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Create New Post</h1>
              <button
                onClick={() => setView('posts')}
                className="text-gray-600 hover:text-gray-800"
              >
                &larr; Back
              </button>
            </div>

        <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                placeholder="tech, javascript, mongodb"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              />
            </div>

            <button
              onClick={createPost}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
            >
              Publish Post
            </button>
          </div>
      </div>
    </div>
  </div>
);
  }


  if (view === 'detail') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <button
              onClick={() => setView('posts')}
              className="text-gray-600 hover:text-gray-800 mb-6"
            >
              Back to Posts
            </button>

      {selectedPost && (
        <>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{selectedPost.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {formatDate(selectedPost.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={16} />
              {selectedPost.views} views
            </span>
          </div>

          {selectedPost.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-6">
              {selectedPost.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
          </div>

        </>
      )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BlogPlatform;

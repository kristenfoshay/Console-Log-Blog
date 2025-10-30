import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, MessageSquare, Calendar, Tag, User } from 'lucide-react';

// Types
interface User {
_id: string;
name: string;
email: string;
createdAt: string;
}

interface Comment {
_id: string;
authorId: string;
authorName: string;
content: string;
createdAt: string;
}

interface Post {
_id: string;
title: string;
content: string;
authorId: string;
authorName: string;
tags: string[];
comments: Comment[];
views: number;
createdAt: string;
updatedAt: string;
}

const BlogPlatform: React.FC = () => {
const [posts, setPosts] = useState<Post[]>([]);
const [users, setUsers] = useState<User[]>([]);
const [selectedPost, setSelectedPost] = useState<Post | null>(null);
const [view, setView] = useState<'posts' | 'create' | 'detail'>('posts');
const [searchQuery, setSearchQuery] = useState('');
const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

// Form states
const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
const [newComment, setNewComment] = useState('');

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

// Fetch users
const fetchUsers = async () => {
try {
const response = await fetch(`/api/users`);
const data = await response.json();
setUsers(data);
if (data.length > 0 && !currentUser) {
setCurrentUser(data[0]);
}
} catch (error) {
console.error('Error fetching users:', error);
}
};

// Create user
const createUser = async () => {
if (!newUser.name || !newUser.email || !newUser.password) return;
try {
const response = await fetch(`/api/users`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(newUser),
});
const data = await response.json();
setUsers([...users, data]);
setCurrentUser(data);
setNewUser({ name: '', email: '', password: '' });
} catch (error) {
console.error('Error creating user:', error);
}
};

// Login user
const loginUser = async () => {
  if (!loginForm.email || !loginForm.password) return;
  try {
    const response = await fetch(`/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
    });
    const data = await response.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    setCurrentUser(data);
    setLoginForm({ email: '', password: '' });
    setView('posts');
  } catch (error) {
    console.error('Error logging in:', error);
    alert('Error logging in');
  }
};

// Create post
const createPost = async () => {
if (!currentUser || !newPost.title || !newPost.content) {
alert('Please fill in all fields and create a user first!');
return;
}

try {
  const response = await fetch(`/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...newPost,
      authorId: currentUser._id,
      tags: newPost.tags.split(',').map(t => t.trim()).filter(t => t),
    }),
  });
  await response.json();
  setNewPost({ title: '', content: '', tags: '' });
  fetchPosts();
  setView('posts');
} catch (error) {
  console.error('Error creating post:', error);
}

};

// Add comment
const addComment = async (postId: string) => {
if (!currentUser || !newComment.trim()) return;

try {
  await fetch(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authorId: currentUser._id,
      content: newComment,
    }),
  });
  setNewComment('');
  const response = await fetch(`/api/posts/${postId}`);
  const updatedPost = await response.json();
  setSelectedPost(updatedPost);
  fetchPosts();
} catch (error) {
  console.error('Error adding comment:', error);
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
fetchUsers();
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
<h1 className="text-4xl font-bold text-gray-800">Blog Platform</h1>
<div className="flex gap-4 items-center">
{currentUser ? (
<div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
<User size={20} className="text-indigo-600" />
<span className="font-medium text-gray-700">{currentUser.name}</span>
</div>
) : (
<button
onClick={() => setView('create')}
className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
>
Login
</button>
)}
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={searchPosts}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
          >
            <Search size={20} />
            Search
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No posts yet. Create your first post!</p>
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
                  <User size={16} />
                  {post.authorName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {formatDate(post.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={16} />
                  {post.views} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={16} />
                  {post.comments.length} comments
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
<- Back
</button>
</div>

        {!currentUser && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">First, create a user:</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="password"
                placeholder="Your Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={createUser}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Create User
              </button>
            </div>
          </div>
        )}

        {currentUser && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={createPost}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
            >
              Publish Post
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

}

// Login View
if (view === 'login') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Login</h1>
            <button
              onClick={() => setView('posts')}
              className="text-gray-600 hover:text-gray-800"
            >
              <- Back
            </button>
          </div>
          
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={loginUser}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
            >
              Login
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => setView('create')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create one here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Post Detail View
return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
<div className="max-w-4xl mx-auto">
<div className="bg-white rounded-2xl shadow-lg p-8">
<button
onClick={() => setView('posts')}
className="text-gray-600 hover:text-gray-800 mb-6"
>
<- Back to Posts
</button>

      {selectedPost && (
        <>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{selectedPost.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
            <span className="flex items-center gap-1">
              <User size={16} />
              {selectedPost.authorName}
            </span>
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

          {/* Comments Section */}
          <div className="border-t pt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Comments ({selectedPost.comments.length})
            </h3>

            {currentUser && (
              <div className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                />
                <button
                  onClick={() => addComment(selectedPost._id)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Post Comment
                </button>
              </div>
            )}

            <div className="space-y-4">
              {selectedPost.comments.map((comment) => (
                <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">{comment.authorName}</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  </div>
</div>

);
};

export default BlogPlatform;
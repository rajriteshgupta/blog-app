import { Button, Select, TextInput } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

import PostCard from '../components/PostCard';

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'desc',
    category: 'uncategorized'
  });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  console.log(sidebarData);
  useEffect(()=>{
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const sortFromUrl = urlParams.get('sort');
    const categoryFromUrl = urlParams.get('category');
    if(searchTermFromUrl || sortFromUrl ||categoryFromUrl){
      setSidebarData({
        ...sidebarData,
        searchTerm: searchTermFromUrl ? searchTermFromUrl : sidebarData.searchTerm,
        sort: sortFromUrl ? sortFromUrl : sidebarData.sort,
        category: categoryFromUrl ? categoryFromUrl : sidebarData.category
      });
    }
    const fetchPosts = async() => {
      setLoading(true);
      const searchQuery = urlParams.toString();
      try {
        const res = await fetch(`/api/post/getposts?${searchQuery}`);
        const data = await res.json();
        if(!res.ok){
          setLoading(false);
          return;
        }
        else{
          setLoading(false);
          setPosts(data.posts);
          if(data.posts.length === 9){
            setShowMore(true);
          }
          else{
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchPosts();
  }, [location.search]);
  const handleChange = (e) => {
    if(e.target.id === 'searchTerm'){
      setSidebarData({ ...sidebarData, searchTerm: e.target.value});
    }
    if(e.target.id === 'sort'){
      const order = e.target.value || 'desc';
      setSidebarData({ ...sidebarData, sort: order});
    }
    if(e.target.id === 'category'){
      const category = e.target.value || 'uncategorized';
      setSidebarData({ ...sidebarData, category: category});
    }
  }
  const handleSubmit = async(e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', sidebarData.searchTerm);
    urlParams.set('sort', sidebarData.sort);
    urlParams.set('category', sidebarData.category);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  }
  const handleShowMore = async() => {
    const startIndex = posts.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    try {
      const res = await fetch(`/api/post/getposts?${searchQuery}`);
      const data = await res.json();
      if(!res.ok){
        console.log(data.message);
      }
      else{
        setPosts([ ...posts, ...data.posts]);
        if(data.posts.length === 9){
          setShowMore(true);
        }
        else{
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  return (
    <div className='flex flex-col md:flex-row'>
      <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500">
        <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <label className='whitespace-nowrap font-semibold'>Search Term:</label>
            <TextInput 
              id='searchTerm' 
              type='text' 
              placeholder='Search...' 
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />

          </div>
          <div className="flex items-center gap-2">
            <label className='whitespace-nowrap font-semibold'>Sort:</label>
            <Select 
              id='sort'
              value={sidebarData.sort}
              onChange={handleChange} 
            >
              <option value='desc'>Latest</option>
              <option value='asc'>Oldest</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className='whitespace-nowrap font-semibold'>Category:</label>
            <Select 
              id='category'
              value={sidebarData.category}
              onChange={handleChange} 
            >
              <option value="uncategorized">Uncategorized</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="react">React</option>
              <option value="angular">Angular</option>
              <option value="others">Others</option>
            </Select>
          </div>
          <Button
            type='submit'
            gradientDuoTone='purpleToPink'
            outline
          >
            Apply Filters
          </Button>
        </form>
      </div>
      <div className="w-full">
        <h1 className='text-3xl font-semibold sm: border-b border-gray-500 p-3 mt-5'>
          Post results:
        </h1>
        <div className="flex flex-wrap p-7 gap-4">
          { loading && (
            <p className='text-xl text-gray-500'>Loading...</p>
          )}
          { !loading && posts.length === 0 && (
            <p className='text-xl text-gray-500'>No posts found.</p>
          )}
          { !loading && posts.length > 0 && posts.map((post)=>(
            <PostCard key={post._id} post={post}/>
          ))}
          { showMore && (
            <button 
              className='text-teal-500 text-lg hover:underline p-7 w-full'
              onClick={handleShowMore}
            >
              show more
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

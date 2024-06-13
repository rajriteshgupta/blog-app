import React, { useEffect, useState } from 'react';
import { Sidebar } from 'flowbite-react';
import { HiArrowSmRight, HiDocument, HiUser } from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { signoutSuccess } from '../redux/user/userSlice';

export default function DashSidebar() {
  const { currentUser } = useSelector(state=>state.user);
  const location = useLocation();
  const dispatch = useDispatch();
  const [tab, setTab] = useState('');
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if(tabFromUrl){
      setTab(tabFromUrl);
    }
  }, [location.search]);
  const handleSignout = async() => {
    try {
      const res = await fetch('/api/auth/signout', {
        method: 'POST'
      });
      const data = res.json();
      if(!res.ok){
        console.log(data.message);
      }
      else{
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Sidebar className='w-full md:w-56'>
      <Sidebar.Items>
        <Sidebar.ItemGroup className='flex flex-col gap-1'>
          <Link to='/dashboard?tab=profile'>
            <Sidebar.Item
              active={tab === "profile"}
              icon={HiUser}
              label={currentUser.isAdmin ? "Admin" : "User"}
              labelColor="dark"
              as='div'
            >
              Profile
            </Sidebar.Item>
          </Link>
          {currentUser.isAdmin && (
          <Link to='/dashboard?tab=posts'>
            <Sidebar.Item
              active={tab === "posts"}
              icon={HiDocument}
              labelColor="dark"
              as='div'
            >
              Posts
            </Sidebar.Item>
          </Link>
          )}
          <Sidebar.Item icon={HiArrowSmRight} className="cursor-pointer" onClick={handleSignout}>
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}

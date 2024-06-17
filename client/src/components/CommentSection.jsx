import { Alert, Button, Modal, Textarea } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

import Comment from './Comment';

export default function CommentSection({postId}) {
  const { currentUser } = useSelector(state=>state.user);
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] =useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const handleSubmit = async(e) => {
    e.preventDefault();
    if(comment.length === 0){
      setCommentError('Comment cannot be empty');
      return;
    }
    if(comment.length>200){
      setCommentError("Comment's length cannot be greater than 200");
      return;
    }try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({content: comment, postId: postId, userId: currentUser._id})
      });
      const data = await res.json();
      if(!res.ok){
        setCommentError('Something went wrong. try again!');
      }
      else{
        setComment('');
        setCommentError(null);
        setComments([data, ...comments]);
      }
    } catch (error) {
      setCommentError('Something went wrong try again');
    }
  }
  useEffect(()=>{
    const getComments = async() => {
      try {
        const res = await fetch(`/api/comment/getPostComments/${postId}`);
        const data = await res.json();
        if(res.ok){
          setComments(data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    if(postId){
      getComments();
    }
  }, [postId]);
  const handleLike = async(commentId) => {
    try {
      if(!currentUser){
        navigate('/sign-in');
        return;
      }
      const res = await fetch(`/api/comment/likeComment/${commentId}`, {
        method:'PUT'
      });
      if(res.ok){
        const data = await res.json();
        setComments(comments.map((comment)=> (
          comment._id === commentId ? {
            ...comment,
            likes: data.likes,
            numberOfLikes: data.numberOfLikes
          } : comment
        )));
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  const handleEdit = async(comment, editedComment) => {
    setComments(
      comments.map((c)=>
        c._id === comment._id ? { ...c, content: editedComment } : c 
      )
    )
  }
  const handleDelete = async() => {
    setShowModal(false);
    try {
      if(!currentUser){
        navigate('/sign-in');
        return;
      }
      const res = await fetch(`/api/comment/deleteComment/${commentToDelete}`, {
        method: 'DELETE'
      });
      if(res.ok){
        setComments(comments.filter((comment) => comment._id !== commentToDelete));
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  return (
    <div className='max-w-3xl mx-auto w-full p-3'>
      {currentUser ? (
        <div className="flex items-center gap-1 my-5 text-gray-500 text-sm">
          <p>Signed in as: </p>
          <img className='h-5 w-5 object-cover rounded-full' src={currentUser.profilePicture} alt="" />
          <Link to='/dashboard?tab=profile' className='text-sm text-cyan-600 hover:underline'>
            @{currentUser.username}
          </Link>
        </div>
      ) : (
        <div className="my-5 flex gap-1">
          You must be logged in to comment.
          <Link to='/sign-in' className='text-cyan-500 hover:underline'> Sign In</Link>
        </div>
      )}
      {currentUser && (
        <>
        <form className='border border-teal-500 rounded-md p-3' onSubmit={handleSubmit}>
          <Textarea
            placeholder='Add a comment'
            rows='3'
            maxLength='200'
            value={comment}
            onChange={(e)=>setComment(e.target.value)}
          />
          <div className="flex justify-between items-center mt-5">
            <p className='text-gray-500 text-xs'>{200-comment.length} characters remaining</p>
            <Button type='submit' gradientDuoTone='purpleToBlue' outline>Submit</Button>
          </div>
        </form>
        {commentError && <Alert color='failure' className='mt-5'>{commentError}</Alert>}
        </>
      )}
      {comments.length === 0 ? (
        <p className='text-sm my-5'>No comments yet!</p>
      ) : (
        <>
          <div className="text-sm my-5 flex items-center gap-1">
            <p>Comments</p>
            <div className="border border-gray-400 py-1 px-2 rounded-sm">
              <p>{comments.length}</p>
            </div>
          </div>
          {
            comments.map((comment)=>(
              <Comment 
                key={comment._id}
                comment={comment}
                onLike={handleLike}
                onEdit={handleEdit}
                onDelete={(commentId)=>{
                  setShowModal(true);
                  setCommentToDelete(commentId);
                }}
              />
            ))
          }
        </>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="lg"
      >
        <Modal.Header />
        <Modal.Body>
          <div>
            <HiOutlineExclamationCircle className="h-14 w-14 text-red-600 dark:text-red-300 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-200">
              Are you sure you want to delete this comment?
            </h3>
            <div className="flex justify-center gap-10">
              <Button color="failure" onClick={handleDelete}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

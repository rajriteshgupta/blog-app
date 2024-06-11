import { Alert, Button, Modal, TextInput } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { HiOutlineExclamationCircle } from 'react-icons/hi'

import { app } from '../firebase';
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteStart,
  deleteSuccess,
  deleteFailure,
  signoutSuccess,
} from "../redux/user/userSlice";

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector(state => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [imageUploading, SetImageUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const filePickerRef = useRef();
  const dispatch = useDispatch();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(file){
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  }
  useEffect(() => {
    if(imageFile){
      uploadImage();
    }
  }, [imageFile]);
  const uploadImage = async() => {
    setImageFileUploadError(null);
    SetImageUploading(true);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError('Could not upload image (File must be within 2MB)');
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        SetImageUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({...formData, profilePicture: downloadURL});
          SetImageUploading(false);
        });
      }
    )
  }
  const handleChange = (e) => {
    if(e.target.value === ''){
      delete formData[e.target.id];
    }
    else{
      setFormData({...formData, [e.target.id]: e.target.value });
    }
  }
  const handleSubmit = async(e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if(Object.keys(formData).length === 0){
      setUpdateUserError('No changes made');
      return;
    }
    if(imageUploading){
      return;
    }
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if(!res.ok){
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
        setFormData({});
      }
      else{
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User's profile updated successfully.");
        setImageFileUploadProgress(null);
        setFormData({});
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(data.message);
      setFormData({});
    }
  }
  const handleDeleteUser = async(e) => {
    setShowModal(false);
    try {
      dispatch(deleteStart());
      const res= await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE'
      });
      const data = res.json();
      if(!res.ok){
        dispatch(deleteFailure(data.message));
      }
      else{
        dispatch(deleteSuccess());
      }
    } catch (error) {
      dispatch(deleteFailure(error.message));
    }
  }
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
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />
        <div
          className="w-32 h-32 self-center cursor-pointer shadow-md
        overflow-hidden rounded-full relative"
          onClick={() => filePickerRef.current.click()}
        >
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt="user"
            className={`rounded-full w-full h-full object-cover border-4
          border-[lightgray] ${
            imageFileUploadProgress &&
            imageFileUploadProgress < 100 &&
            "opacity-60"
          }`}
          />
        </div>
        {imageFileUploadError && (
          <Alert color="failure">{imageFileUploadError}</Alert>
        )}
        {imageFileUploadProgress && imageFileUploadProgress < 100 && (
          <Alert color="success">Image uploading...</Alert>
        )}
        {imageFileUploadProgress && imageFileUploadProgress == 100 && (
          <Alert color="success">Image uploaded. Please click update.</Alert>
        )}
        <TextInput
          type="text"
          id="username"
          placeholder="username"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <TextInput
          type="password"
          id="password"
          placeholder="password"
          onChange={handleChange}
        />
        <Button type="submit" gradientDuoTone="purpleToBlue" outline disabled={loading || imageUploading}>
          {loading ? 'Loading...' : 'Update'}
        </Button>
      </form>
      <div className="text-red-500 font-semibold flex justify-between mt-3">
        <span className="cursor-pointer" onClick={() => setShowModal(true)}>
          Delete Account
        </span>
        <span className="cursor-pointer" onClick={handleSignout}>Sign Out</span>
      </div>
      {updateUserSuccess && (
        <Alert color="success" className="mt-4">
          {updateUserSuccess}
        </Alert>
      )}
      {updateUserError && (
        <Alert color="failure" className="mt-4">
          {updateUserError}
        </Alert>
      )}
      {error && (
        <Alert color="failure" className="mt-4">
          {error}
        </Alert>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="lg"
      >
        <Modal.Header/>
        <Modal.Body>
          <div>
            <HiOutlineExclamationCircle className='h-14 w-14 text-red-600 dark:text-red-300 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-200'>Are you sure you want to delete your account?</h3>
            <div className='flex justify-center gap-10'>
              <Button color='failure' onClick={handleDeleteUser}>Yes, I'm sure</Button>
              <Button color='gray' onClick={()=>setShowModal(false)}>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

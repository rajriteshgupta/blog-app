import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react'
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { app } from '../firebase';

export default function UpdatePost() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { currentUser } = useSelector(state=>state.user);
  const [imageFile, setImageFile] = useState();
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageUploading, SetImageUploading] = useState(false);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  useEffect(() => {
    try {
      const fetchPost = async() => {
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        const data = await res.json();
        if(!res.ok){
          setPublishError(data.message);
        }
        else{
          setPublishError(null);
          setFormData(data.posts[0]);
        }
      }
      fetchPost();
    } catch (error) {
      setPublishError(error.message);
    }
  }, [postId])
  const handleUploadImage = async() => {
    try {
      if(!imageFile){
        setImageFileUploadError('Please select an image');
        return;
      }
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
          setImageFileUploadProgress(null);
          setImageFileUploadError('Could not upload image (File must be within 2MB)');
          setImageFile(null);
          SetImageUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageFileUploadProgress(null);
            setFormData({...formData, image: downloadURL});
            SetImageUploading(false);
          });
        }
      )
    } catch (error) {
      setImageFileUploadError('Image upload failed');
      setImageFileUploadProgress(null);
    }
  }
  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if(!res.ok || data.success === false){
        setPublishError(data.message);
      }
      else{
        setPublishError(null);
        navigate(`/post/${data.slug}`);
      }
    } catch (error) {
      setPublishError('Something went wrong');
    }
  }
  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Update post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            value={formData.title}
            onChange={(e)=>setFormData({...formData, title: e.target.value})}
          />
          <Select
            value={formData.category}
            onChange={(e)=>setFormData({...formData, category: e.target.value})}>
            <option value="uncategorized">Select a category</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="react">React</option>
            <option value="angular">Angular</option>
            <option value="others">Others</option>
          </Select>
        </div>
        <div
          className="flex gap-4 items-center justify-between border-4
        border-teal-500 border-dotted p-3"
        >
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <Button
            type="button"
            gradientDuoTone="purpleToBlue"
            size="sm"
            outline
            onClick={handleUploadImage}
            disabled={imageUploading}
          >
            {imageFileUploadProgress ? (
              <div className="w-10 h-10">
                <CircularProgressbar
                  value={imageFileUploadProgress}
                  text={`${imageFileUploadProgress}%`}
                />
              </div>
            ) : (
              "Upload image"
            )}
          </Button>
        </div>
        {imageFileUploadError && (
          <Alert color="failure">{imageFileUploadError}</Alert>
        )}
        {formData.image && (
          <img
            src={formData.image}
            alt="upload"
            className="w-full h-72 object-cover"
          />
        )}
        <ReactQuill
          theme="snow"
          placeholder="Write Something..."
          className="h-72 mb-12"
          value={formData.content}
          required
          onChange={(value)=>setFormData({...formData, content: value})}
        />
        <Button type="submit" gradientDuoTone="purpleToPink">
          Update
        </Button>
      </form>
      {publishError && <Alert color='failure' className='mt-5'>{publishError}</Alert>}
    </div>
  );
}

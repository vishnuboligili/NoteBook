import React, { useEffect, useState, useRef } from "react";
import picturesData from "../../database/picturesData.json";
import { apiRoutes } from "@/utils/apiRoutes";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getData } from "@/features/user/userSlice";
import { FaCamera, FaTimes, FaUpload } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChangeProfileImage = ({ handleImageChangeBtn, profilePic }) => {
  const [changeImageBtn, setChangeImageBtn] = useState(false);
  const [uploadOption, setUploadOption] = useState(false);

  const handleChangeImageBtn = () => {
    setChangeImageBtn(!changeImageBtn);
  };

  const handleUploadOption = () => {
    setUploadOption(!uploadOption);
  };

  return (
    <>
      <div className="w-full h-dvh background_color z-10 fixed left-0 top-0 flex justify-center items-center">
        <div className="w-10/12 md:w-6/12 lg:w-4/12 background_gradient_color rounded-lg p-4">
          <div className="w-full flex justify-center">
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-green-600">
              <img
                src={profilePic || "/default-profile.png"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="w-full flex flex-col gap-3 mt-8">
            <button
              onClick={handleUploadOption}
              className="w-full py-2 bg-blue-600 rounded text-white hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <FaUpload /> Upload New Image
            </button>

            <button
              onClick={handleChangeImageBtn}
              className="w-full py-2 bg-slate-500 hover:bg-slate-600 rounded text-white flex items-center justify-center gap-2"
            >
              <FaCamera /> Choose from Gallery
            </button>

            <button
              onClick={handleImageChangeBtn}
              className="w-full py-2 bg-red-600 rounded text-white hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {changeImageBtn && (
        <ChangeImage 
          handleChangeImageBtn={handleChangeImageBtn} 
          handleImageChangeBtn={handleImageChangeBtn}
        />
      )}

      {/* Upload Option */}
      {uploadOption && (
        <UploadImage 
          handleUploadOption={handleUploadOption}
          handleImageChangeBtn={handleImageChangeBtn}
        />
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

const ChangeImage = ({ handleChangeImageBtn, handleImageChangeBtn }) => {
  const [pictures, setPictures] = useState([]);
  const [selectPhoto, setSelectPhoto] = useState("");
  const userId = useSelector((state) => state.user.value);
  const dispatch = useDispatch();

  const handleSelectPhoto = (select) => {
    setSelectPhoto(select);
  };

  const handleSaveBtn = async () => {
    if (!selectPhoto) {
      toast.error("Please select an image");
      return;
    }

    try {
      const token = localStorage.getItem("notebookToken");
      const response = await axios.put(
        `${apiRoutes.updateUserProfileURI}/${userId._id}`,
        { profilePic: selectPhoto },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(getData(response.data.data));
      toast.success("Profile image updated successfully");
      handleImageChangeBtn();
    } catch (error) {
      console.log("err", error);
      toast.error("Failed to update profile image");
    }
  };

  useEffect(() => {
    setPictures(picturesData);
  }, []);

  return (
    <div className="w-full h-dvh z-20 fixed left-0 top-0 flex justify-center items-center background_color">
      <div className="w-10/12 md:w-8/12 lg:w-6/12 background_gradient_color p-4 rounded-md shadow-lg">
        <h2 className="text-xl font-bold text-center mb-4">Select Profile Picture</h2>
        
        <div className="w-full grid grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
          {pictures.map((item) => (
            <div
              className={`w-full cursor-pointer transition-all ${
                selectPhoto === item.path
                  ? "ring-4 ring-green-500 transform scale-105"
                  : "hover:ring-2 hover:ring-gray-300"
              } p-1 rounded-lg`}
              key={item.id}
              onClick={() => handleSelectPhoto(item.path)}
            >
              <img 
                src={item.path} 
                alt="" 
                className="w-full h-24 object-cover rounded-lg" 
              />
            </div>
          ))}
        </div>

        <div className="w-full flex justify-between mt-6">
          <button
            onClick={handleChangeImageBtn}
            className="bg-red-600 hover:bg-red-700 shadow-lg w-5/12 py-2 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveBtn}
            className="bg-green-600 hover:bg-green-700 shadow-lg w-5/12 py-2 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const UploadImage = ({ handleUploadOption, handleImageChangeBtn }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false); // Added loading state
  const userId = useSelector((state) => state.user.value);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file (JPEG, PNG)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image to upload');
      return;
    }

    setIsUploading(true); // Set loading state
    const formData = new FormData();
    formData.append('profilePic', selectedFile); // Changed from 'profileImage' to 'profilePic' to match backend

    try {
      const token = localStorage.getItem('notebookToken');
      const response = await axios.put(
        `${apiRoutes.updateUserProfileURI}/${userId._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data && response.data.data) {
        dispatch(getData(response.data.data));
        toast.success('Profile image uploaded successfully');
        handleImageChangeBtn();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile image');
    } finally {
      setIsUploading(false); // Reset loading state
    }
  };

  return (
    <div className="w-full h-dvh z-20 fixed left-0 top-0 flex justify-center items-center background_color">
      <div className="w-10/12 md:w-8/12 lg:w-4/12 background_gradient_color p-4 rounded-md shadow-lg">
        <h2 className="text-xl font-bold text-center mb-4">Upload Profile Picture</h2>
        
        <div className="w-full flex flex-col items-center gap-4">
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-dashed border-gray-400 flex items-center justify-center">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-500 text-center p-4">
                <FaCamera className="text-4xl mx-auto mb-2" />
                <p>No image selected</p>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
          >
            Select Image
          </button>

            
          <div className="w-full flex justify-between gap-4">
            <button
              onClick={handleUploadOption}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded w-full"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full flex justify-center items-center gap-2"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeProfileImage;
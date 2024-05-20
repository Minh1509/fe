import React, { useState, useEffect, useRef } from "react";
import { Typography, Button, TextField } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./styles.css";

const fetchUserById = async (userId) => {
  try {
    const userDetails = await axios.get(
      `http://localhost:8081/api/user/${userId}`
    );
    return userDetails.data
      ? `${userDetails.data.first_name} ${userDetails.data.last_name}`
      : "Unknown User";
  } catch (error) {
    console.error("Error fetching user data:", error);
    return "Unknown User";
  }
};
const fetchUsersForComments = async (photos) => {
  try {
    // Map over all comments and fetch user details asynchronously
    const userPromises = photos.flatMap((photo) =>
      photo.comments.map((comment) => fetchUserById(comment.user_id))
    );
    const users = await Promise.all(userPromises);
    return users;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return [];
  }
};
function UserPhotos({ userLoginId }) {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [commentUsers, setCommentUsers] = useState([]);
  const [commentTexts, setCommentTexts] = useState([]);

  const fetchUserPhotos = async () => {
    try {
      const userPhotos = await axios.get(
        `http://localhost:8081/api/photo/photosOfUser/${userId}`
      );
      setPhotos(userPhotos.data);

      // Fetch user details
      const userDetails = await axios.get(
        `http://localhost:8081/api/user/${userId}`
      );
      setUser(userDetails.data);
    } catch (error) {
      console.error("Error fetching user photos:", error);
    }
  };
  useEffect(() => {
    fetchUserPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    // Fetch user details for all comments when photos change
    const fetchUsers = async () => {
      const users = await fetchUsersForComments(photos);
      setCommentUsers(users);
    };

    fetchUsers();
  }, [photos]);

  const handleCommentSubmit = async ({ photo }) => {
    try {
      const formData = {
        comment: commentTexts[photo._id],
        userId: photo.user_id,
      };
      const response = await axios.post(
        `http://localhost:8081/api/photo/commentsOfPhoto/${photo._id}`,
        formData
      );
      if (!response.data) {
        throw new Error("Failed to submit comment");
      }

      // Clear the comment input field
      setCommentTexts((prevState) => ({ ...prevState, [photo._id]: "" }));

      // Refetch the photos to update the comments
      fetchUserPhotos();
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };
  return (
    <div>
      <Typography variant="h4" className="header">
        User Photos
      </Typography>
      {userLoginId === userId && (
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/photos/add"
          className="add-photo-button"
        >
          Add Photo
        </Button>
      )}
      <div className="user-photos-container">
        {photos.map((photo) => (
          <div key={photo._id} className="photo-container">
            <img
              src={`http://localhost:8081/api/photo/images/${photo.file_name}`}
              alt={user?.first_name}
              className="photo"
              style={{ width: "200px", height: "200px" }}
            />
            <Typography className="posted-time">
              Posted time: {photo.date_time}
            </Typography>
         
            <div className="comment-input">
              <div className="comment-input-container">
                <TextField
                  label="Add a comment"
                  variant="outlined"
                  value={commentTexts[photo._id] || ""}
                  onChange={(e) =>
                    setCommentTexts((prevState) => ({
                      ...prevState,
                      [photo._id]: e.target.value,
                    }))
                  }
                  className="comment-textfield"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleCommentSubmit({ photo })}
                  className="add-comment-button"
                >
                  Add Comment
                </Button>
              </div>
            </div>
            {/* Display existing comments */}
            <Typography className="comments-header">Comments:</Typography>
            {photo.comments &&
              photo.comments.map((comment, commentIndex) => (
                <div
                  key={comment._id}
                  className={`comment ${
                    comment.user_id === userId
                      ? "user-comment"
                      : "other-comment"
                  }`}
                >
                  <Typography className="user">
                    {commentUsers[commentIndex]}{" "}
                  </Typography>
                  <Typography className="comment-comment">
                    {comment.comment}
                  </Typography>
                  <Typography className="comment-time">
                    ({comment.date_time})
                  </Typography>
                  <Typography className="comment-text"></Typography>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserPhotos;

"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";
const CREATE_PUJA_REVIEW = gql`
  mutation CreatePujaReview($input: CreatePujaReviewInput!) {
    createPujaReview(input: $input) {
      id
      pujaId
      userName
      title
      rating
      comment
      image
      status
      createdAt
    }
  }
`;

const UPLOAD_IMAGE = gql`
  mutation UploadImage($file: Upload!) {
    uploadImage(file: $file) {
      url
    }
  }
`;

export default function CreatePujaReview({ pujaId, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [reviewImage, setReviewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadImage, { loading: uploadingImage }] = useMutation(UPLOAD_IMAGE);

  const [createReview, { loading: submittingReview }] =
    useMutation(CREATE_PUJA_REVIEW);
  async function uploadToServer(file) {
    const res = await uploadImage({
      variables: { file },
    });

    return res.data?.uploadImage?.url ?? null;
  }
  const loading = uploadingImage || submittingReview;
  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!rating) {
      setFormError("Please select a rating.");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");

if (!storedUser) {
  throw new Error("Please login to submit a review.");
}

const parsedUser = JSON.parse(storedUser);
const userId = parsedUser.id;

if (!userId) {
  throw new Error("User ID not found. Please login again.");
}
      let finalImageUrl = null;

      // Upload image first using the existing GraphQL mutation
      if (reviewImage) {
        finalImageUrl = await uploadToServer(reviewImage);

        if (!finalImageUrl) {
          throw new Error("Image upload failed. Please try again.");
        }
      }

      // Save review with the uploaded image URL
      await createReview({
        variables: {
          input: {
            pujaId,
              userId,
            userName: userName.trim(),
            email: email.trim() || null,
            title: title.trim(),
            rating,
            comment: comment.trim(),
            image: finalImageUrl,
          },
        },
      });

      onSubmitted?.();
      onClose();
    } catch (error) {
      setFormError(
        error.message || "Unable to submit your review. Please try again.",
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl md:p-7"
      >
        <div className="flex items-center justify-between gap-4">
          <h2
            id="review-modal-title"
            className="text-xl font-semibold text-gray-900"
          >
            Write a review
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close review form"
            className="text-2xl text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rating
            </label>

            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} out of 5`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className={`text-3xl ${
                    star <= (hoverRating || rating)
                      ? "text-amber-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="review-title"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Review title
            </label>
            <input
              id="review-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              required
              placeholder="Give your review a title"
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="review-comment"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Review content
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              required
              rows={4}
              placeholder="Share your experience..."
              className="w-full resize-y rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="review-image"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Upload photo (optional)
            </label>

            <input
              id="review-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) return;

                if (file.size > 5 * 1024 * 1024) {
                  setFormError("Image size must be 5 MB or less.");
                  event.target.value = "";
                  return;
                }

                setFormError("");
                setReviewImage(file);
                setImagePreview(URL.createObjectURL(file));
              }}
              className="block w-full rounded-md border border-gray-300 p-3 text-sm"
            />

            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG or WebP. Maximum size: 5 MB.
            </p>

            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Review image preview"
                  className="h-32 w-32 rounded-lg border object-cover"
                />

                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(imagePreview);
                    setImagePreview("");
                    setReviewImage(null);
                  }}
                  className="mt-2 block text-sm text-red-600"
                >
                  Remove image
                </button>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="review-name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Display name
            </label>
            <input
              id="review-name"
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              required
              maxLength={100}
              placeholder="Name displayed publicly"
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="review-email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email address (optional)
            </label>
            <input
              id="review-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-amber-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Your email will not be displayed publicly.
            </p>
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}

          <p className="text-xs leading-5 text-gray-500">
            Reviews are submitted for approval before appearing publicly.
          </p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-amber-500 px-4 py-2 text-sm text-amber-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-amber-400 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

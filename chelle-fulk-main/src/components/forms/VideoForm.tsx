import React, { useState, FormEvent } from "react";
import Spinner from "../errors/Spinner";
import { submitVideo } from '../../services/apis/videoService';
import { VideoDTO } from '../../models/VideoDTO';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const initialState: VideoDTO = {
  id: 0,
  title: "",
  thumbnail: "",
  embedId: ""
};

export type ValidationErrors = Partial<{
  title: string;
  thumbnail: string;
  embedId: string;
}>;

interface VideoFormProps {
  onClose: () => void; // overlay click or X
  onCancel: () => void; // explicit cancel button
  form: VideoDTO;
  setForm: React.Dispatch<React.SetStateAction<VideoDTO>>;
  errors: ValidationErrors;
  setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

const VideoForm: React.FC<VideoFormProps> = ({ onClose, onCancel, form, setForm, errors, setErrors }) => {
  const { credentials } = useAdminAuth();

  const validate = (data: VideoDTO): ValidationErrors => {
    const errs: ValidationErrors = {};
  if (!data.title.trim()) errs.title = "Title is required.";
  if (!data.thumbnail.trim() || !/^https?:\/\/.+/.test(data.thumbnail.trim())) errs.thumbnail = "Thumbnail must be a valid URL.";
  if (!data.embedId.trim()) errs.embedId = "Embed ID is required.";
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setStatus({ success: false, message: "Please fix validation errors before submitting." });
      return;
    }
    setLoading(true);
    try {
      await submitVideo(form, credentials?.token);
      setStatus({ success: true, message: "Your video has been successfully submitted." });
      onClose();
    } catch (error: any) {
      setStatus({ success: false, message: error.message || "Failed to submit video." });
    } finally {
      setLoading(false);
    }
  };

  // Overlay click handler
  const handleOverlayClick = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-yellow-400 bg-opacity-30 flex justify-center items-start pt-20 z-50"
      aria-modal="true"
      role="dialog"
      onClick={handleOverlayClick}
    >
      <div
        className="max-w-3xl mx-auto p-8 bg-black rounded-lg shadow-lg font-serif text-yellow-300 w-full overflow-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-4xl mb-6 border-b border-yellow-600 pb-2 tracking-wider font-fell">
          Add New Video
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8 bg-gray-900 p-8 rounded-lg border border-yellow-700 shadow-inner" noValidate>
          {/* Title */}
          <div>
            <label htmlFor="title" className="block mb-1 font-fell tracking-wide">Title <span className="text-yellow-600">*</span></label>
            <input id="title" name="title" type="text" value={form.title} onChange={handleChange} className={`w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 bg-black text-yellow-300 placeholder-yellow-600 ${errors.title ? "border-red-600 focus:ring-red-600" : "border-yellow-700 focus:ring-yellow-600"}`} placeholder="Video Title" required />
            {errors.title && <p className="text-red-600 mt-1 text-sm">{errors.title}</p>}
          </div>
          {/* Thumbnail */}
          <div>
            <label htmlFor="thumbnail" className="block mb-1 font-fell tracking-wide">Thumbnail URL <span className="text-yellow-600">*</span></label>
            <input id="thumbnail" name="thumbnail" type="text" value={form.thumbnail} onChange={handleChange} className={`w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 bg-black text-yellow-300 placeholder-yellow-600 ${errors.thumbnail ? "border-red-600 focus:ring-red-600" : "border-yellow-700 focus:ring-yellow-600"}`} placeholder="https://example.com/thumbnail.jpg" required />
            {errors.thumbnail && <p className="text-red-600 mt-1 text-sm">{errors.thumbnail}</p>}
          </div>
          {/* Embed ID */}
          <div>
            <label htmlFor="embedId" className="block mb-1 font-fell tracking-wide">YouTube Embed ID <span className="text-yellow-600">*</span></label>
            <input id="embedId" name="embedId" type="text" value={form.embedId} onChange={handleChange} className={`w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 bg-black text-yellow-300 placeholder-yellow-600 ${errors.embedId ? "border-red-600 focus:ring-red-600" : "border-yellow-700 focus:ring-yellow-600"}`} placeholder="e.g. VQH8ZTgna3Q" required />
            {errors.embedId && <p className="text-red-600 mt-1 text-sm">{errors.embedId}</p>}
          </div>
          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8 items-center">
            <button type="button" onClick={onCancel} className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded font-fell">Cancel</button>
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded font-fell font-bold" disabled={loading}>
              {loading ? "Saving..." : "Save Video"}
            </button>
            {loading && <Spinner size={28} />}
          </div>
          {status && (
            <div className={`mt-4 text-lg font-semibold ${status.success ? 'text-green-400' : 'text-red-400'}`}
                 role="alert">
              {status.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default VideoForm;

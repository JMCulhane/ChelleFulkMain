import React, { useReducer, useState, FormEvent, useEffect } from "react";
import Spinner from "../errors/Spinner";
import { submitRecording } from '../../services/apis/recordingService';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface SampleDTO {
  trackName: string;
  audioUrl: string;
  duration?: number;
}

interface RecordingDTO {
  image: string;
  title: string;
  yearPublished: number;
  description: string;
  performers: string[];
  trackCount: number;
  link: string;
  samples: SampleDTO[];
}

export const initialSample: SampleDTO = { trackName: "", audioUrl: "", duration: undefined };

export const initialState: RecordingDTO = {
  image: "",
  title: "",
  yearPublished: new Date().getFullYear(),
  description: "",
  performers: [""],
  trackCount: 0,
  link: "",
  samples: [initialSample],
};

export type Action =
  | { type: "SET_FIELD"; field: keyof RecordingDTO; value: string | number }
  | { type: "SET_PERFORMER"; index: number; value: string }
  | { type: "ADD_PERFORMER" }
  | { type: "REMOVE_PERFORMER"; index: number }
  | { type: "SET_SAMPLE_FIELD"; index: number; field: keyof SampleDTO; value: string | number | undefined }
  | { type: "ADD_SAMPLE" }
  | { type: "REMOVE_SAMPLE"; index: number }
  | { type: "RESET" };

export function reducer(state: RecordingDTO, action: Action): RecordingDTO {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]:
          action.field === "yearPublished" || action.field === "trackCount"
            ? Number(action.value)
            : action.value,
      };
    case "SET_PERFORMER": {
      const updated = [...state.performers];
      updated[action.index] = action.value;
      return { ...state, performers: updated };
    }
    case "ADD_PERFORMER":
      return { ...state, performers: [...state.performers, ""] };
    case "REMOVE_PERFORMER": {
      const updated = state.performers.filter((_, i) => i !== action.index);
      return { ...state, performers: updated };
    }
    case "SET_SAMPLE_FIELD": {
      const updated = [...state.samples];
      updated[action.index] = {
        ...updated[action.index],
        [action.field]:
          action.field === "duration" && typeof action.value === "string"
            ? Number(action.value)
            : action.value,
      };
      return { ...state, samples: updated };
    }
    case "ADD_SAMPLE":
      return { ...state, samples: [...state.samples, initialSample] };
    case "REMOVE_SAMPLE": {
      const updated = state.samples.filter((_, i) => i !== action.index);
      return { ...state, samples: updated };
    }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// Validation errors type
export type ValidationErrors = Partial<{
  image: string;
  title: string;
  yearPublished: string;
  trackCount: string;
  performers: string[];
  samples: { trackName?: string; audioUrl?: string; duration?: string }[];
}>;


interface RecordingFormProps {
  onClose: () => void; // overlay click or X
  onCancel: () => void; // explicit cancel button
  form: RecordingDTO;
  dispatch: React.Dispatch<Action>;
  errors: ValidationErrors;
  setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

const RecordingForm: React.FC<RecordingFormProps> = ({ onClose, onCancel, form, dispatch, errors, setErrors }) => {
  const { credentials } = useAdminAuth();

  // File state for image and audio samples
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFiles, setAudioFiles] = useState<(File | null)[]>(() => Array(form.samples.length).fill(null));

  useEffect(() => {
    setAudioFiles(prev => {
      if (form.samples.length > prev.length) {
        return [...prev, ...Array(form.samples.length - prev.length).fill(null)];
      } else if (form.samples.length < prev.length) {
        return prev.slice(0, form.samples.length);
      }
      return prev;
    });
  }, [form.samples.length]);

  // Validation function
  const validate = (data: RecordingDTO): ValidationErrors => {
    const errs: ValidationErrors = {};
    // Image file required
    if (!imageFile) {
      errs.image = "Image file is required.";
    }

    // Title required
    if (!data.title.trim()) {
      errs.title = "Title is required.";
    }

    // Year Published reasonable range
    if (data.yearPublished < 1900 || data.yearPublished > new Date().getFullYear()) {
      errs.yearPublished = `Year must be between 1900 and ${new Date().getFullYear()}.`;
    }

    // Track Count non-negative
    if (data.trackCount < 0) {
      errs.trackCount = "Track count cannot be negative.";
    }

    // Validate performers: no empty strings
    const performerErrors = data.performers.map((p) =>
      !p.trim() ? "Performer name cannot be empty." : ""
    );
    if (performerErrors.some((e) => e)) {
      errs.performers = performerErrors;
    }

    // Validate samples: trackName and audio file required
    const sampleErrors = data.samples.map((sample, i) => {
      const sErr: { trackName?: string; audioUrl?: string; duration?: string } = {};
      if (!sample.trackName.trim()) sErr.trackName = "Track name is required.";
      if (!audioFiles[i]) sErr.audioUrl = "Audio file is required.";
      if (sample.duration !== undefined && sample.duration < 0) sErr.duration = "Duration cannot be negative.";
      return sErr;
    });
    if (sampleErrors.some((e) => Object.keys(e).length > 0)) {
      errs.samples = sampleErrors;
    }

    return errs;
  };

  // Validate on every form change (optional, for real-time feedback)
  useEffect(() => {
    setErrors(validate(form));
    // eslint-disable-next-line
  }, [form, setErrors]);

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
    // Build FormData for file upload
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("yearPublished", String(form.yearPublished));
    formData.append("description", form.description);
    formData.append("trackCount", String(form.trackCount));
    formData.append("link", form.link);
    form.performers.forEach((p, i) => formData.append(`performers[${i}]`, p));
    // Image file
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }
    // Audio sample files
    audioFiles.forEach((file, i) => {
      if (file) {
        formData.append(`audioFiles[${i}]`, file);
      }
    });
    // Sample meta
    form.samples.forEach((sample, i) => {
      formData.append(`samples[${i}][trackName]`, sample.trackName);
      formData.append(`samples[${i}][duration]`, sample.duration ? String(sample.duration) : "");
    });

    try {
      console.log("Trying to submit the data.")
      await submitRecording(formData, true, credentials?.token); // true = isMultipart
      setStatus({ success: true, message: "Your recording has been successfully submitted." });
      dispatch({ type: "RESET" });
      onClose();
    } catch (error: any) {
      setStatus({ success: false, message: error.message || "Failed to submit recording." });
    } finally {
      setLoading(false);
    }
  };

  // Handler for clicking outside modal: just close, do not reset form
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
          Add New Recording
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8 bg-gray-900 p-8 rounded-lg border border-yellow-700 shadow-inner" noValidate>
          {/* Image URL */}
          <div>
            <label htmlFor="imageFile" className="block mb-1 font-fell tracking-wide">
              Image File <span className="text-yellow-600">*</span>
            </label>
            <input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files && e.target.files[0];
                setImageFile(file || null);
                dispatch({ type: "SET_FIELD", field: "image", value: file ? file.name : "" });
              }}
              className="w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 bg-black text-yellow-300 placeholder-yellow-600 border-yellow-700 focus:ring-yellow-600"
              required
            />
            {errors.image && <p className="text-red-600 mt-1 text-sm">{errors.image}</p>}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block mb-1 font-fell tracking-wide">
              Title <span className="text-yellow-600">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={(e) =>
                dispatch({ type: "SET_FIELD", field: "title", value: e.target.value })
              }
              className={`w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 bg-black text-yellow-300 placeholder-yellow-600
                ${errors.title ? "border-red-600 focus:ring-red-600" : "border-yellow-700 focus:ring-yellow-600"}`}
              placeholder="Recording Title"
              required
            />
            {errors.title && <p className="text-red-600 mt-1 text-sm">{errors.title}</p>}
          </div>

          {/* Year Published */}
          <div>
            <label htmlFor="yearPublished" className="block mb-1 font-fell tracking-wide">
              Year Published
            </label>
            <input
              id="yearPublished"
              name="yearPublished"
              type="number"
              min={1900}
              max={new Date().getFullYear()}
              value={form.yearPublished}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "yearPublished",
                  value: Number(e.target.value),
                })
              }
              className={`w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 bg-black text-yellow-300 placeholder-yellow-600
                ${errors.yearPublished ? "border-red-600 focus:ring-red-600" : "border-yellow-700 focus:ring-yellow-600"}`}
            />
            {errors.yearPublished && <p className="text-red-600 mt-1 text-sm">{errors.yearPublished}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block mb-1 font-fell tracking-wide">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={(e) =>
                dispatch({ type: "SET_FIELD", field: "description", value: e.target.value })
              }
              className="w-full border border-yellow-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 bg-black text-yellow-300 placeholder-yellow-600 resize-none"
              placeholder="Brief description"
            />
          </div>

          {/* Performers */}
          <div>
            <label className="block mb-1 font-fell tracking-wide">Performers</label>
            {form.performers.map((performer, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={performer}
                  onChange={(e) =>
                    dispatch({ type: "SET_PERFORMER", index: i, value: e.target.value })
                  }
                  className={`flex-grow border rounded-md px-4 py-3 focus:outline-none focus:ring-2 bg-black text-yellow-300 placeholder-yellow-600
                    ${
                      errors.performers && errors.performers[i]
                        ? "border-red-600 focus:ring-red-600"
                        : "border-yellow-700 focus:ring-yellow-600"
                    }`}
                  placeholder={`Performer ${i + 1}`}
                />
                {form.performers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "REMOVE_PERFORMER", index: i })}
                    className="text-yellow-400 hover:text-yellow-600 px-2"
                    aria-label={`Remove performer ${i + 1}`}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            {errors.performers && errors.performers.some((e) => e) && (
              <p className="text-red-600 mt-1 text-sm">
                Please fill out all performer names.
              </p>
            )}
            <button
              type="button"
              onClick={() => dispatch({ type: "ADD_PERFORMER" })}
              className="text-yellow-400 hover:text-yellow-600"
            >
              + Add Performer
            </button>
          </div>

          {/* Track Count */}
          <div>
            <label htmlFor="trackCount" className="block mb-1 font-fell tracking-wide">
              Track Count
            </label>
            <input
              id="trackCount"
              name="trackCount"
              type="number"
              min={0}
              value={form.trackCount}
              onChange={(e) =>
                dispatch({ type: "SET_FIELD", field: "trackCount", value: Number(e.target.value) })
              }
              className={`w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 bg-black text-yellow-300 placeholder-yellow-600
                ${errors.trackCount ? "border-red-600 focus:ring-red-600" : "border-yellow-700 focus:ring-yellow-600"}`}
            />
            {errors.trackCount && <p className="text-red-600 mt-1 text-sm">{errors.trackCount}</p>}
          </div>

          {/* Link */}
          <div>
            <label htmlFor="link" className="block mb-1 font-fell tracking-wide">
              Link
            </label>
            <input
              id="link"
              name="link"
              type="text"
              value={form.link}
              onChange={(e) =>
                dispatch({ type: "SET_FIELD", field: "link", value: e.target.value })
              }
              className="w-full border border-yellow-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 bg-black text-yellow-300 placeholder-yellow-600"
              placeholder="https://example.com"
            />
          </div>

          {/* Samples */}
          <div>
            <label className="block mb-1 font-fell tracking-wide">Samples</label>
            {form.samples.map((sample, i) => (
              <div
                key={i}
                className="mb-4 p-4 bg-gray-900 rounded border border-yellow-700"
              >
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Track Name"
                    value={sample.trackName}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_SAMPLE_FIELD",
                        index: i,
                        field: "trackName",
                        value: e.target.value,
                      })
                    }
                    className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 bg-black text-yellow-300 placeholder-yellow-600
                      ${
                        errors.samples &&
                        errors.samples[i] &&
                        errors.samples[i].trackName
                          ? "border-red-600 focus:ring-red-600"
                          : "border-yellow-700 focus:ring-yellow-600"
                      }`}
                  />
                  {errors.samples && errors.samples[i] && errors.samples[i].trackName && (
                    <p className="text-red-600 text-sm">{errors.samples[i].trackName}</p>
                  )}

                  <input
                    type="file"
                    accept="audio/*"
                    onChange={e => {
                      const file = e.target.files && e.target.files[0];
                      setAudioFiles(prev => {
                        const updated = [...prev];
                        updated[i] = file || null;
                        return updated;
                      });
                      dispatch({
                        type: "SET_SAMPLE_FIELD",
                        index: i,
                        field: "audioUrl",
                        value: file ? file.name : ""
                      });
                    }}
                    className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 bg-black text-yellow-300 placeholder-yellow-600
                      ${
                        errors.samples &&
                        errors.samples[i] &&
                        errors.samples[i].audioUrl
                          ? "border-red-600 focus:ring-red-600"
                          : "border-yellow-700 focus:ring-yellow-600"
                      }`}
                  />
                  {errors.samples && errors.samples[i] && errors.samples[i].audioUrl && (
                    <p className="text-red-600 text-sm">{errors.samples[i].audioUrl}</p>
                  )}

                  <input
                    type="number"
                    min={0}
                    placeholder="Duration (seconds)"
                    value={sample.duration ?? ""}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_SAMPLE_FIELD",
                        index: i,
                        field: "duration",
                        value: e.target.value,
                      })
                    }
                    className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 bg-black text-yellow-300 placeholder-yellow-600
                      ${
                        errors.samples &&
                        errors.samples[i] &&
                        errors.samples[i].duration
                          ? "border-red-600 focus:ring-red-600"
                          : "border-yellow-700 focus:ring-yellow-600"
                      }`}
                  />
                  {errors.samples && errors.samples[i] && errors.samples[i].duration && (
                    <p className="text-red-600 text-sm">{errors.samples[i].duration}</p>
                  )}

                  {form.samples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "REMOVE_SAMPLE", index: i })}
                      className="self-end text-yellow-400 hover:text-yellow-600"
                    >
                      Remove Sample
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => dispatch({ type: "ADD_SAMPLE" })}
              className="text-yellow-400 hover:text-yellow-600"
            >
              + Add Sample
            </button>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8 items-center">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded font-fell"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded font-fell font-bold"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Recording"}
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

export default RecordingForm;

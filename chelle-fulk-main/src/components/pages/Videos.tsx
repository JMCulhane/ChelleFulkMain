import React, { useState, useEffect } from 'react';
import Spinner from '../errors/Spinner';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { initialState as videoInitialState, ValidationErrors as VideoValidationErrors } from '../forms/VideoForm';
import { getVideos, deleteVideo } from '../../services/apis/videoService';
import VideoForm from '../forms/VideoForm';
import { PlayIcon, TrashIcon } from '@heroicons/react/24/solid';
import PaddingWrapper from '../styling/PaddingWrapper';
import { VideoDTO } from '../../models/VideoDTO';



const Videos = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoDTO | null>(null);
  const { credentials } = useAdminAuth();
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoForm, setVideoForm] = useState(videoInitialState);
  const [videoErrors, setVideoErrors] = useState<VideoValidationErrors>({});
  const [videos, setVideos] = useState<VideoDTO[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let didCancel = false;
    setLoading(true);
    (async () => {
      try {
        const backendVideos = await getVideos();
        if (!didCancel && Array.isArray(backendVideos)) {
          setVideos(backendVideos);
        }
      } catch (err) {
        if (!didCancel) setVideos([]);
      } finally {
        if (!didCancel) setLoading(false);
      }
    })();
    return () => { didCancel = true; };
  }, []);

  const openVideo = (video: VideoDTO) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <PaddingWrapper mdPadding="md:pt-12 md:p-8">
      <div className="text-white min-h-screen">
        {/* Header */}
        <div className="px-6 py-8 flex items-center justify-between">
          <h1 className="text-4xl font-fell mb-6 border-b border-yellow-600 pb-2 tracking-wider text-yellow-300">
            Videos
          </h1>
          {credentials && (
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-fell font-bold px-6 py-2 rounded shadow"
              onClick={() => setShowVideoForm(true)}
            >
              + Add New Video
            </button>
          )}
        </div>

        {/* Delete Error Message */}
        {deleteError && (
          <div className="px-6 pb-2">
            <div className="bg-red-700 text-white rounded px-4 py-2 mb-4">
              {deleteError}
            </div>
          </div>
        )}
        {/* Videos Grid or Spinner */}
        <div className="px-6 pb-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[12rem]">
              <Spinner size={96} centered />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="group cursor-pointer relative"
                  onClick={() => openVideo(video)}
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <PlayIcon className="w-6 h-6 text-black" />
                      </div>
                    </div>
                    {/* Delete Button (admin only) */}
                    {credentials && (
                      <button
                        className="absolute top-2 left-2 z-10"
                        title="Delete Video"
                        onClick={async e => {
                          e.stopPropagation();
                          try {
                            await deleteVideo(video.id, credentials?.token);
                            setVideos(videos => videos.filter(v => v.id !== video.id));
                            setDeleteError(null);
                          } catch (err: any) {
                            setDeleteError('Failed to delete video: ' + (err.message || 'Unknown error'));
                          }
                        }}
                      >
                        <TrashIcon className="h-5 w-5 text-yellow-400 mt-1" />
                      </button>
                    )}
                  </div>
                  {/* Video Info */}
                  <div className="pt-3">
                    <h3 className="text-lg font-light leading-tight group-hover:text-gray-300 transition-colors duration-200">
                      {video.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl">
              {/* Close Button */}
              <button
                onClick={closeVideo}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl font-light"
              >
                ✕ CLOSE
              </button>
              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.embedId}?autoplay=1`}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              {/* Video Title */}
              <div className="mt-4">
                <h2 className="text-2xl font-light text-white">{selectedVideo.title}</h2>
              </div>
            </div>
          </div>
        )}

        {/* Video Form Modal */}
        {showVideoForm && (
          <VideoForm
            onClose={async () => {
              setShowVideoForm(false);
              // Re-fetch videos after successful create
              try {
                const backendVideos = await getVideos();
                setVideos(Array.isArray(backendVideos) ? backendVideos : []);
              } catch {
                setVideos([]);
              }
            }}
            onCancel={() => {
              setVideoForm(videoInitialState);
              setVideoErrors({});
              setShowVideoForm(false);
            }}
            form={videoForm}
            setForm={setVideoForm}
            errors={videoErrors}
            setErrors={setVideoErrors}
          />
        )}
      </div>
    </PaddingWrapper>
  );
};

export default Videos;
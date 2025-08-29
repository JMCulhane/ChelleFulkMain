import React, { useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';
import PaddingWrapper from '../styling/PaddingWrapper';
import { VideoDTO } from '../../models/VideoDTO';

const Videos = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoDTO | null>(null);
  
  // Sample video data - replace with your actual video data
  const videos = [
    {
      id: 1,
      title: "R U Mine?",
      thumbnail: "https://img.youtube.com/vi/VQH8ZTgna3Q/maxresdefault.jpg",
      embedId: "VQH8ZTgna3Q",
      year: "2013"
    },
    {
      id: 2,
      title: "Do I Wanna Know?",
      thumbnail: "https://img.youtube.com/vi/bpOSxM0rNPM/maxresdefault.jpg",
      embedId: "bpOSxM0rNPM",
      year: "2013"
    },
    {
      id: 3,
      title: "I Bet You Look Good on the Dancefloor",
      thumbnail: "https://img.youtube.com/vi/pK7egZaT3hs/maxresdefault.jpg",
      embedId: "pK7egZaT3hs",
      year: "2005"
    },
    {
      id: 4,
      title: "Fluorescent Adolescent",
      thumbnail: "https://img.youtube.com/vi/ma9I9VBKPiw/maxresdefault.jpg",
      embedId: "ma9I9VBKPiw",
      year: "2007"
    },
    {
      id: 5,
      title: "505",
      thumbnail: "https://img.youtube.com/vi/qU9mHegkTc4/maxresdefault.jpg",
      embedId: "qU9mHegkTc4",
      year: "2007"
    },
    {
      id: 6,
      title: "Cornerstone",
      thumbnail: "https://img.youtube.com/vi/LIQz6zZi7R0/maxresdefault.jpg",
      embedId: "LIQz6zZi7R0",
      year: "2009"
    },
    {
      id: 7,
      title: "Tranquility Base Hotel & Casino",
      thumbnail: "https://img.youtube.com/vi/KQu8FOjJXdI/maxresdefault.jpg",
      embedId: "KQu8FOjJXdI",
      year: "2018"
    },
    {
      id: 8,
      title: "Body Paint",
      thumbnail: "https://img.youtube.com/vi/hFC65C6I5to/maxresdefault.jpg",
      embedId: "hFC65C6I5to",
      year: "2022"
    }
  ];

  const openVideo = (video: VideoDTO) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <PaddingWrapper>
        <div className="text-white min-h-screen">
        {/* Header */}
        <div className="px-6 py-8">
            <h1 className="text-4xl font-fell mb-6 border-b border-yellow-600 pb-2 tracking-wider text-yellow-300">
            Videos
            </h1>
        </div>

        {/* Videos Grid */}
        <div className="px-6 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
                <div
                key={video.id}
                className="group cursor-pointer"
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
                    
                    {/* Year Badge */}
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 px-2 py-1 text-xs font-mono">
                    {video.year}
                    </div>
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
                <p className="text-gray-400 mt-1">{selectedVideo.year}</p>
                </div>
            </div>
            </div>
        )}
        </div>
    </PaddingWrapper>
  );
};

export default Videos;
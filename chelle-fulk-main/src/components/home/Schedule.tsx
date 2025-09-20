import { JSX, useEffect, useState } from "react";
import { GigsDTO } from "../../models/GigsDTO";
import PaddingWrapper from "../styling/PaddingWrapper";
import ScaleOnScroll from "../styling/ScaleOnScroll";
import { getSchedule } from "../../services/apis/scheduleService";
import { MapPinIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";
import Spinner from "../errors/Spinner";
import { data } from "react-router-dom";

const GIGS_PER_PAGE = 5;

const Schedule: React.FC = (): JSX.Element => {
  const [gigData, setGigData] = useState<GigsDTO[] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);

  useEffect(() => {
    getSchedule().then((data) => {
      setGigData(data as GigsDTO[]);
    });
  }, []);

  if (!gigData) {
    return <Spinner fullScreen size={192} />;
  }

  const totalPages = Math.ceil(gigData.length / GIGS_PER_PAGE);
  const start = currentPage * GIGS_PER_PAGE;
  const currentGigs = gigData.slice(start, start + GIGS_PER_PAGE);

  const handlePrev = () => setCurrentPage((p) => Math.max(0, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <ScaleOnScroll>
      <PaddingWrapper>
        <div className="overflow-hidden flex justify-center items-center ">
          <ul 
          role="list"
          className="divide-y divide-white px-4 sm:px-6 md:px-8 overflow-y-auto"
          style={{ minHeight: '36rem', maxHeight: '36rem' }}>
            {currentGigs.map((gig, index) => (
              <li
                key={`${start + index}`}
                className="grid grid-cols-[260px_1fr_auto] items-start gap-x-6 py-5"
              >
                <div className="flex flex-col items-center justify-center font-fell text-base">
                  <p className="text-2xl whitespace-nowrap">{gig.date}</p>
                  <p className="text-2xl">
                    {gig.startTime}
                    {gig.endTime && gig.endTime.trim() !== '' ? ` - ${gig.endTime}` : ''}
                  </p>
                </div>

                <div className="flex flex-col font-fell text-base">
                  <p className="text-3xl text-yellow-400">{gig.event}</p>

                  {gig.ensemble && (
                    <p className="flex items-center gap-x-2 text-base mt-1" style={{ lineHeight: 1 }}>
                      <MusicalNoteIcon
                        className="h-5 w-5 text-yellow-400 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>{gig.ensemble}</span>
                    </p>
                  )}

                  {gig.venue && (
                    <p className="flex items-center gap-x-2 text-base mt-1" style={{ lineHeight: 1 }}>
                      <MapPinIcon
                        className="h-5 w-5 text-yellow-400 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>{gig.venue}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center h-full">
                  {gig.ticketsOrInfoLink && gig.ticketsOrInfoLink.trim() !== '' && (
                    <a
                      href={gig.ticketsOrInfoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-yellow-400/80 rounded-md px-3 py-2 text-sm font-medium font-fell text-xl hover:bg-yellow-400"
                    >
                      Info
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="bg-yellow-400/80 text-white rounded-md px-3 py-2 text-sm font-medium font-fell text-xl hover:bg-yellow-400 disabled:opacity-50 disabled:hover:bg-yellow-400/80"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1}
              className="bg-yellow-400/80 text-white rounded-md px-3 py-2 text-sm font-medium font-fell text-xl hover:bg-yellow-400 disabled:opacity-50 disabled:hover:bg-yellow-400/80"
            >
              Next
            </button>
          </div>
        )}
      </PaddingWrapper>
    </ScaleOnScroll>
  );
};

export default Schedule;

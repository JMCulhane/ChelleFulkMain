export interface SampleDTO {
  id: number;
  trackName: string;
  audioUrl: string;
}

export interface RecordingDTO {
  id: number;
  image: string;
  title: string;
  yearPublished?: number;
  description: string;
  performers: string[];
  trackCount: number;
  link: string;
  samples: SampleDTO[];
}
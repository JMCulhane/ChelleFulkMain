export interface SampleDTO {
  trackName: string;
  audioUrl: string;
}

export interface RecordingDTO {
  image: string;
  title: string;
  yearPublished?: number;
  description: string;
  performers: string[];
  trackCount: number;
  link: string;
  samples: SampleDTO[];
}

import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

export const searchVideos = async (query) => {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: query,
      maxResults: 10,
    });
    return response.data.items;
  } catch (error) {
    console.error('Error searching videos:', error);
    throw new Error('Unable to search videos');
  }
};
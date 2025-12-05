# Video Analytics Dashboard Frontend

A React + TypeScript frontend for the Video Analytics & Streaming Dashboard.

## Features

- **Dashboard View**: Display all videos in a responsive grid
- **Video Upload**: Upload videos with title and description
- **Video Player**: Modal player with automatic view tracking
- **Like Functionality**: Like videos with optimistic UI updates
- **Real-time Status**: Shows video processing status (PENDING, PROCESSING, COMPLETED, FAILED)
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS

## Tech Stack

- React 19.2.0
- TypeScript
- Vite 7.2.2
- Tailwind CSS 3.4.13

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (or copy from `.env.example`):
```env
VITE_UPLOADER_API_URL=http://localhost:8081
VITE_ANALYTICS_API_URL=http://localhost:8083
VITE_S3_BUCKET_NAME=your-bucket-name
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Environment Variables

- `VITE_UPLOADER_API_URL`: URL of the uploader API service (default: http://localhost:8081)
- `VITE_ANALYTICS_API_URL`: URL of the analytics API service (default: http://localhost:8083)
- `VITE_S3_BUCKET_NAME`: S3 bucket name for constructing video URLs (optional, falls back to bucket from API response)

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx      # Main dashboard with tabs
│   ├── VideoCard.tsx      # Individual video card component
│   ├── VideoPlayer.tsx    # Modal video player
│   └── UploadForm.tsx     # Video upload form
├── services/
│   ├── uploadService.ts   # API calls for video uploads
│   └── analyticsService.ts # API calls for analytics
├── types/
│   └── index.ts           # TypeScript interfaces
├── utils/
│   └── videoUtils.ts      # Helper functions for video URLs
├── config/
│   └── env.ts             # Environment configuration
└── App.tsx                # Root component
```

## API Integration

The frontend integrates with two backend services:

1. **Uploader API** (`/api/videos`, `/api/upload`)
2. **Analytics API** (`/api/analytics/like`, `/api/analytics/view`, `/api/analytics/:videoId`)

## Docker

The frontend is containerized using a multi-stage Docker build:
- Build stage: Node.js to compile the React app
- Runtime stage: Nginx to serve static files

Port: 8080 (mapped to 3000 in docker-compose)

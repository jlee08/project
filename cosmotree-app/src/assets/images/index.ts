// Image metadata for TypeScript support
export interface ImageInfo {
  name: string;
  path: string;
  type: 'logo' | 'background' | 'decorative';
  description: string;
}

export const imageInfo: Record<string, ImageInfo> = {
  logo: {
    name: 'Cosmotree Logo',
    path: '/images/logo.png',
    type: 'logo',
    description: 'Main brand logo for Cosmotree application'
  },
  dashboardBg: {
    name: 'Dashboard Background',
    path: '/images/main-sec.png', 
    type: 'background',
    description: 'Background image for dashboard and main sections'
  },
  landingBg: {
    name: 'Landing Background',
    path: '/images/main-sec-01.png',
    type: 'background', 
    description: 'Background image for landing page'
  },
  navBg: {
    name: 'Navigation Background',
    path: '/images/planet.png',
    type: 'decorative',
    description: 'Planet decorative element for navigation'
  },
  quizzesBg: {
    name: 'Quizzes Background',
    path: '/images/quizzes-bg.png',
    type: 'background',
    description: 'Background image for quizzes section'
  },
  quizzesDetailBg: {
    name: 'Quiz Detail Background', 
    path: '/images/quizzes-detail-bg.png',
    type: 'background',
    description: 'Background image for individual quiz pages'
  }
};

// Export image names for easy reference
export type ImageName = keyof typeof imageInfo;
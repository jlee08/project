// SVG Icons
import RocketIcon from './rocket-icon.svg';
import ArrowBack from './arrow-back.svg';
import MoonStars from './moon-stars.svg';
import PlanetIcon from './planet.svg';
import BookIcon from './book.svg';
import NeurologyIcon from './neurologyIcon.svg';
import Stars2Icon from './stars2Icon.svg';
import LibraryBooksIcon from './libraryBooksIcon.svg';
import QuizCheckIcon from './quiz-check.svg';
import QuizCancelIcon from './quiz-cancel.svg';

// Icon metadata for TypeScript support
export interface IconInfo {
  name: string;
  component: string;
  size: string;
  description: string;
}

export const iconInfo: Record<string, IconInfo> = {
  rocket: {
    name: 'Rocket',
    component: 'RocketIcon',
    size: '24x24',
    description: 'Rocket launch icon for space exploration themes'
  },
  arrowBack: {
    name: 'Arrow Back',
    component: 'ArrowBack',
    size: '16x16',
    description: 'Navigation back arrow icon'
  },
  arrow: {
    name: 'Arrow',
    component: 'ArrowBack',
    size: '16x16', 
    description: 'General purpose arrow icon (uses arrow-back.svg)'
  },
  moonStars: {
    name: 'Moon & Stars',
    component: 'MoonStars',
    size: '51x50',
    description: 'Night sky with moon and stars icon'
  },
  planet: {
    name: 'Planet',
    component: 'PlanetIcon',
    size: '27x27',
    description: 'Planet icon for cosmic themes'
  },
  book: {
    name: 'Book',
    component: 'BookIcon',
    size: '22x27',
    description: 'Learning and education book icon'
  },
  neurology: {
    name: 'Neurology',
    component: 'NeurologyIcon',
    size: '21x21',
    description: 'Neurology brain science icon for medical and science themes'
  },
  stars2: {
    name: 'Stars 2',
    component: 'Stars2Icon', 
    size: '21x20',
    description: 'Two stars rating icon for scoring and evaluation'
  },
  libraryBooks: {
    name: 'Library Books',
    component: 'LibraryBooksIcon',
    size: '20x20',
    description: 'Books library icon for learning and educational content'
  },
  quizCheck: {
    name: 'Quiz Check',
    component: 'QuizCheckIcon',
    size: '60x61',
    description: 'Green checkmark icon for correct quiz answers'
  },
  quizCancel: {
    name: 'Quiz Cancel',
    component: 'QuizCancelIcon',
    size: '60x61',
    description: 'Red X icon for incorrect quiz answers'
  }
};

// Export all icons
export {
  RocketIcon,
  ArrowBack,
  MoonStars,
  PlanetIcon,
  BookIcon,
  NeurologyIcon,
  Stars2Icon,
  LibraryBooksIcon,
  QuizCheckIcon,
  QuizCancelIcon
};

// Export icon names for easy reference
export type IconName = keyof typeof iconInfo;

// Ensure this file is treated as a module
export {};

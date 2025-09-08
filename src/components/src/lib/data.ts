import type { User, Project } from './types';

// This is now mock data. In a real application, you would fetch this from your backend.
// The user information will be replaced by the authenticated user from Appwrite.

export const users: User[] = [
  {
    id: '1',
    name: 'Ada Lovelace',
    username: 'ada',
    bio: 'Pioneering computer programmer & writer. Known for my work on Charles Babbage\'s proposed mechanical general-purpose computer, the Analytical Engine.',
    avatarUrl: 'https://picsum.photos/id/1027/200/200',
    githubUrl: 'https://github.com/ada',
    linkedinUrl: 'https://linkedin.com/in/ada',
    email: 'ada@example.com',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js', 'GraphQL'],
    softSkills: ['Problem-solving', 'Communication', 'Creativity', 'Attention to detail'],
    contribution: 'I excel at bridging the gap between technical and non-technical stakeholders, ensuring clear communication and project alignment. I bring a passion for finding elegant solutions to complex problems.'
  },
  {
    id: '2',
    name: 'Grace Hopper',
    username: 'grace',
    bio: 'American computer scientist and United States Navy rear admiral. One of the first programmers of the Harvard Mark I computer.',
    avatarUrl: 'https://picsum.photos/id/1012/200/200',
    githubUrl: 'https://github.com/grace',
    linkedinUrl: 'https://linkedin.com/in/grace',
    email: 'grace@example.com',
    skills: ['Vue.js', 'JavaScript', 'CSS', 'HTML', 'Firebase'],
  },
];


// This function is now deprecated as we are moving to Appwrite for user management.
// It is kept for reference but should not be used in new code.
export const getCurrentUser = (): User => users[0];

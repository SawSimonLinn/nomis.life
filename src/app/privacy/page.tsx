
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Privacy Policy for Nomis.Life</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/80">
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <p>
                Welcome to Nomis.Life ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>

            <h2 className="text-xl font-semibold pt-4">1. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>

            <h3 className="text-lg font-semibold pt-2 pl-4">A. Personal Data</h3>
            <p className="pl-4">
                When you register on Nomis.Life using your GitHub account, we collect personal information that you provide to us directly or that is made available through GitHub's API. This includes:
            </p>
            <ul className="list-disc pl-12 space-y-1">
                <li><strong>Identity Information:</strong> Your name, username, email address, and avatar URL.</li>
                <li><strong>Profile Information:</strong> Your bio, GitHub profile URL, and any other public information from your GitHub profile.</li>
                <li><strong>User-Provided Content:</strong> Information you voluntarily add to your profile, such as your selected career path, hard and soft skills, "What I bring to the table" statement, contact information (LinkedIn URL, portfolio URL, public email, phone number), and your resume if you choose to upload one.</li>
                <li><strong>Project Information:</strong> Details about the projects you add, including repository URLs, descriptions, technologies used, images, and other related content.</li>
                <li><strong>Community Interactions:</strong> Reviews you leave on projects and messages you send in the community chat.</li>
            </ul>

            <h3 className="text-lg font-semibold pt-2 pl-4">B. AI-Generated Data</h3>
            <p className="pl-4">
                To enhance your experience, we use generative AI models (via Google's Genkit) to process information you provide. This includes:
            </p>
             <ul className="list-disc pl-12 space-y-1">
                <li>Generating rewritten project descriptions, features, challenges, and learnings based on your input.</li>
                <li>Generating a professional "What I bring to the table" statement from your keywords.</li>
                <li>Suggesting a tech stack based on your GitHub repository analysis.</li>
                <li>Rewriting your review comments for clarity and tone.</li>
            </ul>
            <p className="pl-4 pt-2">The inputs you provide are sent to our AI service provider to generate this content. We do not use your personal data to train these AI models.</p>


            <h3 className="text-lg font-semibold pt-2 pl-4">C. Derivative Data</h3>
            <p className="pl-4">
                Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
            </p>

            <h2 className="text-xl font-semibold pt-4">2. How We Use Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
            <ul className="list-disc pl-8 space-y-1">
                <li>Create and manage your account and public portfolio.</li>
                <li>Display your profile and projects to other users and the public.</li>
                <li>Enable user-to-user communications (reviews and chat).</li>
                <li>Personalize your experience by suggesting skills and content relevant to your selected career path.</li>
                <li>Operate and improve our AI-powered content generation features.</li>
                <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                <li>Respond to your comments, questions, and provide customer service.</li>
            </ul>

            <h2 className="text-xl font-semibold pt-4">3. Disclosure of Your Information</h2>
            <p>We do not sell your personal information. We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
            <ul className="list-disc pl-8 space-y-1">
                <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data storage (Appwrite) and AI content generation (Google AI). We only share the minimum information necessary for them to perform their designated functions.</li>
                <li><strong>Publicly Visible Information:</strong> Your public profile, including your name, username, bio, skills, and projects, is visible to anyone who visits the Site. Content you post in public areas, such as reviews, will be publicly visible.</li>
            </ul>

            <h2 className="text-xl font-semibold pt-4">4. Data Security</h2>
            <p>
                We use administrative, technical, and physical security measures to help protect your personal information. We rely on the security protocols of our third-party provider, Appwrite, for database security, authentication, and file storage. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>

            <h2 className="text-xl font-semibold pt-4">5. Your Data Rights</h2>
            <p>You have rights over your personal data. You can:</p>
            <ul className="list-disc pl-8 space-y-1">
                <li><strong>Access and Update Your Information:</strong> You may review and change the information in your account at any time by logging into your dashboard.</li>
                <li><strong>Delete Your Information:</strong> You can delete your projects from the dashboard. To delete your entire account and associated data, please contact us at the email address provided below.</li>
            </ul>

            <h2 className="text-xl font-semibold pt-4">6. Policy for Children</h2>
            <p>We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.</p>


            <h2 className="text-xl font-semibold pt-4">7. Changes to This Privacy Policy</h2>
            <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
            
            <h2 className="text-xl font-semibold pt-4">8. Contact Us</h2>
            <p>
                If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:simon@sawsimonlinn.com" className="text-primary hover:underline">simon@sawsimonlinn.com</a>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

    
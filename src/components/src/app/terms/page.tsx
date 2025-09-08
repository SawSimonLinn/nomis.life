
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/80">
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <p>
              Welcome to Nomis.Life ("we," "our," or "us"). By accessing or using our website and services (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
            </p>

            <h2 className="text-xl font-semibold pt-4">1. Acceptance of Terms</h2>
            <p>
              By creating an account, showcasing projects, or using any part of our Service, you represent that you have read, understood, and agree to be bound by these Terms.
            </p>

            <h2 className="text-xl font-semibold pt-4">2. Use of the Service</h2>
            <p>
              You agree to use the Service only for its intended purposes: to create a professional portfolio, showcase your work, interact with the community, and provide constructive feedback. You are responsible for all content you post and for your interactions with other users.
            </p>

            <h2 className="text-xl font-semibold pt-4">3. User Content</h2>
            <p>
              You retain ownership of the content you submit to the Service, including your project details, reviews, and profile information ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, display, and distribute your User Content in connection with operating and promoting the Service.
            </p>

            <h2 className="text-xl font-semibold pt-4">4. Prohibited Activities</h2>
            <p>You agree not to engage in any of the following prohibited activities:</p>
            <ul className="list-disc pl-8 space-y-1">
                <li>Using the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
                <li>Posting content that is hateful, defamatory, obscene, or harassing.</li>
                <li>Impersonating any person or entity, or falsely stating or otherwise misrepresenting your affiliation with a person or entity.</li>
                <li>Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Service.</li>
                <li>Uploading invalid data, viruses, worms, or other software agents through the Service.</li>
            </ul>

            <h2 className="text-xl font-semibold pt-4">5. AI-Generated Content</h2>
            <p>
              Our Service uses generative AI to help you create content for your portfolio. While we strive to provide high-quality output, we do not guarantee the accuracy, completeness, or suitability of AI-generated text. You are responsible for reviewing and editing all AI-generated content before publishing it on your profile.
            </p>

            <h2 className="text-xl font-semibold pt-4">6. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service at any time, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
            </p>

            <h2 className="text-xl font-semibold pt-4">7. Disclaimers</h2>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, express or implied, regarding the operation of our Service or the information, content, or materials included therein.
            </p>

            <h2 className="text-xl font-semibold pt-4">8. Changes to These Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
            </p>

            <h2 className="text-xl font-semibold pt-4">9. Contact Us</h2>
            <p>
                If you have any questions about these Terms, please contact us at: <a href="mailto:simon@sawsimonlinn.com" className="text-primary hover:underline">simon@sawsimonlinn.com</a>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

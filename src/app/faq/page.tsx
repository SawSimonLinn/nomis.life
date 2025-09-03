
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const faqs = [
    {
        question: "What is Nomis.Life?",
        answer: "Nomis.Life is a platform that turns your GitHub profile into a full-featured public portfolio automatically. It's designed for developers, data scientists, designers, and anyone in tech to showcase their work, get feedback, and connect with a community."
    },
    {
        question: "How do I add a project to my portfolio?",
        answer: "Once you sign in with your GitHub account, you'll be taken to your dashboard. From there, you can click 'Add Project' and provide a link to your GitHub repository. The platform will automatically pull in details, and you can use AI to help write descriptions, features, and more."
    },
    {
        question: "Is it free to use?",
        answer: "Yes, the core features of Nomis.Life, including creating a portfolio and showcasing projects, are completely free."
    },
    {
        question: "What kind of feedback can I get on my projects?",
        answer: "Other users in the community can leave reviews on your projects, including a star rating and written comments. This is a great way to get constructive feedback on your work."
    },
     {
        question: "How is my data used?",
        answer: "We use your GitHub data to populate your portfolio. We respect your privacy. For more details, please see our Privacy Policy."
    }
]

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                     <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

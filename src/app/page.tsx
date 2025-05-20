import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Link from "next/link";
import Image from "next/image";
import { Wand2, Zap, Rocket, History } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-16 sm:py-24 text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6">
            Unleash Your Creativity with <span className="text-primary">Renderri</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-foreground/80 mb-10">
            Generate stunning images from text, edit with ease, and enhance quality using the power of AI.
            Start creating today!
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/generate">
                <Wand2 className="mr-2" /> Get Started
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-16 sm:py-24 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Wand2 className="h-12 w-12 text-primary mb-4" />}
                title="AI Image Generation"
                description="Transform your textual ideas into captivating visuals. Limited to 50 free generations per week."
              />
              <FeatureCard
                icon={<Zap className="h-12 w-12 text-primary mb-4" />}
                title="Image Enhancement"
                description="Upscale resolution and improve the quality of your images with our AI-powered enhancement tool."
              />
              <FeatureCard
                icon={<History className="h-12 w-12 text-primary mb-4" />}
                title="Prompt History"
                description="Keep track of all your generated images and the prompts that created them for easy reference."
              />
            </div>
          </div>
        </section>
        
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 text-center">
             <div className="max-w-3xl mx-auto mb-12">
                <Image 
                    src="https://erfuoutzrqhpdjnzemyd.supabase.co/storage/v1/object/public/chat-attachments//Generated%20Image%20May%2020,%202025%20-%2010_58PM.jpeg" 
                    alt="Renderri app showcase" 
                    width={1024} 
                    height={512} 
                    className="rounded-lg shadow-2xl"
                    data-ai-hint="product interface" 
                />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Create?</h2>
            <p className="max-w-xl mx-auto text-lg text-foreground/80 mb-8">
              Join Renderri and start bringing your imagination to life.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">
              <Link href="/signup">Sign Up For Free</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-background p-6 rounded-lg shadow-lg text-center border border-border">
      <div className="flex justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mt-4 mb-2">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="py-8 border-t border-border/40">
      <div className="container mx-auto px-4 text-center text-foreground/60">
        <p>&copy; {new Date().getFullYear()} Renderri. All rights reserved.</p>
        <p className="text-sm mt-1">Powered by Creativity and AI</p>
      </div>
    </footer>
  );
}

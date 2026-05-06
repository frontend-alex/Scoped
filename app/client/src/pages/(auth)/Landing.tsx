import { Navbar1 } from "@/components/navbar";
import { About3 } from "@/components/pages/landing/landing-about";
import { Hero115 } from "@/components/pages/landing/landing-hero";
import { Footer2 } from "@/components/footer";
const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto">
        <Navbar1 />
        <main>
          <Hero115 />
          <About3 />
        </main>
      </div>
      <Footer2 />
    </div>
  );
};

export default Landing;

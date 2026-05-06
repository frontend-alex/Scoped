import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroImage = {
  src: string;
  alt: string;
  srcDark?: string;
};

type HeroButton = {
  text: string;
  url: string;
};

type Hero115Props = {
  heading?: string;
  description?: string;
  button?: HeroButton;
  image?: HeroImage;
  byline?: string;
  className?: string;
  icon?: ReactNode;
};

const defaultImage = {
  src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas/saas-1-16x9.png",
  srcDark:
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas/saas-1-16x9-dark.png",
  alt: "Scoped dashboard analysis preview",
};

const Hero115 = ({
  heading = "Analyze dashboards for IBCS compliance with clarity.",
  description = "Scoped helps teams upload dashboards, detect visual elements, and review structured compliance feedback in one clean workflow.",
  button = { text: "Start analyzing", url: "/register" },
  image = defaultImage,
  byline = "Built for dashboard quality review",
  className,
}: Hero115Props) => {
  return (
    <section className={cn("overflow-hidden px-6 py-20 md:px-8 md:py-28", className)}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5">
          <div className="relative isolate flex flex-col gap-5">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 mx-auto size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border p-16 [-webkit-mask-image:linear-gradient(to_top,transparent,transparent,white,white,white,transparent,transparent)] md:size-[1300px] md:p-32"
            >
              <div className="size-full rounded-full border border-border p-16 md:p-32">
                <div className="size-full rounded-full border border-border" />
              </div>
            </div>

            <h1 className="mx-auto max-w-xl text-center text-4xl font-semibold tracking-tight text-pretty md:text-5xl lg:max-w-3xl lg:text-6xl">
              {heading}
            </h1>

            <p className="mx-auto max-w-5xl text-balance text-center text-lg text-muted-foreground md:text-xl">
              {description}
            </p>

            <div className="flex flex-col items-center gap-3 pb-12 pt-3">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <a href={button.url}>
                  {button.text}
                  <ArrowRight className="size-4" />
                </a>
              </Button>

              {byline && (
                <div className="text-center text-sm text-muted-foreground">
                  {byline}
                </div>
              )}
            </div>
          </div>

              <div>
                
              </div>
          {image.srcDark ? (
            <>
              <img
                src={image.src}
                alt={image.alt}
                className="z-100 shadow-lg mx-auto aspect-3/4 h-full max-h-[524px] w-full max-w-5xl rounded-lg border border-border object-cover object-left-top md:aspect-video md:object-top dark:hidden"
              />
              <img
                src={image.srcDark}
                alt={image.alt}
                className="z-100 shadow-lg mx-auto hidden aspect-3/4 h-full max-h-[524px] w-full max-w-5xl rounded-lg border border-border object-cover object-left-top md:aspect-video md:object-top dark:block"
              />
            </>
          ) : (
            <img
              src={image.src}
              alt={image.alt}
              className="z-100  shadow-lg mx-auto aspect-3/4 h-full max-h-[524px] w-full max-w-5xl rounded-lg border border-border object-cover object-left-top md:aspect-video md:object-top"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export { Hero115 };

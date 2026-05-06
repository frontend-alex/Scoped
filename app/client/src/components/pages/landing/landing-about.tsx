import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/components/kibo-ui/marquee";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface About3Props {
  className?: string;
  title?: string;
  description?: string;
  mainImage?: {
    src: string;
    alt: string;
  };
  secondaryImage?: {
    src: string;
    alt: string;
  };
  breakout?: {
    src?: string;
    alt?: string;
    title: string;
    description: string;
    buttonText?: string;
    buttonUrl?: string;
  };
  companies?: Array<{
    src: string;
    alt: string;
  }> | null;
  achievementsTitle?: string;
  achievementsDescription?: string;
  achievements?: Array<{
    label: string;
    value: string;
  }>;
  contentSections?: Array<{
    title: string;
    content: string;
  }>;
}

const About3 = ({
  className,
  title = "About Scoped",
  description = "Scoped helps teams review dashboards against practical IBCS-inspired rules. Upload a dashboard, inspect detected visual elements, and turn vague feedback into concrete improvement steps.",
  mainImage = {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas/saas-1-16x9.png",
    alt: "Scoped dashboard analysis interface",
  },
  secondaryImage = {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/analytics/analytics-1-1x1.png",
    alt: "Dashboard compliance review preview",
  },
  breakout = {
    src: "/logo.png",
    alt: "logo",
    title: "Designed for clearer dashboard reviews",
    description:
      "Combine visual detection, compliance scoring, and category-based feedback in one focused workflow.",
    buttonText: "Try demo login",
    buttonUrl: "/login",
  },
  companies = [
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-1.svg",
      alt: "Arc",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-2.svg",
      alt: "Descript",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-3.svg",
      alt: "Mercury",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-4.svg",
      alt: "Ramp",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-5.svg",
      alt: "Retool",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-6.svg",
      alt: "Watershed",
    },
  ],
  achievementsTitle = "What Scoped Focuses On",
  achievementsDescription = "The checker is built around a focused set of explainable review signals so results stay useful during workshops and design iteration.",
  achievements = [
    { label: "Upload flow", value: "1" },
    { label: "Feedback categories", value: "3+" },
    { label: "Compliance score", value: "100" },
    { label: "Visual preview", value: "Yes" },
  ],
  contentSections = [
    {
      title: "Why it exists",
      content:
        "Dashboard feedback is often subjective and hard to act on. Scoped gives reviewers a structured place to capture what passed, what needs attention, and where the issue appears in the dashboard.",
    },
    {
      title: "How it helps",
      content:
        "Teams can upload examples, compare results across iterations, and use generated feedback as a starting point for improving layout, color usage, scaling, and visual clarity.",
    },
  ],
}: About3Props) => {
  const breakoutButtonIsExternal = breakout.buttonUrl?.startsWith("http");

  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="mb-14 flex flex-col gap-5 lg:w-2/3">
          <h1 className="text-5xl font-semibold tracking-tighter lg:text-6xl">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            {description}
          </p>
        </div>
        <div className="grid gap-7 lg:grid-cols-3">
          <img
            src={mainImage.src}
            alt={mainImage.alt}
            className="size-full max-h-[620px] rounded-xl object-cover lg:col-span-2"
          />
          <div className="flex flex-col gap-7 md:flex-row lg:flex-col">
            <div className="flex flex-col justify-between gap-6 rounded-xl bg-muted p-7 md:w-1/2 lg:w-auto">
              {breakout.src && (
                <img
                  src={breakout.src}
                  alt={breakout.alt ?? ""}
                  className="mr-auto h-12 dark:invert"
                />
              )}
              <div>
                <p className="mb-2 text-lg font-semibold">{breakout.title}</p>
                <p className="text-muted-foreground">{breakout.description}</p>
              </div>
              {breakout.buttonText && breakout.buttonUrl && (
                <Button variant="outline" className="mr-auto" asChild>
                  <a
                    href={breakout.buttonUrl}
                    target={breakoutButtonIsExternal ? "_blank" : undefined}
                    rel={breakoutButtonIsExternal ? "noreferrer" : undefined}
                  >
                    {breakout.buttonText}
                  </a>
                </Button>
              )}
            </div>
            <img
              src={secondaryImage.src}
              alt={secondaryImage.alt}
              className="grow basis-0 rounded-xl object-cover md:w-1/2 lg:min-h-0 lg:w-auto"
            />
          </div>
        </div>
        {companies && (
          <div className="py-32">
            <Marquee>
              <MarqueeContent speed={40}>
                {companies.map((company, idx) => (
                  <MarqueeItem
                    key={company.src + idx}
                    className="mx-8 flex items-center"
                  >
                    <img
                      src={company.src}
                      alt={company.alt}
                      className="h-7 w-auto md:h-8 dark:invert"
                    />
                  </MarqueeItem>
                ))}
              </MarqueeContent>
              <MarqueeFade side="left" />
              <MarqueeFade side="right" />
            </Marquee>
          </div>
        )}
        <div className="relative overflow-hidden rounded-xl bg-muted p-7 md:p-16">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h2 className="text-3xl font-medium md:text-4xl">
              {achievementsTitle}
            </h2>
            <p className="max-w-xl text-muted-foreground">
              {achievementsDescription}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:flex md:flex-wrap md:justify-between">
            {achievements.map((item, idx) => (
              <div
                className="flex flex-col gap-2 text-center md:text-left"
                key={item.label + idx}
              >
                <span className="font-mono text-4xl font-semibold md:text-5xl">
                  {item.value}
                </span>
                <p className="text-sm md:text-base">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        {contentSections && contentSections.length > 0 && (
          <div className="mx-auto grid max-w-5xl gap-16 py-28 md:grid-cols-2 md:gap-28">
            {contentSections.map((section, idx) => (
              <div key={section.title + idx}>
                <h2 className="mb-5 text-4xl font-medium">{section.title}</h2>
                <p className="text-lg leading-7 whitespace-pre-line text-muted-foreground">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export { About3 };

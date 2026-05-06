import { cn } from "@/lib/utils";

interface FooterLogo {
  url: string;
  src: string;
  alt: string;
  title: string;
}

interface FooterBasicProps {
  logo?: FooterLogo;
  description?: string;
  copyright?: string;
  className?: string;
}

interface Footer2Props extends FooterBasicProps {
  logoClassName?: string;
}
type Props = Partial<Footer2Props>;

const defaultProps: Footer2Props = {
  logo: {
    url: "/",
    src: "/logo.png",
    alt: "Scoped logo",
    title: "Scoped",
  },
  description:
    "Scoped helps teams review dashboards for IBCS compliance with clear visual checks, scoring, and actionable feedback.",
  copyright: "© 2026 Scoped. All rights reserved.",
};

const Footer2 = (props: Props) => {
  const { logo, description, copyright, className } = {
    ...defaultProps,
    ...props,
  };

  return (
    <section className={cn("border-t py-12", className)}>
      <div className="container mx-auto px-6 md:px-8">
        <footer>
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-md">
              <a href={logo?.url} className="inline-flex items-center gap-3">
                <img
                  src={logo?.src}
                  alt={logo?.alt}
                  title={logo?.title}
                  className="h-12 dark:invert"
                />
                <span className="text-lg font-semibold tracking-tight">
                  {logo?.title}
                </span>
              </a>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              {copyright}
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
};

export { Footer2 };

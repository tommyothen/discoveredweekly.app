import Head from "next/head";
import { useScreenSize } from "~/hooks/useScreenSize";
import { DesktopContainer } from "~/components/shared/DesktopContainer";
import { MobileContainer } from "~/components/shared/MobileContainer";
import { Sidebar } from "~/components/shared/Sidebar/Sidebar";
import { Bottom } from "~/components/shared/Bottom";

export const Layout: React.FC<{
  head?: {
    title?: string;
    description?: string;
  };
  children: React.ReactNode;
}> = ({ children, head }) => {
  const screenSize = useScreenSize();

  const Container =
    screenSize === "xs" || screenSize === "sm"
      ? MobileContainer
      : DesktopContainer;

  const title = (head?.title ? `${head.title} | ` : "") + "Discovered Weekly";

  return (
    <>
      <Head>
        <title>{title}</title>
        {head?.title && <meta property="og:title" content={head.title} />}
        {head?.description && (
          <>
            <meta property="og:description" content={head.description} />
            <meta name="description" content={head.description} />
          </>
        )}
        <meta property="og:site_name" content="Discovered Weekly" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://discoveredweekly.com" />
        <meta property="og:image" content="/discoveredweekly.svg" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <main>
        <Container side={<Sidebar />} bottom={<Bottom />}>
          {children}
        </Container>
      </main>
    </>
  );
};

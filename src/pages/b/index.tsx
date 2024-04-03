import type { GetServerSideProps } from "next/types";

export const getServerSideProps = (async () => {
  return {
    redirect: {
      destination: "/dashboard",
      permanent: false,
    },
  };
}) satisfies GetServerSideProps;

const B = () => <></>;
export default B;

import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import Head from 'next/head';

export const getStaticProps: GetStaticProps = async (context) => {
  // Fetch data for the landing page if needed
  // For now, return empty props
  return {
    props: {},
  };
};

export default function HomePage({}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div>
      <Head>
        <title>Property Oversight Platform</title>
        <meta name="description" content="Online property oversight and management platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Property Oversight Platform</h1>
        <p>Welcome! This is the landing page.</p>
        <p>Navigate to the <a href="/dashboard">Dashboard</a> to get started.</p>
      </main>
    </div>
  );
}

// @client

import React from "react";
import Head from "next/head";
import FileUploadButton from "../modules/FileUploadButton";

export default function HomePage() {
  return (
    <div>
      <Head>
        <title>Handle Scanner</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Upload your csv to check for available handles!</h1>
        <FileUploadButton />
      </main>
    </div>
  );
}

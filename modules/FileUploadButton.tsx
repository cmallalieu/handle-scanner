import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import DownloadCSVButton from "./DownloadCSVButton";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL as string,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN as string,
});

const FileUploadButton: React.FC = () => {
  const [file, setFile] = useState<File | undefined>();
  const [wordList, setWordlist] = useState<string[] | undefined>();
  const [availableWords, setAvailableWords] = useState<string[] | undefined>();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      console.log(fileList[0]);
      setFile(fileList[0]);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      alert("Please select a file before submitting");
      return;
    }

    // To read the file content, you would typically use FileReader API.
    const reader = new FileReader();
    reader.onload = function (e) {
      const rawContents = e.target?.result!.toString()!;
      const wordList = rawContents.split(",");
      setWordlist(wordList);
    };
    reader.readAsText(file);
  };

  const fetchAvailability = async () => {
    await redis.set("wordsToFind", wordList);

    const availableWords = await fetch(
      `${window.location.origin}/api/isAvailable`
    ).then((res) => res.json());

    setAvailableWords(availableWords.availableWords);
  };

  useEffect(() => {
    if (wordList == null) {
      return;
    }
    fetchAvailability();
  }, [wordList]);

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button type="submit">Submit</button>
      <li>
        {availableWords && (
          <DownloadCSVButton data={availableWords} fileName={file?.name!} />
        )}
      </li>
    </form>
  );
};

export default FileUploadButton;

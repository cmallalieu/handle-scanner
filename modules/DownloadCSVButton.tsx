import React from "react";

export interface Props {
  data: string[];
  fileName: string;
}
const DownloadCSVButton: React.FC<Props> = ({ data, fileName }) => {
  const handleDownload = () => {
    const csvContent = data.join(",");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `available_words_${fileName.split(".")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return <button onClick={handleDownload}>Download CSV</button>;
};

export default DownloadCSVButton;

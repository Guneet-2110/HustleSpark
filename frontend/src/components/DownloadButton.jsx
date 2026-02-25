import React, { useState } from "react";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export const DownloadButton = ({ fileName = "studio/myapp.zip" }) => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const fileRef = ref(storage, fileName);
      const url = await getDownloadURL(fileRef);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      if (err.code === "storage/object-not-found") {
        setError(`File "${fileName}" not found in Firebase Storage.`);
      } else if (err.code === "storage/unauthorized") {
        setError("You do not have permission to download this file.");
      } else {
        setError("Download failed. Please check your connection and try again.");
      }
      console.error("Firebase download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="download-section">
      <button
        className="download-btn"
        onClick={handleDownload}
        disabled={downloading}
      >
        {downloading ? "Downloading..." : `Download ${fileName}`}
      </button>
      {error && <p className="download-error">{error}</p>}
    </div>
  );
};

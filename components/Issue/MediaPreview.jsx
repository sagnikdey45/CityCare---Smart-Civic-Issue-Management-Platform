"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function MediaPreview({ storageId, isVideo }) {
  const url = useQuery(api.issuesMedia.getMediaUrl, {
    storageId,
  });

  if (!url) return null;

  if (isVideo) {
    return <video src={url} controls className="w-full rounded-xl" />;
  }

  return <img src={url} className="w-full h-56 object-cover rounded-xl" />;
}

import React from "react";
import { Grid, Skeleton } from "@mui/material";
import type { Folklore } from "../model/types";
import { FolkloreCard } from "./FolkloreCard";

export const FolkloreGrid: React.FC<{
  items: Folklore[];
  loading: boolean;
  onOpen: (id: number) => void;
}> = ({ items, loading, onOpen }) => {
  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={idx}>
            <Skeleton variant="rounded" height={260} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {items.map((x) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={x.id}>
          <FolkloreCard item={x} onOpen={onOpen} />
        </Grid>
      ))}
    </Grid>
  );
};

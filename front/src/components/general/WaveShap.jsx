import React from "react";
import { Box } from "@mui/material";
export const WaveShap = () => {
  return (
 
      <Box
          sx={{
            position: "absolute",
            bottom: "-1px",
            left: "0px",
            right: "0px",
            backgroundColor: "background.main",
            width: "100%",
            clipPath: "polygon(50% 62%, 100% 0, 100% 100%, 0 100%, 0 0)",
            height: "70px",
            zIndex: 4,
          }}
      >
      </Box>

  );
};

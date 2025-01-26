import { Box, CircularProgress } from "@mui/material";
export const FallbackLoading = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "0px",
        left: "0px",
        right: "0px",
        bottom: "0px",
        backgroundColor: "background.main",
        height: "100vh",
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
       <CircularProgress sx={{fontSize:"50px"}}/>
    </Box>
  );
};

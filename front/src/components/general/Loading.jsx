import { Avatar, Box, Skeleton } from "@mui/material";
export const Loading = () => {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "start",
          alignItems: "top",
          mb: 3,
        }}
      >
        <Skeleton variant="circular" width={100} height={100} mt={3}>
          <Avatar />
        </Skeleton>
        <Skeleton
          variant="rectangular"
          width={300}
          height={30}
          sx={{ mt: 3, ml: 2 }}
        />
      </Box>
      <Box sx={{ mt: 3, mb: 3 }}>
        <Skeleton
          variant="rectangular"
          sx={{ width: ["300px", "400px", "600px"] }}
          height={50}
        />
      </Box>
      <Box sx={{ mt: 3, mb: 3 }}>
        <Skeleton
          variant="rectangular"
          sx={{ width: ["300px", "400px", "600px"] }}
          height={200}
        />
      </Box>
    </Box>
  );
};

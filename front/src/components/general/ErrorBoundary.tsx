import { Box, Button, Container, Typography } from "@mui/material";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";

/**
 * The router's error element.
 *
 * Without one, a render error anywhere showed React Router's default developer
 * screen — a raw stack trace — to whoever hit it. The Phase 4 date-picker crash
 * looked exactly like that in production build output.
 */
export const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const status = isRouteErrorResponse(error) ? error.status : undefined;

  return (
    <Container
      sx={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          {status === 404 ? "Page not found" : "Something went wrong"}
        </Typography>
        <Typography sx={{ mb: 3, color: "text.secondary" }}>
          {status === 404
            ? "That page does not exist."
            : "Please try again. If it keeps happening, contact us."}
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Back to home
        </Button>
      </Box>
    </Container>
  );
};

export default ErrorBoundary;

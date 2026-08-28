import { Box, Typography } from "@mui/material";
import { useState, type ChangeEvent, type CSSProperties } from "react";
import EditIcon from "@mui/icons-material/Edit";
import { useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { queryKeys } from "@/api/queryClient";
import fixedImage from "@/assets/profile.png";
const styleLabel: CSSProperties = {
  position: "absolute",
  top: "0px",
  left: "0px",
  width: "30px",
  height: "30px",
  background: "white",
  padding: "2px",
  borderRadius: "50%",
  border: "1px solid #064180",
  cursor: "pointer",
};
interface ChangeImageProps {
  name: string;
  oldImage?: string;
}

export const ChangeImage = ({ name, oldImage }: ChangeImageProps) => {
  const [image, setImage] = useState("");
  const queryClient = useQueryClient();
  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const result = reader.result;
      if (typeof result === "string") {
        await saveImage(result);
      }
    };
  };
  const saveImage = async (base64Image: string) => {
    try {
      const profile = await userService.updateAvatar(base64Image);
      setImage(profile.image ?? "");
      // Refreshes the navbar avatar too, since both read the same query.
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    } catch {
      // Surfaced to the user in Phase 7.
    }
  };
  return (
    <Box>
      <form>
        <Box sx={{ py: 2 }}>
          <input
            type="file"
            id="image"
            name="image"
            // `label` is not a valid input attribute; the visible label is the
            // <label htmlFor="image"> below. Replaced with an accept filter,
            // which matches what the API validates.
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ visibility: "hidden", width: "0px", height: "0px" }}
            onChange={handleImageChange}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "start",
              alignItems: "top",
            }}
          >
            <Box
              sx={{ position: "relative", border: "1px solid text.main !important" }}
            >
              <img
                src={image ? image : oldImage ? oldImage : fixedImage}
                alt="profile"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                }}
              />
              <label htmlFor="image" style={styleLabel}>
                <EditIcon sx={{ color: "main" }} />
              </label>
            </Box>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  pt: 3,
                  px: 3,
                  color: "text.main",
                  textTransform: "capitalize",
                }}
              >
                {name}
              </Typography>
            </Box>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

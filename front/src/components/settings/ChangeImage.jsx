import { Box, Typography } from "@mui/material";
import  { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import Cookies from "js-cookie";
import fixedImage from "../../assets/profile.png";
const styleLabel = {
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
export const ChangeImage = ({ name, oldImage }) => {
  const [image, setImage] = useState("");
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const result = reader.result;
      if (result) {
        await saveImage(result);
      }
    };
  };
  const saveImage = async (base64Image) => {
    try {
      const res = await axios.post(
        "https://booking-bus.onrender.com/uploadImage/",
        { image: base64Image },
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      
      setImage(res.data.result.image);
    } catch (err) {}
  };
  return (
    <Box>
      <form>
        <Box sx={{ py: 2 }}>
          <input
            type="file"
            id="image"
            name="image"
            label="image"
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
            <Box sx={{ position: "relative",border:"1px solid text.main !important" }}>
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

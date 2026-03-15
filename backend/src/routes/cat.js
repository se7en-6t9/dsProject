// Cat route - fetches a random cat image from The Cat API
import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await fetch("https://api.thecatapi.com/v1/images/search");

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: "Failed to fetch cat from external API",
      });
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No cat found",
      });
    }

    res.json({
      success: true,
      cat: {
        url: data[0].url,
        width: data[0].width,
        height: data[0].height,
      },
    });
  } catch (err) {
    console.error("Cat route error:", err.message || err);
    res.status(500).json({
      success: false,
      message: "Failed to generate cat",
    });
  }
});

export default router;

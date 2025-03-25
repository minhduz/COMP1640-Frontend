export const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas context not available");
    }

    // Set canvas size to desired output size (400x400)
    const cropWidth = 400;
    const cropHeight = 400;
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      croppedAreaPixels.x, // Start X
      croppedAreaPixels.y, // Start Y
      croppedAreaPixels.width, // Source width
      croppedAreaPixels.height, // Source height
      0, // Destination X
      0, // Destination Y
      cropWidth, // Destination width
      cropHeight // Destination height
    );

    // Convert the canvas content to a Blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      }, "image/jpeg");
    });
  } catch (error) {
    console.error("Error cropping image:", error);
    return null;
  }
};

// Helper function to create an image element from a URL
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // To prevent CORS issues
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
  });

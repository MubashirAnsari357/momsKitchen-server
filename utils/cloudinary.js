import cloudinary from "cloudinary";

export const uploads = (file, folder) => {
    return new Promise((resolve) => {
      cloudinary.uploader.upload(
        file,
        (result) => {
          resolve({
            public_id: result.public_id,
            url: result.secure_url,
          });
        },
        {
          folder: folder,
        }
      );
    });
  };

  export const destroys = async (public_id) => {
    await cloudinary.uploader.destroy(public_id)
  }
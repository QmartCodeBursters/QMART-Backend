const { v2: cloudinary } = require('cloudinary');


cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})



const uploadImageCloudinary = async ( image ) =>{
    const buffer = image?.buffer || Buffer.from(await image.arrayBuffer()); //convert image to buffer

    const uploadImage = await new Promise((resolve, reject)=>{
        cloudinary.uploader.upload_stream({ folder :  "Qmart"}, (error, uploadResult) =>{ //upload_stream: create folder to save the image
            if(error) return reject(error);
            return resolve(uploadResult);
        }).end(buffer);
    })
    return uploadImage
}

module.exports = uploadImageCloudinary
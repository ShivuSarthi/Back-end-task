const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const cloudinary = require("cloudinary").v2;

//Create Product
exports.createProduct = async (req, res, next) => {
  const avatarFile = req.files.avatar;

  try {
    const myCloud = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        })
        .end(avatarFile.data);
    });
    const imageLink = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url
    };

    req.body.images = imageLink;
    req.body.user = req.body.id;

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    res.status(500).json({ success: false, error: "Image upload failed" });
  }
};

// Get All Product
exports.getAllProducts = async (req, res, next) => {
  try {
    const productsCount = await Product.countDocuments();

    const products = await Product.find();

    res.status(200).json({
      success: true,
      count: productsCount,
      products: products
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, error: "Failed to fetch products" });
  }
};

// Get Product Details
exports.getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHander("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      product: product
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res
      .status(500)
      .json({ success: false, error: "Product details retrieval failed" });
  }
};

// Delete Product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new Error("Product not found", 404));
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, error: "Failed to delete product" });
  }
};

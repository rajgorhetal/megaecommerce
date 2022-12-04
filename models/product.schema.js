import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
      maxLength: [120, "Product name should be max of 120 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price"],
      maxLength: [5, "Product price should not be more than 5 digits"],
    },
    description: {
      type: String,
      //TODO: npm package to support markdown(markdown)
      //TODO: npm package for editor(editor)
    },
    photos: [
      {
        secure_url: {
          type: String,
          required: true,
        },
      },
    ],
    stock: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    collectionId: {
      //Below line is going to be same
      type: mongoose.Schema.Types.ObjectId,
      //Storing reference of another Schema Eg:Adding category
      ref: "Collection",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
//TODO: add Wishlist

import slugify from "slugify";
import { CategoryModel } from "../models/category.model.js";
import { PostModel } from "../models/post.model.js";
import { UserModel } from "../models/user.model.js";

export const createNewPost = async (req, res) => {
  try {
    // login check
    const isLogin = req.user;
    if (!isLogin) {
      return res.status(401).json({
        message: "Unauthorized (Login Required)",
        success: false,
      });
    }

    // is user required
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    // check user admin

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
        success: false,
      });
    }

    const {
      title,
      content,
      category,
      metaTitle,
      metaDescription,
      keywords,
      thumbnail,
      status,
      description,
    } = req.body;
    const requiredFields = {
      title,
      content,
      category,
      thumbnail,
      description,
    };
    for (let [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({
          message: `${key} is required`,
          success: false,
        });
      }
    }

    // check Blog are already exits

    const post = await PostModel.findOne({ title }).select("title");
    if (post) {
      return res.status(409).json({
        message: "Post already exists",
        success: false,
      });
    }

    // check category are
    const isCategory = await CategoryModel.findOne({ name: category }).select(
      "name slug postCount",
    );
    if (!isCategory) {
      return res.status(404).json({
        message: "Category not found",
        success: false,
      });
    }

    // create post
    const newPost = await PostModel({
      title,
      content,
      categoryID: isCategory._id,
      category: {
        name: isCategory.name,
        slug: isCategory.slug,
      },
      userID: user._id,
      author: {
        name: user.name,
        email: user.email,
        username: user.username,
      },
      slug: slugify(title, { lower: true }),
      thumbnail,
      status: status || "published",
      description,
      expert: description,
      metaTitle: metaTitle || title.slice(0, 60),
      metaDescription: metaDescription || description.slice(0, 160),
      keywords,
      ogImage: thumbnail,
      ogTitle: title,
      ogDescription: description,
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: thumbnail,
    }).save();
    isCategory.postCount += 1;

    await isCategory.save();

    return res.status(201).json({
      message: "Post created successfully",
      success: true,
      data: newPost,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// published post
export const publishedPost = async (req, res) => {
  try {
    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const posts = await PostModel.find({ status: "published" })

      .select("title description category slug author thumbnail")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    if (posts.length === 0) {
      return res.status(404).json({
        message: "No published posts found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Published posts fetched successfully",
      success: true,
      data: posts,
      pagination: {
        total: await PostModel.countDocuments(),
        page,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// details post published
export const publishedDetailsPost = async (req, res) => {
  try {
    const { slug } = req.params;

    // Atomically find the post and increment views by 1 in a single DB call
    const post = await PostModel.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }, // Return the updated document after incrementing
    );
    // .populate("author", "name email avatar") // Agar aapko author details bhi chahiye
    // .populate("category", "name slug");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post Not Found",
        data: {
          title: `Post with slug '${slug}' is not available`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error in publishedDetailsPost:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const PostReaction = async (req, res) => {
  try {
    const { slug } = req.params;
    const { like, dislike, share } = req.body;
    const post = await PostModel.findOne({ slug });
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    post.reactions.like += like || 0;
    post.reactions.dislike += dislike || 0;
    post.reactions.share += share || 0;

    await post.save();

    return res.status(200).json({
      message: "Reaction updated successfully",
      success: true,
      data: post,
    });
  } catch (error) {}
};

export const categoryByPost = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({
        message: "Slug is required",
        success: false,
      });
    }
    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const post = await PostModel.find({ "category.slug": slug })
      .select("title description category slug author thumbnail")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    if (post.length === 0) {
      return res.status(404).json({
        message: "No posts found for this category",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Post fetched successfully",
      success: true,
      pagination: {
        total: await PostModel.countDocuments(),
        page,
        limit,
      },
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

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
      "name slug",
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
      seo: {
        metaTitle,
        metaDescription,
        keywords,
        slug: slugify(title, { lower: true }),
      },
    }).save();

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

    const post = await PostModel.findOne({ slug: slug });
    if (!post) {
      return res.status(404).json({
        message: "Post Not Found",
        data: {
          title: `${slug} this url post not available`,
        },
      });
    }

    return res.status(200).json({
      message: "Post fetched successfully",
      data: post,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

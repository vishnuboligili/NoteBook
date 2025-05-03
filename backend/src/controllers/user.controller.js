import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import { generateToken } from "../middlewares/auth.middleware.js";
import { encryPassword } from "../utils/hashPassword.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Notes } from "../models/notes.model.js";

//=================== Sign Up ===================
// const signup = asyncErrorHandler(async (req, res) => {
//   const getData = req.body;
//   const checkUserName = await User.findOne({ username: getData.username });
//   const checkEmail = await User.findOne({ email: getData.email });

//   // ------------------ check duplicate username and email ------------------
//   if (checkUserName) {
//     // ------------------ throwing error in ApiError.js file ------------------
//     throw new ApiError(400, "error", "username already exists");
//   } else if (checkEmail) {
//     throw new ApiError(400, "error", "email already exists");
//   } else {
//     const newUser = new User(getData);
//     const data = await newUser.save();

//     const payload = {
//       _id: data._id,
//       name: data.name,
//       username: data.username,
//       email: data.email,
//     };
//     // -------------- Generate Token ----------------
//     const token = generateToken(payload);

//     // ------------- Password Remove ---------
//     const userData = data.toObject();
//     delete userData.password;
   
//     res.status(200).json(new ApiResponse(200, userData, token, "success"));
//   }
// });
// const signup = asyncErrorHandler(async (req, res) => {
//   const getData = req.body;

//   // ------------------ Check for existing username and email ------------------
//   const checkUserName = await User.findOne({ username: getData.username });
//   const checkEmail = await User.findOne({ email: getData.email });

//   if (checkUserName) {
//     throw new ApiError(400, "error", "username already exists");
//   }

//   if (checkEmail) {
//     throw new ApiError(400, "error", "email already exists");
//   }

//   // ✅ Hash the password before saving
//   getData.password = await encryPassword(getData.password);

//   // ------------------ Create and save new user ------------------
//   const newUser = new User(getData);
//   const data = await newUser.save();

//   const payload = {
//     _id: data._id,
//     name: data.name,
//     username: data.username,
//     email: data.email,
//   };

//   // ------------------ Generate auth token ------------------
//   const token = generateToken(payload);

//   // ------------------ Remove password before sending response ------------------
//   const userData = data.toObject();
//   delete userData.password;

//   // ------------------ Send response ------------------
//   res.status(200).json(new ApiResponse(200, userData, token, "success"));
// });

const signup = async (req, res) => {
  try {
    const getData = req.body;
    console.log("📥 Incoming signup data:", getData);

    // Validate input
    if (!getData.username || !getData.email || !getData.password || !getData.name) {
      console.error("❌ Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicates
    const checkUserName = await User.findOne({ username: getData.username });
    const checkEmail = await User.findOne({ email: getData.email });

    if (checkUserName) {
      return res.status(400).json({ message: "username already exists" });
    }

    if (checkEmail) {
      return res.status(400).json({ message: "email already exists" });
    }

    // Hash password
    getData.password = await encryPassword(getData.password);
    console.log("🔐 Password encrypted");

    // Save user
    const newUser = new User(getData);
    const data = await newUser.save();
    console.log("✅ User saved to DB");

    // Create token
    const payload = {
      _id: data._id,
      name: data.name,
      username: data.username,
      email: data.email,
    };

    const token = generateToken(payload);
    console.log("🎫 Token generated");

    const userData = data.toObject();
    delete userData.password;

    return res.status(200).json(new ApiResponse(200, userData, token, "success"));
  } catch (err) {
    console.error("🔥 Signup error caught:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// =================== Log in ===================
const login = asyncErrorHandler(async (req, res) => {
  const { email, password } = req.body;

  // ---------- check email and password exists or not ---------
  const user = await User.findOne({ email: email });

  if (!user || !(await user.comparePassword(password))) {
    // ------------------ throwing error in errorHandler.js file ------------------
    // throw {
    //   status: 401,
    //   statusInfo: "error",
    //   response: "email or password doesn't exists",
    // };
    throw new ApiError(401, "error", "email or password doesn't exists");
  }
  // ------------ Generate Token ----------
  const payload = {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
  };
  const token = generateToken(payload);
  // ------------ Password Remove ----------
  const userData = user.toObject();
  delete userData.password;
  // ------------------ response send -------------
  res.status(200).json(new ApiResponse(200, userData, token, "success"));
  // res
  //   .status(200)
  //   .json({ status: 200, statusInfo: "success", response: user, token: token });
});

// =================== Reset Password ===================
const resetPassword = asyncErrorHandler(async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await encryPassword(password);

  const user = await User.findOneAndUpdate(
    {
      email: email,
    },
    {
      password: hashedPassword,
    },
    {
      new: true,
    }
  );
  if (!user) {
    throw new ApiError(404, "fail", "user not found");
  } else {
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          null,
          "success",
          "password changed successfully"
        )
      );
    // res.status(200).json(new ApiResponse(200, user));
    // res
    //   .status(200)
    //   .json({ status: 200, statusInfo: "success", response: user });
  }
});

// =================== Update User Profile ===================
const updateUserProfile = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  // ---------------- Check username exist or not -----------------
  const existUsername =
    (await User.findOne({ username: req.body.username })) || {};
  if (existUsername.username === (req.body.username || false)) {
    throw new ApiError(401, "fail", "username already exist");
  }
  // ---------------- Check email exist or not ------------
  const existEmail = (await User.findOne({ email: req.body.email })) || {};
  if (existEmail.email === (req.body.email || false)) {
    throw new ApiError(401, "fail", "email already exist");
  }

  const updateUser = await User.findByIdAndUpdate(id, req.body, {
    returnNewDocument: true,
    new: true,
  });

  if (!updateUser) {
    throw new ApiError(404, "fail", "user not found");
  }
  // ------------- Password Remove ----------
  const userData = updateUser.toObject();
  delete userData.password;
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userData,
        null,
        "success",
        "user details updated successfully"
      )
    );
  // res.status(200).json(new ApiResponse(200, updateUser));
  // res
  //   .status(200)
  //   .json({ status: 200, statusInfo: "success", response: updateUser });
});

// =================== Delete User Profile ===================
const deleteUserProfile = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  const user = await User.findOne({ _id: id });

  // ------------- user exist or not --------
  if (!user) {
    throw new ApiError(404, "fail", "user not found");
  }

  // ------------ Enter password before deleting account ----------
  // -------------- compare password -----------------
  if (!password) {
    throw new ApiError(401, "fail", "please enter password correctly");
  }
  const userPassword = await user.comparePassword(password);

  // ------------- check password correct or wrong --------------
  if (!userPassword) {
    throw new ApiError(401, "fail", "wrong password");
  }
  const deleteUser = await User.findByIdAndDelete({ _id: id });
  let DeleteId = deleteUser._id.toString();

  if (!deleteUser) {
    throw new ApiError(404, "fail", "user not found");
  }

  // ----------------- Delete All User Notes ----------------------
  const deleteAllData = await Notes.deleteMany({
    author: DeleteId,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        null,
        "success",
        "account deleted successfully"
      )
    );
  // res.status(200).json({
  //   status: 200,
  //   statusInfo: "success",
  //   response: "account deleted successfully",
  // });
});

// =================== Get User Profile ===================
const getUserProfile = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const getUser = await User.findById({ _id: id });

  if (!getUser) {
    throw new ApiError(404, "fail", "user not found");
  }
  // ------------- Password Remove ----------
  const userData = getUser.toObject();
  delete userData.password;

  res.status(200).json(new ApiResponse(200, userData));
  // res.status(200).json({ msg: "OK" });
});

// =================== Export ===================
export {
  signup,
  login,
  resetPassword,
  updateUserProfile,
  deleteUserProfile,
  getUserProfile,
};

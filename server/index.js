import "dotenv/config";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { CLASS_SCHEDULE } from "../shared/classes.js";


// ------------------------------------
// Configuration
// ------------------------------------

const port = Number(process.env.PORT) || 5000;

const sessionCookieName = "toka_session";

const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;

const memberships = ["Core", "Plus"];

const roles = ["member", "staff"];

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI must be set in the environment.");
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long.");
}


const app = express();

app.use(cors({
  origin: "https://tokaf.marvindappah09.workers.dev",
  credentials: true,
}));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// ------------------------------------
// MongoDB User Schema
// ------------------------------------

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    membership: {
      type: String,
      required: true,
      enum: memberships,
    },

    role: {
      type: String,
      enum: roles,
      default: "member",
    },

    lastLoginAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classId: {
      type: String,
      required: true,
      enum: CLASS_SCHEDULE.map((item) => item.id),
    },
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1, classId: 1 }, { unique: true });

const Booking = mongoose.model("Booking", bookingSchema);

const mealPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    mealType: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    details: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  { timestamps: true }
);

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);

// ------------------------------------
// Express App
// ------------------------------------

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// ------------------------------------
// Public User Information
// ------------------------------------

function publicUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    membership: user.membership,
    role: user.role || "member",
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

// ------------------------------------
// Cookie Configuration
// ------------------------------------

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };
}

// ------------------------------------
// Create Login Session
// ------------------------------------

function setSessionCookie(response, user) {
  const token = jwt.sign(
    {
      sub: user._id.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  response.cookie(sessionCookieName, token, {
    ...sessionCookieOptions(),
    maxAge: sessionDurationMs,
  });
}

// ------------------------------------
// Validation
// ------------------------------------

function validateEmail(email) {
  return (
    typeof email === "string" &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
}

function validatePassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    Buffer.byteLength(password, "utf8") <= 72
  );
}

function invalidCredentials(response) {
  return response.status(401).json({
    message: "Email or password is incorrect.",
  });
}

// ------------------------------------
// Authentication Middleware
// ------------------------------------

async function requireAuth(request, response, next) {
  const token = request.cookies?.[sessionCookieName];

  if (!token) {
    return response.status(401).json({
      message: "Please log in to continue.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.sub);

    if (!user) {
      response.clearCookie(
        sessionCookieName,
        sessionCookieOptions()
      );

      return response.status(401).json({
        message: "User account not found.",
      });
    }

    request.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      response.clearCookie(
        sessionCookieName,
        sessionCookieOptions()
      );

      return response.status(401).json({
        message: "Your session has expired. Please log in again.",
      });
    }

    return next(error);
  }
}

// ------------------------------------
// Staff Permission Middleware
// ------------------------------------

function requireStaff(request, response, next) {
  if (request.user.role !== "staff") {
    return response.status(403).json({
      message: "You do not have permission to access this page.",
    });
  }

  next();
}

// ------------------------------------
// SIGN UP
// ------------------------------------

app.post("/api/auth/signup", async (request, response, next) => {
  try {
    const {
      fullName,
      email,
      password,
      membership,
    } = request.body || {};

    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      fullName.trim().length > 100 ||
      !validateEmail(email) ||
      !validatePassword(password) ||
      !memberships.includes(membership)
    ) {
      return response.status(400).json({
        message: "Enter a valid name, email, password, and membership.",
      });
    }

    const now = new Date();

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      membership,

      // New registrations can never choose staff access.
      role: "member",

      lastLoginAt: now,
    });

    setSessionCookie(response, user);

    return response.status(201).json({
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    return next(error);
  }
});

// ------------------------------------
// LOGIN
// ------------------------------------

app.post("/api/auth/login", async (request, response, next) => {
  try {
    const { email, password } = request.body || {};

    if (!validateEmail(email) || !validatePassword(password)) {
      return invalidCredentials(response);
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return invalidCredentials(response);
    }

    user.lastLoginAt = new Date();

    await user.save();

    setSessionCookie(response, user);

    return response.json({
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

// ------------------------------------
// CURRENT LOGGED-IN USER
// ------------------------------------

app.get("/api/auth/me", requireAuth, (request, response) => {
  return response.json({
    user: publicUser(request.user),
  });
});

// ------------------------------------
// MEMBER DASHBOARD
// ------------------------------------

app.get("/api/dashboard", requireAuth, async (request, response, next) => {
  try {
    const [bookings, meals] = await Promise.all([
      Booking.find({ userId: request.user._id }).sort({ createdAt: 1 }).lean(),
      MealPlan.find({ userId: request.user._id })
        .sort({ day: 1, mealType: 1, createdAt: 1 })
        .lean(),
    ]);

    return response.json({
      user: publicUser(request.user),
      bookings: bookings.map((booking) => ({
        ...CLASS_SCHEDULE.find((item) => item.id === booking.classId),
        bookingId: booking._id.toString(),
      })),
      meals: meals.map((meal) => ({
        id: meal._id.toString(),
        day: meal.day,
        mealType: meal.mealType,
        name: meal.name,
        details: meal.details,
      })),
    });
  } catch (error) {
    return next(error);
  }
});

// ------------------------------------
// MEMBER MEAL PLAN
// ------------------------------------

app.post("/api/meals", requireAuth, async (request, response, next) => {
  try {
    const { day, mealType, name, details = "" } = request.body || {};
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];

    if (
      !days.includes(day) ||
      !mealTypes.includes(mealType) ||
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100 ||
      typeof details !== "string" ||
      details.length > 1000
    ) {
      return response.status(400).json({
        message: "Enter a valid day, meal type, meal name, and notes (up to 1,000 characters).",
      });
    }

    const meal = await MealPlan.create({
      userId: request.user._id,
      day,
      mealType,
      name: name.trim(),
      details: details.trim(),
    });

    return response.status(201).json({
      meal: {
        id: meal._id.toString(),
        day: meal.day,
        mealType: meal.mealType,
        name: meal.name,
        details: meal.details,
      },
    });
  } catch (error) {
    return next(error);
  }
});

app.delete("/api/meals/:mealId", requireAuth, async (request, response, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(request.params.mealId)) {
      return response.status(400).json({ message: "Choose a valid meal plan entry." });
    }

    const meal = await MealPlan.findOneAndDelete({
      _id: request.params.mealId,
      userId: request.user._id,
    });

    if (!meal) {
      return response.status(404).json({
        message: "That meal plan entry was not found on your account.",
      });
    }

    return response.json({ message: "Meal plan entry deleted." });
  } catch (error) {
    return next(error);
  }
});

// ------------------------------------
// MEMBER CLASS BOOKINGS
// ------------------------------------

app.get("/api/bookings", requireAuth, async (request, response, next) => {
  try {
    const bookings = await Booking.find({ userId: request.user._id })
      .sort({ createdAt: 1 })
      .lean();

    return response.json({
      bookings: bookings.map((booking) => ({
        ...CLASS_SCHEDULE.find((item) => item.id === booking.classId),
        bookingId: booking._id.toString(),
      })),
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/bookings", requireAuth, async (request, response, next) => {
  try {
    const { classId } = request.body || {};
    const classInfo = CLASS_SCHEDULE.find((item) => item.id === classId);

    if (!classInfo) {
      return response.status(400).json({ message: "Choose a valid class." });
    }

    const booking = await Booking.create({
      userId: request.user._id,
      classId,
    });

    return response.status(201).json({
      booking: {
        ...classInfo,
        bookingId: booking._id.toString(),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({
        message: "You already have a place in this class.",
      });
    }

    return next(error);
  }
});

app.delete("/api/bookings/:classId", requireAuth, async (request, response, next) => {
  try {
    const booking = await Booking.findOneAndDelete({
      userId: request.user._id,
      classId: request.params.classId,
    });

    if (!booking) {
      return response.status(404).json({
        message: "That booking was not found on your account.",
      });
    }

    return response.json({ message: "Class booking cancelled." });
  } catch (error) {
    return next(error);
  }
});

// ------------------------------------
// STAFF DASHBOARD - MEMBER LIST
// ------------------------------------

app.get(
  "/api/staff/members",
  requireAuth,
  requireStaff,
  async (request, response, next) => {
    try {
      const members = await User.find()
        .select("fullName email membership role createdAt lastLoginAt")
        .sort({ createdAt: -1 })
        .lean();

      return response.json({
        members,
        total: members.length,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// ------------------------------------
// LOGOUT
// ------------------------------------

app.post("/api/auth/logout", (request, response) => {
  response.clearCookie(
    sessionCookieName,
    sessionCookieOptions()
  );

  return response.json({
    message: "Signed out successfully.",
  });
});

// ------------------------------------
// ERROR HANDLING
// ------------------------------------

app.use((error, request, response, next) => {
  console.error(
    `API ${request.method} ${request.originalUrl} failed:`,
    error
  );

  if (response.headersSent) {
    return next(error);
  }

  const status = error.status === 400 ? 400 : 500;

  return response.status(status).json({
    message:
      status === 400
        ? "Invalid request. Please check your information."
        : "Something went wrong. Please try again.",
  });
});

// ------------------------------------
// CONNECT TO MONGODB
// ------------------------------------

try {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("Connected to MongoDB successfully.");

  app.listen(port, () => {
    console.log(`Toka API listening on port ${port}`);
  });
} catch (error) {
  console.error("Could not connect to MongoDB:", error);

  process.exit(1);
}


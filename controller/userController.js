const userModels = require('../model/userModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports.signUp = async (req, res) => {
    const { username, fullname, password, email, followers = [], following = [], profileImage, coverImages, bio, link } = req.body;

    if (!username || !fullname || !password || !email) {
        return res.status(400).json({
            success: false,
            msg: "All fields are required"
        });
    }

    try {
        const existingUsername = await userModels.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                msg: "Username is already taken"
            });
        }

        const existingUser = await userModels.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                msg: "Email is already in use"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = await userModels.create({
            username,
            fullname,
            password: hashPassword,
            email,
            followers,
            following,
            profileImage,
            coverImages,
            bio,
            link
        });

        res.status(201).json({
            success: true,
            msg: "User signed up successfully",
            user: {
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImage: user.profileImage,
                coverImages: user.coverImages,
                bio: user.bio,
                link: user.link,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: "Internal server error"
        });
    }
};

module.exports.signIn = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            msg: "All fields are required"
        });
    }

    try {
        const user = await userModels.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                msg: "User does not exist"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                msg: "Invalid password, please try again"
            });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({
            success: true,
            msg: "User logged in successfully",
            user: {
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImage: user.profileImage,
                coverImages: user.coverImages,
                bio: user.bio,
                link: user.link,
            },
            token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: "Internal server error"
        });
    }
};

module.exports.logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 }); // Set maxAge to a small value to invalidate cookie
        return res.status(200).json({
            success: true,
            msg: "User logged out successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: "Internal server error"
        });
    }
};

module.exports.getme = async (req, res) => {
    try {
        // Ensure that the user is authenticated
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                msg: "User not authenticated"
            });
        }

        // Retrieve the user details from the database using the ID from req.user
        const user = await userModels.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }

        // Send the user details in the response
        return res.status(200).json({
            success: true,
            user: {
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImage: user.profileImage,
                coverImages: user.coverImages,
                bio: user.bio,
                link: user.link,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: "Internal server error"
        });
    }
};

module.exports.followOrUnfollow = async (req, res) => {
    const { id } = req.params; // Target user's ID
    const currentUser = req.user.userId; // ID of the user making the request

    if (id === currentUser) {
        return res.status(404).json({
            success: false,
            msg: "You can't follow or unfollow yourself"
        });
    }

    try {
        // Find the target user
        const userToFollow = await userModels.findById(id);
        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }

        // Find the current user
        const currentUserDoc = await userModels.findById(currentUser);
        if (!currentUserDoc) {
            return res.status(404).json({
                success: false,
                msg: "Current user not found"
            });
        }

        // Check if the current user is already following the target user
        const isFollowing = currentUserDoc.following.includes(id);

        if (isFollowing) {
            // Unfollow the user
            await userModels.findByIdAndUpdate(id, { $pull: { followers: currentUser } });
            await userModels.findByIdAndUpdate(currentUser, { $pull: { following: id } });

            res.status(200).json({
                success: true,
                msg: "User unfollowed successfully"
            });
        } else {
            // Follow the user
            await userModels.findByIdAndUpdate(id, { $push: { followers: currentUser } });
            await userModels.findByIdAndUpdate(currentUser, { $push: { following: id } });

            res.status(200).json({
                success: true,
                msg: "User followed successfully"
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: "Internal server error"
        });
    }
};

module.exports.getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await userModels.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports.editProfile = async (req, res) => {
    const { username, fullname, currentpassword, newPassword, email, bio, link } = req.body;
    let { profileImage, coverImages } = req.body;
    const userId = req.user.userId; // Assuming the user ID is available from the authenticated user

    try {
        // Find the user by ID
        const user = await userModels.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }

        // Update username if provided and unique
        if (username && username !== user.username) {
            const existingUsername = await userModels.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    msg: "Username is already taken"
                });
            }
            user.username = username;
        }

        // Update email if provided and unique
        if (email && email !== user.email) {
            const existingEmail = await userModels.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    msg: "Email is already in use"
                });
            }
            user.email = email;
        }

        // Update the full name, bio, and link if provided
        if (fullname) user.fullname = fullname;
        if (bio) user.bio = bio;
        if (link) user.link = link;

        // Update the profile image and cover image if provided
        if (profileImage) user.profileImage = profileImage;
        if (coverImages) user.coverImages = coverImages;

        // Handle password change
        if (currentpassword && newPassword) {
            const isMatch = await bcrypt.compare(currentpassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    msg: "Current password is incorrect"
                });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        // Save the updated user
        await user.save();

        return res.status(200).json({
            success: true,
            msg: "Profile updated successfully",
            user: {
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                bio: user.bio,
                link: user.link,
                profileImage: user.profileImage,
                coverImages: user.coverImages,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: "Internal server error"
        });
    }
};

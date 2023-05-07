export const sendToken = (res, user, statusCode, message) => {

    const token = user.getJWTToken();

    const options = {
        httpOnly: true,
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000)
    }

    const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        gender: user.gender,
        photo: user.photo,
        verified: user.verified,
        chefSpecialization: user.chefSpecialization,
        userType: user.userType
    }

    res.
    status(statusCode).
    cookie("token", token, options).
    json({ success: true, message, user: userData })
}
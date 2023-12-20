import { Otp } from "../helpers/databaseSchema/otp.js";
import { User } from "../helpers/databaseSchema/user.js";
import { transporter } from "../helpers/functions/emailTransporter.js";

export const VerifyOTP = async (req, res) => {
  const { otpNumber, email } = req.body;
  if (!otpNumber) {
    res.status(400).json({ message: "no field should be left empty" });
  } else {
    try {
      const found_user = await User.findOne({
        email,
      });
      if (!found_user)
        return res
          .status(404)
          .json({ message: "no account found for this email" });

      const otpSearchResult = await Otp.find({ id: found_user._id });
      if (otpSearchResult.length < 1) {
        res.status(404).json({ message: "OTP not found" });
      } else {
        if (otpSearchResult[0].otp !== otpNumber) {
          res
            .status(404)
            .json({ message: "Verification Failed OTP is incorrect" });
        } else {
          //  chceck if the otp is expried or not
          if (otpSearchResult[0].expries - new Date().getTime() < 0) {
            Otp.deleteMany({ id: found_user._id });
            res.status(403).json({ message: "Otp has expired" });
          } else {
            // delete the otp after verification is done
            const otpDeleted = Otp.deleteMany({ id: found_user._id });
            console.log("otp Verification succesfull");
            if (otpDeleted) {
              //confirmed otp
              res.status(200).json({ message: "Otp verified" });
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "An error occured" });
    }
  }
};

// resend otp to user email
export const resendOtp = async (req, res) => {
  try {
    const found_user = await User.findOne({
      email: req.body.email,
    });
    if (!found_user)
      return res
        .status(404)
        .json({ message: "no account found for this email" });
    const otpDeleted = await Otp.deleteMany({ id: found_user._id });
    console.log(otpDeleted);

    if (otpDeleted.acknowledged === true) {
      // generating, sending and saving otp code to database
      const otpCode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
      try {
        const currentTime = new Date().getTime();
        const minutes = 10;
        const otpExpirationTime = minutes * 60000;
        const saveOtp = new Otp({
          otp: otpCode,
          id: found_user._id,
          created: currentTime,
          expries: currentTime + otpExpirationTime,
        });
        await saveOtp.save();
        const sentMail = await transporter(
          found_user.email,
          found_user.firstName + " " + found_user.lastName,
          otpCode,
          "Paper",
          "Password reset"
        );
        console.log(sentMail);
        if (sentMail) {
          res.status(200).json({
            message: "Otp has been sent to this email " + found_user.email,
          });
        }
      } catch (e) {
        console.log("cant generate pin: ");
        console.log(e);
        res.status(500).json({ message: "An error occured" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured" });
  }
};

import { ActiveLoginAccount } from "../helpers/databaseSchema/ActiveAccount.js";
import { isMatch } from "../helpers/functions/validation.js";

// find the current account a user is  loged into
export const switchAcctController = async (req, res) => {
  // get the email and password from the form field
  const { loginId, businessId, userId } = req.param;
  try {
    // find the bussnes acct a user is in
    const found_account = await ActiveLoginAccount.findOne({
      _id: loginId,
    });
    if (!current_login_account) {
      res.status(404).json({ message: "No accoutn found" });
    } else {
      if (isMatch(found_account.userId, userId)) {
        const update_account = await ActiveLoginAccount.updateOne(
          { userId },
          { businessId }
        ); // send the users login and account info
        res.json({ account: update_account });
      } else {
        res
          .status(403)
          .json({ message: "Forbidden u can't switch account at this moment" });
      }
    }
  } catch (error) {
    console.log(error);
    res.json({ message: "an error occured" });
  }
};

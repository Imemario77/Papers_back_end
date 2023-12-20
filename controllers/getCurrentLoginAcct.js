import { ActiveLoginAccount } from "../helpers/databaseSchema/ActiveAccount.js";

// find the current account a user is  loged into
export const currentLoginController = async (req, res) => {
  const { id } = req.param;
  try {
    // find the bussnes acct a user is in
    const current_login_account = await ActiveLoginAccount.findOne({
      userId: id,
    });

    // send the users login and account info
    res.json({ account: current_login_account });
  } catch (error) {
    console.log(error);
    res.json({ message: "an error occured" });
  }
};

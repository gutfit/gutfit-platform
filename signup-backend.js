const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/signup", (req, res) => {
  const { email, firstName, lastName, role } = req.body;

  console.log("New signup:", req.body);

  // Create Nextcloud user
  exec(
    `docker exec gutfit_nextcloud.1.jxdsh14mtvaqr5fh1xezoofyn php occ user:add '${email}' --password-from-env --display-name '${firstName} ${lastName}'`,
    (error, stdout) => {
      if (error) {
        console.error("Nextcloud user creation failed:", error);
        return res
          .status(500)
          .json({ error: "Failed to create Nextcloud account" });
      }

      console.log("Nextcloud user created:", stdout);
      res.json({
        message:
          "Account created successfully! Check your email for login details.",
      });
    }
  );
});

app.listen(3000, () => {
  console.log("Signup backend running on port 3000");
});

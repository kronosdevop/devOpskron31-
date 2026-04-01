// import axios from "axios";
import { get_current_user_web_portal } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export const get_current_details = {
  data: () => ({
    currentObject: {},
  }),
  methods: {
    async get_current_details() {
      try {
        let result = await API.graphql(
          graphqlOperation(get_current_user_web_portal, {})
        );
        var response = JSON.parse(result.data.get_current_user_web_portal);

        if (response.Status == "SUCCESS") {
          this.currentObject = response.details;
          this.$store.commit("SetUserObj", this.currentObject);
          return this.currentObject;
        } else {
          this.currentObject = {};
          localStorage.removeItem("selectedNavItem");
          this.$router.push("/");
          return null;
        }
      } catch (error) {
        console.error("Error in get_current_details:", error);

        // Check if error is "No current user" or authentication related
        if (
          error.message &&
          (error.message.includes("No current user") ||
            error.message.includes("No current user") ||
            error.message.includes("Authentication") ||
            error.message.includes("Unauthorized"))
        ) {
          // Clear store and redirect to login
          this.$store.commit("SetAuth", false);
          this.$store.commit("SetUserEmail", "");
          this.$store.commit("SetUserObj", {});
          this.$store.commit("Setloginaudit", false);

          // Clear localStorage
          localStorage.removeItem("selectedNavItem");
          localStorage.removeItem("vuex-state");

          // Redirect to login page
          this.$router.push("/");
        }

        this.currentObject = {};
        return null;
      }
      // await axios({
      //   method: "POST",
      //   url: "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/get_current_user_web_portal",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "x-api-key": "EgnUv9Owyt8KacFkfnB44as9uqCT8ZaF9FZ1cVU6",
      //   },
      //   data: {
      //     user_email_id: this.$store.getters.GetUserEmail
      //   },
      // })
      //   .then((res) => {

      //     if (res.data.Status == "SUCCESS") {
      //       this.currentObject = res.data.details;
      //     } else {

      //       this.currentObject = {}
      //       this.$router.push("/");
      //     }
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     this.currentObject = {}

      //   });
    },
  },
};

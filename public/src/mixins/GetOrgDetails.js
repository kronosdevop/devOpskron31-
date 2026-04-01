import {
  API,
  graphqlOperation
} from "aws-amplify";
import {
  get_organization_detils
} from "@/graphql/queries.js";
// import { Auth } from "aws-amplify";

export const get_Org_details = {
  data: () => ({
    orgDetails: {},

  }),
  methods: {
    async get_Org_details() {
      var data = this.$store.getters.GetUserObj;
      
      // Check if user data exists and has organization info
      if (!data || !data.organization || !data.organization.organization_id) {
        console.error('User data or organization data not available');
        this.orgDetails = {};
        this.$store.commit("SetOrgDetails", {});
        return;
      }
      
      try {
        let result = await API.graphql(
          graphqlOperation(get_organization_detils, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        var response = JSON.parse(result.data.get_organization_detils);
        
        // Check if response is valid
        if (!response || !response.organization) {
          console.error('Invalid organization response');
          this.orgDetails = {};
          this.$store.commit("SetOrgDetails", {});
          return;
        }
        
        this.orgDetails = response;
        this.$store.commit("SetOrgDetails", this.orgDetails);

        if (response.organization.organization_logo != undefined) {
          if (response.organization.organization_logo.includes("/N/A")) {
            this.$store.commit("SetOrgLogo", '')
            this.$store.commit("SetimageCheck", false)
          } else {
            this.$store.commit("SetOrgLogo", response.organization.organization_logo)
            this.$store.commit("SetimageCheck", true)
          }
        }

      } catch (error) {
        console.error('Error fetching organization details:', error);
        
        // Don't redirect to login on error, just set empty data
        this.orgDetails = {};
        this.$store.commit("SetOrgDetails", {});
      }
    },
    async sign_out() {
      this.$router.push("/");
      // var data = this.$store.getters.GetUserObj;
      // await Auth.signOut(data.user.user_email_id);
      this.$store.commit("SetFirstSignup", false);
      this.$store.commit("Setappadmins", false);
      this.$store.commit("SetUserEmail", "");
      this.$store.commit("SetUserEmailTeam", "");
      this.$store.commit("SetOrgDetails", {});
      this.$store.commit("SetUserObj", {});
      localStorage.setItem("allMessages", []);
      // this.$store.getters.GetMqttClient.disconnect();
    },
  }
}
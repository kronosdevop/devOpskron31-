import {
  API,
  graphqlOperation
} from "aws-amplify";
import {
  get_particular_user_details
} from "@/graphql/queries.js";

export const get_selected_user_details = {
  data: () => ({
    fetchUserInfo: {},

  }),
  methods: {
    async get_selected_user_details(val) {


      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_user_details, {
            input: {
              user_email_id: this.$store.getters.GetUserEmailTeam,
              user_status: val == undefined ? "ACTIVE" : val
            }

          })
        );

        this.fetchUserInfo = {};

        var response = JSON.parse(result.data.get_particular_user_details).data;

        this.fetchUserInfo = response;
      } catch (error) {
        this.fetchUserInfo = {};

      }
    },
  }
}
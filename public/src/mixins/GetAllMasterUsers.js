import { API, graphqlOperation } from "aws-amplify";
import { list_users } from "@/graphql/queries.js";

export const get_master_users = {
  data: () => ({
    masterUsersArray: [],
  }),
  methods: {
    async get_master_users() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_users, {
            organization_id: data.organization.organization_id,
            user_status: "ALL",
            user_type: "MEMBER",
            limit: 1000,
            next_token: null,
            name_search: "",
          })
        );
        this.masterUsersArray = [];
        var response = result.data.list_users;

        this.masterUsersArray = response.details;
      } catch (error) {
        this.masterUsersArray = [];
      }
    },
  },
};

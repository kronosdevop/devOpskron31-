import { API, graphqlOperation } from "aws-amplify";
import { all_users_of_organization } from "@/graphql/queries.js";

export const get_all_org_users = {
  data: () => ({
    orgUsers: [],
  }),
  methods: {
    async get_all_org_users() {
            this.orgUsers = [];

      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(all_users_of_organization, {
            input: {
              organization_id: data.organization.organization_id,
              name_search:
                this.$store.getters.Getnamesearch == ""
                  ? undefined
                  : this.$store.getters.Getnamesearch,
            },
          })
        );
        var response = JSON.parse(result.data.all_users_of_organization);

        this.orgUsers = response.data || [];
      } catch (error) {}
    },
  },
};

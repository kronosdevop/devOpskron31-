import { manage_splay_awards_policies } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export const GetRewardPolicy = {
  data: () => ({
    loading: false,
    ListRewardPolicy: [],
  }),

  methods: {
    async GetRewardPolicyMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(manage_splay_awards_policies, {
            input: {
              action_type: "LIST",
            },
          }),
        );
        let resultObj = JSON.parse(result.data.manage_splay_awards_policies);
        if (resultObj.Status === "SUCCESS") {
          this.ListRewardPolicy = resultObj.data;
        }
      } catch (error) {
        this.ListRewardPolicy = [];
      } finally {
        this.loading = false;
      }
    },
  },
};

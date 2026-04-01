import { create_list_edit_delete_sla_rule } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllListSla = {
  data: () => ({
    loading: false,
    ListAllSla: [],
  }),
  methods: {
    async GetAllListSlaMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_sla_rule, {
            input: {
              action_type: "LIST",
            },
          })
        );
        let resultObj = JSON.parse(result.data.create_list_edit_delete_sla_rule);
        if (resultObj.Status === "SUCCESS"){
          this.ListAllSla = resultObj.data;
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.ListAllSla = [];
      }
    },
  },
};

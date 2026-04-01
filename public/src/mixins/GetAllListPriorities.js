import { create_list_edit_delete_priority } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllListPriorities = {
  data: () => ({
    ListAllPriorities: [],
  }),
  methods: {
    async GetAllListPrioritiesMethod() {
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_priority, {
            input: {
              action_type: "LIST",
            },
          })
        );
        console.log("Result", result);
        let resultObj = JSON.parse(result.data.create_list_edit_delete_priority)
        if (resultObj.Status === 'SUCCESS'){
            this.ListAllPriorities = resultObj.data;
        }
      } catch (error) {
        this.ListAllPriorities = [];
      }
    },
  },
};

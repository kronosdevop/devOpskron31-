import { create_list_edit_delete_ticket_type } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllListTicketTypes = {
  data: () => ({
    loading: false,
    ListAllTicketTypes: [],
  }),
  methods: {
    async GetAllListTicketTypesMethod(default_category) {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_ticket_type, {
            input: {
              action_type: "LIST",
              default_category: default_category,
            },
          })
        );
        console.log("Result", result);
        let resultObj = JSON.parse(
          result.data.create_list_edit_delete_ticket_type
        );
        if (resultObj.Status === "SUCCESS") {
          this.ListAllTicketTypes = resultObj.data;
        }
        this.loading = false;
      } catch (error) {
        this.loading = true;
        this.ListAllTicketTypes = [];
      }
    },
  },
};

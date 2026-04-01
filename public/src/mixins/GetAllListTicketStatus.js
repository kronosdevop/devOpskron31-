import { create_list_edit_delete_ticket_status } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllListTicketStatus = {
  data: () => ({
    loading: false,
    ListAllTicketStatus: [],
  }),
  methods: {
    async GetAllListTicketStatusMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_ticket_status, {
            input: {
              action_type: "LIST",
            },
          })
        );
        let resultObj = JSON.parse(result.data.create_list_edit_delete_ticket_status);
        if (resultObj.Status === "SUCCESS"){
            this.ListAllTicketStatus = resultObj.data;
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.ListAllTicketStatus = [];
      }
    },
  },
};

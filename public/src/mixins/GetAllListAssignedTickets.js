import { list_my_tickets } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllListAssignedTickets = {
  data: () => ({
    loading: false,
    ListAllAssignedTickets: [],
  }),
  methods: {
    async GetAllListAssignedTicketsMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(list_my_tickets, {
            input: {},
          })
        );
        let resultObj = JSON.parse(result.data.list_my_tickets);
        if (resultObj.Status === "SUCCESS") {
          this.ListAllAssignedTickets = [
            ...(resultObj.data.assigned_to_me || []),
            ...(resultObj.data.unclaimed_tickets || []),
          ];
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.ListAllAssignedTickets = [];
      }
    },
  },
};

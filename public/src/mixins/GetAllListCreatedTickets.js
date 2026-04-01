import { list_my_tickets } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllListCreatedTickets = {
  data: () => ({
    loading: false,
    ListAllCratedTickets: [],
  }),
  methods: {
    async GetAllListCreatedTicketsMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(list_my_tickets, {
            input: {},
          })
        );
        let resultObj = JSON.parse(result.data.list_my_tickets);
        console.log(resultObj);
        if (resultObj.Status === "SUCCESS") {
          this.ListAllCratedTickets = [
            ...(resultObj.data.assigned_to_me || []),
            ...(resultObj.data.unclaimed_tickets || []),
            ...(resultObj.data.assigned_by_me || []),
          ];
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.ListAllCratedTickets = [];
      }
    },
  },
};

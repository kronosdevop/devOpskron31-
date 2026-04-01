import { list_all_tickets } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllListTickets = {
  data: () => ({
    loading: false,
    ListAllTickets: [],
  }),
  methods: {
    async GetAllListTicketsMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(list_all_tickets, {
            input: {},
          })
        );
        let resultObj = JSON.parse(result.data.list_all_tickets);
        if (resultObj.Status === "SUCCESS") {
          this.ListAllTickets = resultObj.data.tickets;
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.ListAllTickets = [];
      }
    },
  },
};

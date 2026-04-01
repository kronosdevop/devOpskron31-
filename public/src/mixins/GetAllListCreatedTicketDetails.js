import { get_ticket_by_id } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllListCreatedTicketDetails = {
  data: () => ({
    loading: false,
    ListAllCreatedTicketDetails: [],
  }),
  methods: {
    async GetAllListCreatedTicketDetailsMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(get_ticket_by_id, {
            input: {
              ticket_id: this.StoreObj.ticket_id,
            },
          })
        );
        console.log("Result", result);
      } catch (error) {}
    },
  },
};

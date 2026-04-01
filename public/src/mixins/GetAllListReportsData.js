import { get_admin_tickets_report } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllListReportsData = {
  data: () => ({
    loading: false,
    ListAllReportsData: [],
  }),
  methods: {
    async GetAllListReportsDataMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(get_admin_tickets_report, {
            input: {
              start_date: this.EnteredFromDate,
              end_date: this.EnteredToDate,
              assigned_to_email: this.OrgMembers,
            },
          })
        );
        let resultObj = JSON.parse(result.data.get_admin_tickets_report);
        if (resultObj.Status === "SUCCESS") {
          this.ListAllReportsData = resultObj.data;
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.ListAllReportsData = [];
      }
    },
  },
};

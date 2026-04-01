import { list_monthly_attendence_report_configuration } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllListMonthlyReportMembers = {
  data: () => ({
    loading: false,
    ListAllListMonthlyReportMembers: [],
  }),

  methods: {
    async GetAllListMonthlyReportMembersMethod() {
      this.loading = false;
      try {
        const result = await API.graphql(
          graphqlOperation(list_monthly_attendence_report_configuration, {
            input: {},
          })
        );
        let resultObj = JSON.parse(result.data.list_monthly_attendence_report_configuration);
        if (resultObj.Status === 'SUCCESS'){
            this.ListAllListMonthlyReportMembers = resultObj.data;
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.ListAllListMonthlyReportMembers = [];
      }
    },
  },
};
import { list_daily_attendence_report_configuration } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllDailyReportMembers = {
  data: () => ({
    loading: false,
    ListAllDailyReportMembers: [],
  }),
  methods: {
    async GetAllDailyReportMembersMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(list_daily_attendence_report_configuration, {
            input: {},
          })
        );
        let resultObj = JSON.parse(
          result.data.list_daily_attendence_report_configuration
        );
        if (resultObj.Status === "SUCCESS") {
          this.ListAllDailyReportMembers = resultObj.data;
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.ListAllDailyReportMembers = [];
      }
    },
  },
};
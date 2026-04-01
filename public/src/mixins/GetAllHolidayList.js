import { Get_holiday_list_portal_v1 } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllHolidayList = {
  data: () => ({
    ListAllHolidays: [],
  }),
  methods: {
    async GetAllHolidayListMethod() {
      var data = this.$store.getters.GetUserObj;
      try {
        const result = await API.graphql(
          graphqlOperation(Get_holiday_list_portal_v1, {
            input: {
              organization_id: data.organization.organization_id,
              holiday_year: new Date().getFullYear(),
            },
          })
        );
        let resultObj = JSON.parse(result.data.Get_holiday_list_portal_v1);
        if (resultObj.Status === "SUCCESS") {
          this.ListAllHolidays = resultObj.Data;
        }
      } catch (error) {
        this.ListAllHolidays = [];
      }
    },
  },
};

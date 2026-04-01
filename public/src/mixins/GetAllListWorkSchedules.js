import { create_list_edit_delete_work_schedule } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllListWorkSchedules = {
  data: () => ({
    loading: false,
    ListAllWorkSchedules: [],
  }),
  methods: {
    async GetAllListWorkSchedulesMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_work_schedule, {
            input: {
              action_type: "LIST",
            },
          })
        );
        let resultObj = JSON.parse(result.data.create_list_edit_delete_work_schedule);
        if (resultObj.Status === "SUCCESS"){
            this.ListAllWorkSchedules = resultObj.data;
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.ListAllWorkSchedules = [];
      }
    },
  },
};

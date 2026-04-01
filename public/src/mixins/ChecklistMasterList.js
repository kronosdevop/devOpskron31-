import { API, graphqlOperation } from "aws-amplify";
import { list_master_checklist } from "@/graphql/queries.js";

export const get_checklist_master = {
  data: () => ({
    checklistMasterItem: [],
  }),
  methods: {
    async get_checklist_master() {
      try {
        let result = await API.graphql(
          graphqlOperation(list_master_checklist, {
            input: {
            },
          })
        );
        this.checklistMasterItem = [];
        var response = JSON.parse(result.data.list_master_checklist);
        if (response.Status == "SUCCESS") {
          this.checklistMasterItem = response.data;
          // checklistMaster.forEach((element) => {
          //   this.checklistMasterItem.push({
          //     text: element.checklist_name,
          //     value: element.checklist_id,
          //   });
          // });
        }
      } catch (error) {
        //  console.log(error)
      }
    },
  },
};

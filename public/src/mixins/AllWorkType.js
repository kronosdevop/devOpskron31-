import {get_worktypes} from '@/graphql/queries.js';
import {API , graphqlOperation} from "aws-amplify"

export const Worktype_list = {
    data: () => ({
       worktypeList :[],
    }),
    methods: {
        async Worktype_list() {
          try {
            let result = await API.graphql(
              graphqlOperation(get_worktypes, {
                input: {
                },
              })
            );
            this.worktypeList = [];
            var response = JSON.parse(result.data.get_worktypes);
            if (response.Status == "SUCCESS") {
  
              this.worktypeList = response.worktypes;
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
      }
}
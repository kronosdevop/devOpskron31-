import {
    API,
    graphqlOperation
} from "aws-amplify";
import { create_list_edit_delete_work_shift_timings } from "@/graphql/mutations.js";


export const get_work_shifts = {
    data: () => ({
          workshifts:[],
       
    }),
    methods: {
       async get_work_shifts() {
  try {
    const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_work_shift_timings, {
            input: { action_type: "LIST" },
          })
        );

    const response = JSON.parse(
      result.data.create_list_edit_delete_work_shift_timings
    );

    this.workshifts = response.data;
    return response.data;   // ✅ RETURN
  } catch (error) {
    this.workshifts = [];
    return [];              // ✅ RETURN
  }
},
    }
}
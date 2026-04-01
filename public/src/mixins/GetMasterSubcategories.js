import {
  API,
  graphqlOperation
} from "aws-amplify";
import {
  quotation_sub_categories
} from "@/graphql/mutations.js";

export const get_sub_categories = {
  data: () => ({
    MasterSubCategories: [],

  }),
  methods: {
    async get_sub_categories() {

      try {
        let result = await API.graphql(
          graphqlOperation(quotation_sub_categories, {
            input: {

              action_type: "LIST",
            },
          })
        );
        this.MasterSubCategories = [];
        var response = JSON.parse(result.data.quotation_sub_categories);
        if (response.Status == "SUCCESS") {
          this.MasterSubCategories = response.data;
        }
      } catch (error) {
        //  console.log(error)
      }
    },
  }
}
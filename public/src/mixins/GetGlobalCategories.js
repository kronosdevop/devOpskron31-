import {
  API,
  graphqlOperation
} from "aws-amplify";
import {
  items_categories
} from "@/graphql/mutations.js";

export const get_global_categories = {
  data: () => ({
    masterGlobalCategories: [],

  }),
  methods: {
    async get_global_categories() {

      try {
        let result = await API.graphql(
          graphqlOperation(items_categories, {
            input: {

              action_type: "LIST",
            },
          })
        );
        this.masterGlobalCategories = [];
        var response = JSON.parse(result.data.items_categories);
        if (response.Status == "SUCCESS") {
          this.masterGlobalCategories = response.data;
        }
      } catch (error) {
        //  console.log(error)
      }
    },
  }
}
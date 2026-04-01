import { create_list_edit_delete_category } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllListCategories = {
  data: () => ({
    loading: false,
    ListAllCategories: [],
  }),
  methods: {
    async GetAllListCategoriesMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_category, {
            input: {
              action_type: "LIST",
            },
          })
        );
        let resultObj = JSON.parse(result.data.create_list_edit_delete_category);
        if (resultObj.Status === "SUCCESS"){
            this.ListAllCategories = resultObj.data;
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.ListAllCategories = [];
      }
    },
  },
};

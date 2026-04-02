import { create_list_edit_delete_splay_categories } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllCategories = {
  data: () => ({
    loading: false,
    ListCustomCategories: [],
    ListDefaultCategories: [],
  }),

  methods: {
    async GetAllCategoriesMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_splay_categories, {
            input: {
              action_type: "LIST",
            },
          }),
        );
        let resultObj = JSON.parse(
          result.data.create_list_edit_delete_splay_categories,
        );
        if (resultObj.Status === "SUCCESS") {
          this.ListCustomCategories = resultObj.data.custom_categories;
          this.ListDefaultCategories = resultObj.data.default_categories;
        }
        this.loading = false;
      } catch (error) {
        this.ListCustomCategories = [];
        this.ListDefaultCategories = [];
      } finally {
        this.loading = false;
      }
    },
  },
};

import { create_list_edit_delete_splay_categories } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllCustomCategories = {
  data: () => ({
    loading: false,
    ListAllCustomCategories: [],
  }),

  methods: {
    async GetAllCustomCategoriesMethod() {
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
          this.ListAllCustomCategories = resultObj.data.filter(
            (item) => item.repository_source === "CUSTOM",
          );
        }
        this.loading = false;
      } catch (error) {
        this.ListAllCustomCategories = [];
      } finally {
        this.loading = false;
      }
    },
  },
};

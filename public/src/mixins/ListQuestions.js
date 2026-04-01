import { create_list_edit_delete_splay_questions } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export const ListQuestions = {
  data: () => ({
    loading: false,
    ListAllQuestions: [],
  }),

  methods: {
    async ListQuestionsMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_splay_questions, {
            input: {
              action_type: "LIST",
              splay_category_id: this.StoreObj.splay_category_id,
            },
          }),
        );
        let resultObj = JSON.parse(
          result.data.create_list_edit_delete_splay_questions,
        );
        if (resultObj.Status === "SUCCESS") {
          this.ListAllQuestions = resultObj.data;
        }
        this.loading = false;
      } catch (error) {
        this.ListAllQuestions = [];
      } finally {
        this.loading = false;
      }
    },
  },
};

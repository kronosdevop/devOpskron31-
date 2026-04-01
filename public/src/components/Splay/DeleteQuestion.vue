<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogDeleteQuestion" max-width="450px" persistent>
      <v-card class="d-flex justify-center" rounded="lg">
        <!--Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Delete Question </span>
          <v-btn
            icon
            variant="text"
            @click="DialogDeleteQuestionEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!--Text field-->
        <div class="d-flex justify-center pa-4 font-weight-bold">
          Are you sure you want to delete question
          {{ StoreObj.splay_question_text }}?
        </div>

        <!--Button-->
        <v-card-actions class="d-flex justify-center mt-n4">
          <v-btn
            variant="flat"
            size="small"
            color="primary"
            @click="DeleteQuestion"
            :loading="loading"
          >
            Delete
            <template #loader>
              <v-progress-circular indeterminate color="white" />
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { create_list_edit_delete_splay_questions } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogDeleteQuestion: Boolean, StoreObj: Object },

  components: { SnackBar },

  data: () => ({
    loading: false,

    SnackBarComponent: {},
  }),

  methods: {
    async DeleteQuestion() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_splay_questions, {
            input: {
              action_type: "DELETE",
              splay_category_id: this.StoreObj.splay_category_id,
              splay_question_id: this.StoreObj.splay_question_id,
            },
          }),
        );
        let resultObj = JSON.parse(
          result.data.create_list_edit_delete_splay_questions,
        );
        if (resultObj && resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: resultObj.Message,
          };
        }
        this.loading = false;
        this.DialogDeleteQuestionEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to delete question, try again",
        };
      }
      this.loading = false;
    },
    DialogDeleteQuestionEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
  },
};
</script>

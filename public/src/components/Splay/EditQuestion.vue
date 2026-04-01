<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogEditQuestion" max-width="600px" persistent>
      <v-card class="d-flex justify-center" rounded="lg">
        <!--Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Edit Question </span>
          <v-btn
            icon
            variant="text"
            @click="DialogEditQuestionEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!--Form Fields-->
        <v-form ref="form">
          <v-row no-gutters class="pa-5">
            <!--Question-->
            <v-col cols="12" class="mt-n3">
              <div class="font-weight-bold ml-1">
                Question <span class="text-error ml-1">*</span>
              </div>
              <v-textarea
                v-model="edited_question"
                rounded="lg"
                rows="2"
                variant="outlined"
                class="mt-2"
                maxlength="150"
                :counter="150"
                :rules="[(v) => !!v || 'Required']"
              />
            </v-col>

            <!--Option 1-->
            <v-col cols="6" class="mt-n1">
              <div class="font-weight-bold ml-1">
                Option One <span class="text-error ml-1">*</span>
              </div>
              <div class="d-flex align-center">
                <v-checkbox
                  :model-value="correctOption === 1"
                  @update:model-value="correctOption = 1"
                  color="green"
                />
                <v-text-field
                  v-model="edited_optionOne"
                  rounded="lg"
                  variant="outlined"
                  density="compact"
                  class="mr-2 mt-2"
                  maxlength="35"
                  :counter="35"
                  :rules="[(v) => !!v || 'Required']"
                />
              </div>
            </v-col>

            <!--Option 2-->
            <v-col cols="6" class="mt-n1">
              <div class="font-weight-bold ml-1">
                Option Two <span class="text-error ml-1">*</span>
              </div>
              <div class="d-flex align-center">
                <v-checkbox
                  :model-value="correctOption === 2"
                  @update:model-value="correctOption = 2"
                  color="green"
                />
                <v-text-field
                  v-model="edited_optiontwo"
                  rounded="lg"
                  variant="outlined"
                  density="compact"
                  class="mt-2"
                  maxlength="35"
                  :counter="35"
                  :rules="[(v) => !!v || 'Required']"
                />
              </div>
            </v-col>

            <!--Option 3-->
            <v-col cols="6">
              <div class="font-weight-bold ml-1">
                Option Three <span class="text-error ml-1">*</span>
              </div>
              <div class="d-flex align-center">
                <v-checkbox
                  :model-value="correctOption === 3"
                  @update:model-value="correctOption = 3"
                  color="green"
                />
                <v-text-field
                  v-model="edited_optionThree"
                  rounded="lg"
                  variant="outlined"
                  density="compact"
                  class="mr-2 mt-2"
                  maxlength="35"
                  :counter="35"
                  :rules="[(v) => !!v || 'Required']"
                />
              </div>
            </v-col>

            <!--Option 4-->
            <v-col cols="6">
              <div class="font-weight-bold ml-1">
                Option Four <span class="text-error ml-1">*</span>
              </div>
              <div class="d-flex align-center">
                <v-checkbox
                  :model-value="correctOption === 4"
                  @update:model-value="correctOption = 4"
                  color="green"
                />
                <v-text-field
                  v-model="edited_optionFour"
                  rounded="lg"
                  variant="outlined"
                  density="compact"
                  class="mt-2"
                  maxlength="35"
                  :counter="35"
                  :rules="[(v) => !!v || 'Required']"
                />
              </div>
            </v-col>
          </v-row>
        </v-form>

        <!--Button-->
        <v-card-actions class="d-flex justify-center mt-n4">
          <v-btn
            variant="flat"
            size="small"
            color="primary"
            @click="ValidateForm"
            :loading="loading"
          >
            Edit
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
  props: { DialogEditQuestion: Boolean, StoreObj: Object },

  components: { SnackBar },

  data: () => ({
    edited_question: "",
    edited_optionOne: "",
    edited_optiontwo: "",
    edited_optionThree: "",
    edited_optionFour: "",
    edited_answer: "",

    loading: false,

    correctOption: null,

    SnackBarComponent: {},
  }),

  watch: {
    DialogEditQuestion(val) {
      if (val) {
        this.edited_question = this.StoreObj.splay_question_text;
        this.edited_optionOne = this.StoreObj.splay_option_1;
        this.edited_optiontwo = this.StoreObj.splay_option_2;
        this.edited_optionThree = this.StoreObj.splay_option_3;
        this.edited_optionFour = this.StoreObj.splay_option_4;
        this.edited_answer = this.StoreObj.splay_correct_option;
        this.correctOption =
          this.StoreObj.splay_correct_option === this.StoreObj.splay_option_1
            ? 1
            : this.StoreObj.splay_correct_option ===
              this.StoreObj.splay_option_2
            ? 2
            : this.StoreObj.splay_correct_option ===
              this.StoreObj.splay_option_3
            ? 3
            : this.StoreObj.splay_correct_option ===
              this.StoreObj.splay_option_4
            ? 4
            : null;
      }
    },
  },

  methods: {
    async ValidateForm() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.EditQuestion();
      }
    },
    async EditQuestion() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_splay_questions, {
            input: {
              action_type: "UPDATE",
              splay_category_id: this.StoreObj.splay_category_id,
              splay_question_id: this.StoreObj.splay_question_id,
              splay_question_text: this.edited_question,
              splay_option_1: this.edited_optionOne,
              splay_option_2: this.edited_optiontwo,
              splay_option_3: this.edited_optionThree,
              splay_option_4: this.edited_optionFour,
              splay_correct_option: (this.edited_answer =
                this.correctOption === 1
                  ? this.edited_optionOne
                  : this.correctOption === 2
                  ? this.edited_optiontwo
                  : this.correctOption === 3
                  ? this.edited_optionThree
                  : this.correctOption === 4
                  ? this.edited_optionFour
                  : ""),
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
        this.DialogEditQuestionEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to create question, try again",
        };
      }
      this.loading = false;
    },
    DialogEditQuestionEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
  },
};
</script>

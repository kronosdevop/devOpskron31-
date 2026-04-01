<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogCreateQuestion" max-width="600px" persistent>
      <v-card rounded="lg">
        <!--Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Create Question </span>
          <v-btn
            icon
            variant="text"
            @click="DialogCreateQuestionEmit(1)"
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
                v-model="question"
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
                  v-model="optionOne"
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
                  v-model="optiontwo"
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
                  v-model="optionThree"
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
                  v-model="optionFour"
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
        <v-card-actions class="d-flex justify-center mt-n6">
          <v-btn
            variant="flat"
            size="small"
            color="primary"
            @click="ValidateForm"
            :loading="loading"
            :disabled="!correctOption"
          >
            Create
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
  props: { DialogCreateQuestion: Boolean, StoreObj: Object },

  components: { SnackBar },

  data: () => ({
    question: "",
    optionOne: "",
    optiontwo: "",
    optionThree: "",
    optionFour: "",
    answer: "",

    loading: false,

    correctOption: null,

    SnackBarComponent: {},
  }),

  watch: {
    DialogCreateQuestion(val) {
      if (!val) {
        this.$refs.form.reset();
        this.correctOption = null;
      }
    },
  },

  methods: {
    async ValidateForm() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.CreateQuestion();
      }
    },
    async CreateQuestion() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_splay_questions, {
            input: {
              action_type: "CREATE",
              splay_category_id: this.StoreObj.splay_category_id,
              splay_question_text: this.question,
              splay_option_1: this.optionOne,
              splay_option_2: this.optiontwo,
              splay_option_3: this.optionThree,
              splay_option_4: this.optionFour,
              splay_correct_option: (this.answer =
                this.correctOption === 1
                  ? this.optionOne
                  : this.correctOption === 2
                  ? this.optiontwo
                  : this.correctOption === 3
                  ? this.optionThree
                  : this.correctOption === 4
                  ? this.optionFour
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
        this.DialogCreateQuestionEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to create question, try again",
        };
      }
      this.loading = false;
    },
    DialogCreateQuestionEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
  },
};
</script>

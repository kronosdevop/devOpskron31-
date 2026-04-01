<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="editTagDialog"
      @update:model-value="editTagDialog = $event"
      persistent
      transition="dialog-bottom-transition"
      max-width="500"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Edit Tag</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  v-model="assetTagName"
                  label="Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class=""
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-combobox
                  v-model="tagSelection"
                  chips
                  clearable
                  multiple
                  density="compact"
                  variant="outlined"
                  :rules="[
                    (v) => !!v.length || 'At least one value is required',
                  ]"
                  label="Values"
                  hint="Press the Enter key after entering each tag"
                  hide-selected
                  append-icon=""
                  class=""
                >
                  <template
                    v-slot:selection="{ attrs, item, select, selected }"
                  >
                    <v-chip
                      x-small
                      v-bind="attrs"
                      :input-value="selected"
                      close
                      @click="select"
                      @click:close="removecc(item)"
                    >
                      <strong>{{ item }}</strong
                      >&nbsp;
                    </v-chip>
                  </template>
                </v-combobox>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="validate_data()"
            dark
            class="text-capitalize cardCss button-corner text-white"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
                <script>
/* eslint-disable */
import { create_list_delete_tags } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    editTagDialog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
      assetTagName: "",
      tagSelection: [],
    };
  },
  watch: {
    editTagDialog: {
      async handler() {
        this.assetTagName = "";
        this.tagSelection = [];
        this.assetTagName = this.rowInfo.tag_name;
        this.tagSelection = this.rowInfo.sub_tags;
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.assetTagName = "";
      this.tagSelection = [];
    },

    removecc(item) {
      this.tagSelection.splice(this.tagSelection.indexOf(item), 1);
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.edit_mutation();
      }
    },

    async edit_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_delete_tags, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "UPDATE_TAGS",
              tag_name: this.assetTagName,
              sub_tag: JSON.stringify(this.tagSelection),
              tag_id: this.rowInfo.tag_id,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_list_delete_tags);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.assetTagName = "";
          this.tagSelection = [];
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
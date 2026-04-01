<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="createAssetDialog"
      @update:model-value="createAssetDialog = $event"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Create Tag</div></v-toolbar-title
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
                  class="mr-2"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner text-white"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/*eslint-disable*/
import { create_list_delete_tags } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    createAssetDialog: Boolean,
    existingRecords: [],
  },
  data() {
    return {
      assetTagName: "",
      loading: false,
      fixedTagPrefixes: ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
    };
  },
  watch: {
    createAssetDialog: {
      async handler() {
        this.assetTagName = "";
      },
      immediate: true,
    },
  },
  // computed: {
  //   computedDateFormatted() {
  //     return this.formatDate(this.date);
  //   },
  //   verficationdaterule() {
  //     if (this.isverification == true) {
  //       return [(v) => !!v || "Required"];
  //     } else {
  //       return [];
  //     }
  //   },
  // },
  methods: {
    getcal() {
      this.modal = true;
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.assetTagName = "";
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.add_mutation();
      }
    },

    async add_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_delete_tags, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "CREATE_TAGS",
              tag_name: this.assetTagName,
              tag_prefix: this.get_next_available_tags(),
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_list_delete_tags);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);

          this.assetTagName = "";
        } else {
          this.loading = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    get_next_available_tags() {
      const usedPrefixes = new Set(
        this.existingRecords.map((tag) => tag.tag_prefix)
      );

      // Find the first fixed tag prefix that is not used
      for (const prefix of this.fixedTagPrefixes) {
        if (!usedPrefixes.has(prefix)) {
          return prefix; // Return the first unused prefix
        }
      }

      // If all prefixes are used, you can handle that case here
      return null; // Or handle as needed
    },
  },
};
</script>

<style>
</style>